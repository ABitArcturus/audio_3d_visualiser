import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';

class ThreeVisualiserMirrorLines extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraZ = 10;

    this.setCameraAndTarget();

    this.generateBasicGUI();

    this.config.maxLines = 400;
    this.gui.remove(this.controllerMaxLines);
    this.gui.add(this.config, 'maxLines', 2, 600).name('maximum lines').step(2);
    this.config.heightOfLines = 0;
    this.gui.add(this.config, 'heightOfLines', -50, 100).name('height of lines').step(1);
    this.config.isAdditionalEffect = false;
    this.controllerIsAdditionalEffect = this.gui.add(this.config, 'isAdditionalEffect').name('additional height of line support').onChange(() => { // todo rename
      this.config.doesMouseChangeHeight = false;
      this.controllerMouseChangesHeight.updateDisplay();
    })
    this.config.doesMouseChangeHeight = false;
    this.controllerMouseChangesHeight = this.gui.add(this.config, 'doesMouseChangeHeight').name('mouse changes height').onChange(() => {
      this.config.isAdditionalEffect = false;
      this.controllerIsAdditionalEffect.updateDisplay();
    });

    this.canvas = document.getElementById("threejs-container");

    let rendererSize = new THREE.Vector2();

    this.canvas.addEventListener('mousemove', (event) => {
      const canvasSize = this.renderer.getSize(rendererSize);
      const canvasWidth = canvasSize.x;
      const canvasHeight = canvasSize.y;
      this.mouseCanvasX = event.clientX - this.canvas.offsetLeft;
      this.mouseCanvasY = event.clientY - this.canvas.offsetTop

      // the center of the height becomes 0
      this.mouseAddedHeight = canvasHeight / 2 - this.mouseCanvasY;

    });
  }

  update = () => {


    // calls the method from the base class to generate points based on analyser data
    const pointsXAxisLines = this.getPointsForSpectralFrame();

    // calculating the average y position
    let averageY = 0;
    if (pointsXAxisLines.length > 0) {
      const sumY = pointsXAxisLines.reduce((sum, point) =>
        sum + point.y, 0);
      averageY = sumY / pointsXAxisLines.length;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsXAxisLines);
    const material = new THREE.LineBasicMaterial({ color: new THREE.Color(this.config.lineColor) });
    const line = new THREE.Line(geometry, material);

    // adding the average y position to the height of the line for the additional effect
    if (this.config.isAdditionalEffect)
      line.position.y = this.config.heightOfLines + averageY;
    else
      line.position.y = this.config.heightOfLines;

    if (this.config.doesMouseChangeHeight)
      line.position.y = this.config.heightOfLines + this.mouseAddedHeight;
    else
      line.position.y = this.config.heightOfLines;

    this.spectralFrameGroup.add(line);

    // ------------------------------------------------------------------------
    // creating the mirror lines
    const mirroredPoints = pointsXAxisLines.map(
      point => new THREE.Vector3(point.x, -point.y, point.z));

    const mirrorLineGeometry = new THREE.BufferGeometry().setFromPoints(mirroredPoints);
    const mirrorLine = new THREE.Line(mirrorLineGeometry, material);

    if (this.config.doesMouseChangeHeight)
      mirrorLine.position.y = -this.config.heightOfLines - this.mouseAddedHeight;
    else
      mirrorLine.position.y = -this.config.heightOfLines;

    mirrorLine.position.z = line.position.z;
    this.spectralFrameGroup.add(mirrorLine);
    // ------------------------------------------------------------------------

    // moving front lines towards the camera
    for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
      const line = this.spectralFrameGroup.children[i];
      line.position.z += this.spectralFrameSpacing + this.spectralFrameSpacingOffset;

      const transparentMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(this.config.lineColor),
        transparent: true,
        opacity: 0.2
      });

      line.material = transparentMaterial;

    }
    this.processSpectralFrameSpacingOffset();


    // removing old/front lines
    while (this.spectralFrameGroup.children.length > this.config.maxLines) {
      const oldSpectralFrameBottom = this.spectralFrameGroup.children[1];
      const oldSpectralFrameTop = this.spectralFrameGroup.children[0]; // every second line is a mirrored line

      oldSpectralFrameBottom.geometry.dispose();
      oldSpectralFrameBottom.material.dispose();
      this.spectralFrameGroup.remove(oldSpectralFrameBottom);

      oldSpectralFrameTop.geometry.dispose();
      oldSpectralFrameTop.material.dispose();
      this.spectralFrameGroup.remove(oldSpectralFrameTop);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
export default ThreeVisualiserMirrorLines;
