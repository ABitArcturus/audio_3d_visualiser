import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';

class ThreeVisualiserFlyingLines extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraY = 30;
    this.cameraZ = 10;

    this.setCameraAndTarget();
    this.generateBasicGUI();
  }

  update = () => {

    // calls the method from the base class to generate points based on analyser data
    const pointsXAxisLines = this.getPointsForSpectralFrame();

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsXAxisLines);
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(this.config.lineColor) });
    const line = new THREE.Line(geometry, material);

    this.spectralFrameGroup.add(line);

    // moves front lines towards the camera and lowers them
    for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
      const line = this.spectralFrameGroup.children[i];
      line.position.y -= 1;
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

    this.renderer.render(this.scene, this.camera);
  }

}
export default ThreeVisualiserFlyingLines;
