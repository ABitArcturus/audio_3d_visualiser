import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';

class ThreeVisualiserUpDown extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraY = 30;
    this.cameraZ = 10;

    this.setCameraAndTarget();

    this.lineCounter = 0;

    this.generateBasicGUI();
    this.gui.remove(this.controllerMaxLines);
    this.config.maxLines = 200;
  }
  update = () => {

    // calls the method from the base class to generate points based on analyser data
    const pointsXAxisLines = this.getPointsForSpectralFrame();

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsXAxisLines);
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(this.config.lineColor) });
    const line = new THREE.Line(geometry, material);

    this.spectralFrameGroup.add(line);

    // adding an index to each line to be able to continuously move them up or down
    line.userData.index = this.lineCounter;
    this.lineCounter++;

    while (this.spectralFrameGroup.children.length > this.config.maxLines) {
      const oldLine = this.spectralFrameGroup.children[0];
      this.spectralFrameGroup.remove(oldLine);
      oldLine.geometry.dispose();
      oldLine.material.dispose();
    }
    // moving every second line up or down
    this.spectralFrameGroup.children.forEach((line) => {
      const index = line.userData.index;

      if (index % 2 === 0) {
        line.position.y -= 2;
      } else {
        line.position.y += 2;
      }
      line.position.z += this.spectralFrameSpacing + this.spectralFrameSpacingOffset;
      this.processSpectralFrameSpacingOffset();

      const transparentMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        color: new THREE.Color(this.config.lineColor),
        transparent: true,
        opacity: 0.1
      });

      line.material = transparentMaterial;
    });
    this.spectralFrameGroup.add(line);
    this.removeOldSpectralFrames();

    this.renderer.render(this.scene, this.camera);
  }
}
export default ThreeVisualiserUpDown;
