import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';

class ThreeVisualiserFlyingFadingLines extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraY = 30;
    this.cameraZ = 10;
    this.cameraZCounter = 0;
    this.moveDistance = 10;

    this.defaultCameraPosition = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ);
    this.defaultTarget = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ);

    this.camera.position.copy(this.defaultCameraPosition);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();

    this.generateBasicGUI();
    this.gui.remove(this.controllerResetView);

    this.controllerLineColor.setValue('#ff0000');
    this.config.isMoveCamera = false;
    this.config.maxLines = 150;
    this.gui.add(this, 'changeView1').name('change view to 1');
    this.gui.add(this, 'changeView2').name('change view to 2');

    this.controllerLineColor.setValue('#ffffff');
    this.controllerLevelOfDetail.setValue(1);
    this.controllerAmplitude.setValue(1);

    this.camera.position.set(652, 30, 196);

    this.gui.add(this.config, 'isMoveCamera').name('move').onChange((value) => {
      this.config.isMoveCamera = value;
    });

  }
  changeView1 = () => {
    this.controllerLineColor.setValue('#ff0000');
    this.controllerLevelOfDetail.setValue(1);
    this.controllerAmplitude.setValue(3);

    this.controls.target.set(this.cameraX, this.cameraY, this.camera.position.z - 100);
    this.camera.position.copy(this.defaultCameraPosition);
  }
  changeView2 = () => {
    this.controllerLineColor.setValue('#ffffff');
    this.controllerLevelOfDetail.setValue(1);
    this.controllerAmplitude.setValue(1);

    this.camera.position.set(652, 30, 196);
  }
  update = () => {

    // calls the method from the base class to generate points based on analyser data
    const pointsXAxisLines = this.getPointsForSpectralFrame();

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsXAxisLines);
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(this.config.lineColor) });
    const line = new THREE.Line(geometry, material);

    this.spectralFrameGroup.add(line);


    // moves front lines towards the camera
    for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
      const line = this.spectralFrameGroup.children[i];
      line.position.z += this.spectralFrameSpacing + this.spectralFrameSpacingOffset;

      const transparentMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(this.config.lineColor),
        transparent: true,
        opacity: 0.1
      });
      line.material = transparentMaterial;
    }
    this.processSpectralFrameSpacingOffset();
    this.removeOldSpectralFrames();

    // moving the camera a bit
    if (this.config.isMoveCamera) {
      if (this.cameraZCounter > 300) {
        this.moveDistance = -0.2;
      }
      if (this.cameraZCounter <= 0) {
        this.moveDistance = 0.4;
      }
      this.camera.position.z += this.moveDistance;
      this.cameraZCounter += this.moveDistance;
    }
  
    this.renderer.render(this.scene, this.camera);
  }
}
export default ThreeVisualiserFlyingFadingLines;

