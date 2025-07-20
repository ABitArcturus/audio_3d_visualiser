import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';
import * as dat from 'dat.gui';

class ThreeVisualiser3DMountains extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraY = 150;

    this.defaultCameraPosition = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ);
    this.defaultCameraTarget = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ - 250);

    this.defaultLightPosition = new THREE.Vector3(this.cameraX, 0, 0);
    this.defaultLightTarget = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ - 150);
    this.lightPositionZ = 0;
    this.isLightPositionZIncreasing = true;

    this.camera.position.copy(this.defaultCameraPosition);
    this.controls.target.copy(this.defaultCameraTarget);

    this.controls.update();

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.copy(this.defaultLightPosition);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    this.spectralFrameGroupPositionZ = -400;

    this.maxSpectralFrames = 200;
    this.spectralFrameGroup = new THREE.Group();
    this.scene.add(this.spectralFrameGroup);

    this.config = {
      color: '#00ffff',
      levelOfDetail: 4,
      amplitude: 1
    };

    this.gui = new dat.GUI();
    this.gui.addColor(this.config, 'color').name('color');
    this.gui.add(this, 'resetView').name('Reset view');
  }

  updateLightPosition = (x, y, z) => {

    this.defaultLightPosition.set(this.cameraX + x, 0 + y, this.cameraZ + z);
    this.directionalLight.position.copy(this.defaultLightPosition);
    this.sunMesh.position.copy(this.defaultLightPosition);
  };

  update = () => {

    const dataArray = this.analyser.analyse();

    // arrays to hold upper and lower points for mesh geometry
    const pointsA = [];
    const pointsB = [];

    let lastValue = dataArray[0];

    // analyser loop
    for (let i = 0; i < this.lineLength; i += 8) {

      if (i % this.config.levelOfDetail === 0 && i < dataArray.length) {
        lastValue = dataArray[i];
      }

      const x = i;
      const y = lastValue / this.config.amplitude;
      const z = 0;

      pointsA.push(new THREE.Vector3(x, y, 0)); // upper line/ top of mountain
      pointsB.push(new THREE.Vector3(x, 0, -2)); // lower line
    }

    // converting point pairs into triangles (2 triangles per segment)
    const vertices = [];
    for (let i = 0; i < pointsA.length - 1; i++) {
      const a1 = pointsA[i];
      const a2 = pointsA[i + 1];
      const b1 = pointsB[i];
      const b2 = pointsB[i + 1];

      vertices.push(
        a1.x, a1.y, a1.z,
        b1.x, b1.y, b1.z,
        a2.x, a2.y, a2.z,

        a2.x, a2.y, a2.z,
        b1.x, b1.y, b1.z,
        b2.x, b2.y, b2.z
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      side: THREE.DoubleSide,
      flatShading: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = this.spectralFrameSpacing;
    this.spectralFrameSpacing -= 2;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.spectralFrameGroup.add(mesh);

    // moving the group of all spectral frames towards the camera
    this.spectralFrameGroup.position.z = this.spectralFrameGroupPositionZ;
    this.spectralFrameGroupPositionZ += 2;

    // lowering the front mountains
    for (let i = 0; i < this.spectralFrameGroup.children.length / 1.2; i++) {
      const line = this.spectralFrameGroup.children[i];
      line.position.y -= 0.5;
    }

    // removing old spectral frames
    while (this.spectralFrameGroup.children.length > this.maxSpectralFrames) {
      const old = this.spectralFrameGroup.children[0];
      this.spectralFrameGroup.remove(old);
      old.geometry.dispose();
      old.material.dispose();
    }

    // animating light position back and forth on z axis
    this.directionalLight.position.copy(this.defaultLightPosition);

    if (this.lightPositionZ >= 100) {
      this.isLightPositionZIncreasing = false;
    } else if (this.lightPositionZ <= 0) {
      this.isLightPositionZIncreasing = true;
    }
    if (this.isLightPositionZIncreasing) {
      this.lightPositionZ += 0.25;
    } else {
      this.lightPositionZ -= 0.25;
    }

    this.directionalLight.position.z = this.lightPositionZ;
    this.directionalLight.target.position.copy(this.defaultLightTarget);

    this.controls.update(); // maintain camera focus on the default target when resetting view

    this.renderer.render(this.scene, this.camera);
  };
}

export default ThreeVisualiser3DMountains;
