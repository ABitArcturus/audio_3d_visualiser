import * as THREE from 'three';
import { BaseVisualiser } from './base-visualiser.js';

class ThreeVisualiserLaserLines extends BaseVisualiser {
  constructor(parameters) {
    super(parameters);

    this.cameraY = 30;
    this.cameraZ = 10;

    this.setCameraAndTarget();

    this.laserLineGroup1 = new THREE.Group();
    this.laserLineGroup2 = new THREE.Group();
    this.scene.add(this.laserLineGroup1);
    this.scene.add(this.laserLineGroup2);
    this.laserLineIndex1 = 0; // laser from left to right
    this.laserLineIndex2 = this.lineLength - 1; // laser from right to left

    this.generateBasicGUI();
    this.controllerLineColor.setValue('#ff0000');
    this.controllerMaxLines.setValue(10);
    this.controllerLevelOfDetail.setValue(50);

    this.config.showLaser = true;
    this.gui.add(this.config, 'showLaser').name('show laser').onChange(() => {
      this.removeLaserLines();
    });
    this.config.isSecondLaser = false;
    this.gui.add(this.config, 'isSecondLaser').name('add second laser');

    this.config.laserSpeed = 12;
    this.gui.add(this.config, 'laserSpeed', 1, 100).name('laser speed').step(1);
    this.config.laserColor = '#ff0000';
    this.gui.addColor(this.config, 'laserColor').name('laser color');
    this.config.twoDimensional = false;
    this.gui.add(this.config, 'twoDimensional').name('two-dimensional').onChange((value) => {
      if (value) {
        this.controllerMaxLines.setValue(100);
      }else {
        this.controllerMaxLines.setValue(10);
      }
    })
  }
  removeLaserLines = () => {
    while (this.laserLineGroup1.children.length > 0) {
      const oldLine = this.laserLineGroup1.children[0];
      this.laserLineGroup1.remove(oldLine);
      oldLine.geometry.dispose();
      oldLine.material.dispose();
    }
    while (this.laserLineGroup2.children.length > 0) {
      const oldLine = this.laserLineGroup2.children[0];
      this.laserLineGroup2.remove(oldLine);
      oldLine.geometry.dispose();
      oldLine.material.dispose();
    }
  }
  update = () => {

    // calls the method from the base class to generate points based on analyser data
    const pointsXAxisLines = this.getPointsForSpectralFrame();

    const geometry = new THREE.BufferGeometry().setFromPoints(pointsXAxisLines);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(this.config.lineColor),
      transparent: true,
      opacity: 1
    });
    const line = new THREE.Line(geometry, material);

    this.spectralFrameGroup.add(line);

    // ------------------------------------------------------------------------
    // laser line

    if (this.config.showLaser) {

      // getting coordinates of the last line in the group
      const latestLine = this.spectralFrameGroup.children[this.spectralFrameGroup.children.length - 1];
      const pointsOfLatestLine = latestLine.geometry.attributes.position.array;

      const endPoint1X = pointsOfLatestLine[this.laserLineIndex1 * 3]; // * 3 to find proper starting point
      const endPoint1Y = pointsOfLatestLine[this.laserLineIndex1 * 3 + 1];
      const endPoint1Z = pointsOfLatestLine[this.laserLineIndex1 * 3 + 2] + this.spectralFrameGroupPositionZ; // puts it to the proper world z position

      const entPoint2X = pointsOfLatestLine[this.laserLineIndex2 * 3];
      const entPoint2Y = pointsOfLatestLine[this.laserLineIndex2 * 3 + 1];
      const entPoint2Z = pointsOfLatestLine[this.laserLineIndex2 * 3 + 2] + this.spectralFrameGroupPositionZ;

      this.laserLineIndex1 += this.config.laserSpeed;
      this.laserLineIndex2 -= this.config.laserSpeed;

      if (this.laserLineIndex1 >= this.lineLength) {
        this.laserLineIndex1 = 0;
      }
      if (this.laserLineIndex2 <= 0) {
        this.laserLineIndex2 = this.lineLength - 1;
      }

      const endVector1 = new THREE.Vector3(endPoint1X, endPoint1Y, endPoint1Z);
      const endVector2 = new THREE.Vector3(entPoint2X, entPoint2Y, entPoint2Z);

      const startVector = new THREE.Vector3(this.defaultCameraPosition.x, this.defaultCameraPosition.y - 1, this.defaultCameraPosition.z - 1);
      const points1 = [startVector, endVector1];
      const points2 = [startVector, endVector2];
      const geometryLaser1 = new THREE.BufferGeometry().setFromPoints(points1);
      const geometryLaser2 = new THREE.BufferGeometry().setFromPoints(points2);
      const materialLaser = new THREE.LineBasicMaterial({
        color: this.config.laserColor,
        transparent: true,
        opacity: 0.5
      });

      const laserLine1 = new THREE.Line(geometryLaser1, materialLaser);
      const laserLine2 = new THREE.Line(geometryLaser2, materialLaser);
      this.laserLineGroup1.add(laserLine1);
      this.laserLineGroup2.add(laserLine2);

      // keeping the last lines for adding a fading effect
      while (this.laserLineGroup1.children.length > 10) {
        const oldLine = this.laserLineGroup1.children[0];
        this.laserLineGroup1.remove(oldLine);
        oldLine.geometry.dispose();
        oldLine.material.dispose();
      }

      // adding fading effect
      for (let index = 0; index < this.laserLineGroup1.children.length; index += 1) {
        const oldLine = this.laserLineGroup1.children[index];
        oldLine.material.opacity -= 0.05;
      }

      // either show second laser or not
      if (this.config.isSecondLaser) {

        while (this.laserLineGroup2.children.length > 10) {
          const oldLine = this.laserLineGroup2.children[0];
          this.laserLineGroup2.remove(oldLine);
          oldLine.geometry.dispose();
          oldLine.material.dispose();
        }

        // adding fading effect
        for (let index = 0; index < this.laserLineGroup2.children.length; index += 1) {
          const oldLine = this.laserLineGroup2.children[index];
          oldLine.material.opacity -= 0.05;

        }

      } else {
        // removing all
        while (this.laserLineGroup2.children.length > 0) {
          const oldLine = this.laserLineGroup2.children[0];
          this.laserLineGroup2.remove(oldLine);
          oldLine.geometry.dispose();
          oldLine.material.dispose();
        }
      }
    }
    // ------------------------------------------------------------------------

    if (!this.config.twoDimensional) {
      // moves front lines towards the camera, lowers them and inceases transparency
      for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
        const frontLine = this.spectralFrameGroup.children[i];
        frontLine.position.y -= 1;
        frontLine.position.z += this.spectralFrameSpacing + this.spectralFrameSpacingOffset;
        frontLine.material.opacity = i / this.spectralFrameGroup.children.length * 0.8;
      }

    } else {
      // only lowering the lines and transparency
      for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
        const frontLine = this.spectralFrameGroup.children[i];
        frontLine.position.y -= 1;
        frontLine.material.opacity = Math.max(frontLine.material.opacity - 0.05, 0.1);
      }
    }

    this.processSpectralFrameSpacingOffset();
    this.removeOldSpectralFrames();

    this.renderer.render(this.scene, this.camera);
  }
}
export default ThreeVisualiserLaserLines;
