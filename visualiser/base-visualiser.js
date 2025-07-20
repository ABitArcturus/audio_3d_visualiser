import * as THREE from 'three';
import * as dat from 'dat.gui';

/**
 * Base class for visualisers. Creates the most basic elements 
 */
class BaseVisualiser {
    constructor({ analyser, scene, camera, renderer, controls }) {
        this.analyser = analyser;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;

        this.lineLength = 1300;
        // the actual length of the dataArray from the analyser is 1705
        // but beyond index 1300 the values are effectively empty

        this.cameraX = this.lineLength / 2
        this.cameraY = 0;
        this.cameraZ = 0;

        this.spectralFrameGroup = new THREE.Group();
        this.spectralFrameSpacing = 2; // z position
        this.spectralFrameSpacingOffset = 0.1;
        this.isOffsetReversed = false;
        this.spectralFrameGroupPositionZ = -300;
        this.spectralFrameGroup.position.z = this.spectralFrameGroupPositionZ;
        this.scene.add(this.spectralFrameGroup);

    }
    setCameraAndTarget = () => {
        this.defaultCameraPosition = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ);
        this.defaultTarget = new THREE.Vector3(this.cameraX, this.cameraY, this.cameraZ - 1);

        this.camera.position.copy(this.defaultCameraPosition);
        this.controls.target.copy(this.defaultTarget);

        this.controls.update();
    }
    generateBasicGUI = () => {
        this.config = {
            lineColor: '#00ffff',
            levelOfDetail: 4,
            amplitude: 1,
            maxLines: 50
        };

        this.gui = new dat.GUI();
        this.controllerLineColor = this.gui.addColor(this.config, 'lineColor').name('line color');
        this.controllerLevelOfDetail = this.gui.add(this.config, 'levelOfDetail', 1, 100).name('level of detail').step(1);
        this.controllerAmplitude = this.gui.add(this.config, 'amplitude', 0.1, 10).name('amplitude height').step(0.1);
        this.controllerMaxLines = this.gui.add(this.config, 'maxLines', 1, 100).name('maximum lines').step(1);
        this.controllerResetView = this.gui.add(this, 'resetView').name('reset view');

    }
    destroyGUI = () => {
        if (this.gui) {
            this.gui.destroy();
            this.gui = null;
        }
    }
    resetView = () => {
        this.camera.position.copy(this.defaultCameraPosition);
        this.controls.target.copy(this.defaultTarget);
        this.controls.update();
    };
    getPointsForSpectralFrame = () => {

        const dataArray = this.analyser.analyse(); // length = 1705
        // limitation via this.lineLength

        // creating lines according to the analyser data
        const pointsXAxisLines = [];

        let lastValue = dataArray[0];

        // loops through the analyser data
        for (let i = 0; i < this.lineLength; i++) {

            // skips dataArray values according to the detail factor
            if (i % this.config.levelOfDetail === 0 && i < dataArray.length) {
                lastValue = dataArray[i];
            }

            pointsXAxisLines.push(new THREE.Vector3(i, lastValue / this.config.amplitude, 0));
        }

        return pointsXAxisLines;
    };
    /**
     * Moves the old spectral frames towards the camera and lowers them.
     */
    lowerOldSpectralFrames = () => {

        for (let i = 0; i < this.spectralFrameGroup.children.length; i++) {
            const line = this.spectralFrameGroup.children[i];
            line.position.z += this.spectralFrameSpacing;
            line.position.y -= 1;

            const transparentMaterial = new THREE.LineBasicMaterial({
                color: new THREE.Color(this.config.lineColor),
                transparent: true,
                opacity: 0.2
            });

            line.material = transparentMaterial;
        }

    }
    removeOldSpectralFrames = () => {

        // removes old/front lines
        while (this.spectralFrameGroup.children.length > this.config.maxLines) {
            const oldLine = this.spectralFrameGroup.children[0];
            this.spectralFrameGroup.remove(oldLine);
            oldLine.geometry.dispose();
            oldLine.material.dispose();
        }
    }

    /**
     * The offset value needs to be added to the z position during the translation along the z axis for a moving effect.
     */
    processSpectralFrameSpacingOffset = () => {

        if (this.spectralFrameSpacingOffset > 1)
            this.isOffsetReversed = true;
        if (this.spectralFrameSpacingOffset < 0)
            this.isOffsetReversed = false;

        if (!this.isOffsetReversed)
            this.spectralFrameSpacingOffset += 0.1;
        else
            this.spectralFrameSpacingOffset -= 0.1;
    }
}

export { BaseVisualiser };