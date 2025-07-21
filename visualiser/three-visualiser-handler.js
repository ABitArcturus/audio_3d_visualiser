import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import ThreeVisualiserFlyingLines from "./three-visualiser-flying-lines.js";
import ThreeVisualiserLaserLines from './three-visualiser-laser-lines.js';
import ThreeVisualiser3DMountains from "./three-visualiser-3d-mountains.js";
import ThreeVisualiserFlyingFadingLines from "./three-visualiser-flying-fading-lines.js";
import ThreeVisualiserMirrorLines from "./three-visualiser-mirror-lines.js";
import ThreeVisualiserUpDown from "./three-visualiser-up-down.js";

/**
 * This class manages different visualization effects and switches between them seamlessly. Moreover it provides a GUI for altering the visualiser.
 */
class ThreeVisualiserHandler {
    static availableVisualisers = [
        'flyingLines',
        'laserLines',
        'threeDimensionalMountains',
        'flyingFadingLines',
        'mirrorLines',
        'upDown'
    ];
    // canvas adjustments
    static CANVAS_WIDTH = window.innerWidth - 20;
    static CANVAS_HEIGHT = window.innerHeight - 200;


    constructor(analyser) {
        this.analyser = analyser;
        this.currentVisualiser = null;
        this.currentVisualiserName = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        this.canvas = document.getElementById('threejs-container');

        // starting visualiser
        this.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[4]);
        this.animate();
    }

    /**
     * Creates a visualiser instance based on the given name.
     * 
     * @param {string} name - The name of the visualisation effect to be create.
     * @returns {ThreeVisualiserFlyingLines | ThreeVisualiserLaserLines | ThreeVisualiser3DMountains |
     * ThreeVisualiserFlyingFadingLines|ThreeVisualiserMirrorLines| ThreeVisualiserUpDown|null} The created visualiser instance or null if the name is not recognized.
     */

    createVisualiser(name) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

        if (name === ThreeVisualiserHandler.availableVisualisers[0]) {
            this.createNormalRenderer();
            this.createControls();
            return new ThreeVisualiserFlyingLines(this.getNecessaryParameters());
        }
        if (name === ThreeVisualiserHandler.availableVisualisers[1]) {
            this.createNormalRenderer();
            this.createControls();
            return new ThreeVisualiserLaserLines(this.getNecessaryParameters());
        }
        if (name === ThreeVisualiserHandler.availableVisualisers[2]) {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(ThreeVisualiserHandler.CANVAS_WIDTH, ThreeVisualiserHandler.CANVAS_HEIGHT);
            this.renderer.shadowMap.enabled = true;
            this.createControls();
            return new ThreeVisualiser3DMountains(this.getNecessaryParameters());
        }
        if (name === ThreeVisualiserHandler.availableVisualisers[3]) {
            this.createNormalRenderer();
            this.createControls();
            return new ThreeVisualiserFlyingFadingLines(this.getNecessaryParameters());
        }
        if (name === ThreeVisualiserHandler.availableVisualisers[4]) {
            this.createNormalRenderer();
            this.createControls();
            return new ThreeVisualiserMirrorLines(this.getNecessaryParameters());
        }
        if (name === ThreeVisualiserHandler.availableVisualisers[5]) {
            this.createNormalRenderer();
            this.createControls();
            return new ThreeVisualiserUpDown(this.getNecessaryParameters());
        }

        return null;
    }
    createNormalRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(ThreeVisualiserHandler.CANVAS_WIDTH, ThreeVisualiserHandler.CANVAS_HEIGHT);
    }
    /**
     * Needs camera and renderer to be set before calling this method.
     */
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    /**
     * Gets the necessary parameters for the visualiser.
     * 
     * @returns {Object} An object containing the necessary parameters for the visualiser.
     */
    getNecessaryParameters() {
        return {
            analyser: this.analyser,
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer,
            controls: this.controls
        };
    }

    /**
     * Removes the visualiser from the scene and disposes all its resources, 
     * including the renderer, its DOM element, and all geometries and materials used.
     * 
     * @param {ThreeVisualiserFlyingLines | ThreeVisualiserLaserLines| ThreeVisualiser3DMountains| 
     * ThreeVisualiserFlyingFadingLines | ThreeVisualiserMirrorLines | ThreeVisualiserUpDown} visualiser - The visualiser to be disposed.
     */
    disposeVisualiser(visualiser) {
        if (!visualiser) return;

        this.currentVisualiser.destroyGUI();

        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                object.material.dispose();
            }
            if (object.isMesh) {
                if (object.geometry)
                    object.geometry.dispose();
            }
        });

        if (this.renderer) {
            this.renderer.dispose();
            if (visualiser.renderer.domElement.parentNode) {
                visualiser.renderer.domElement.parentNode.removeChild(visualiser.renderer.domElement);
            }
        }
    }

    /**
     * Changes the current visualiser to the one specified by the given name.
     * 
     * @param {*} visualiserName - The name of the visualiser to switch to.
     */
    changeVisualiser = (visualiserName) => {
        if (!ThreeVisualiserHandler.availableVisualisers.includes(visualiserName)) {
            throw new Error(`unknown visualiser: ${visualiserName}`);
        }
        this.currentVisualiserName = visualiserName;

        // remove old GUI and visualiser
        if (this.currentVisualiser) {
            this.disposeVisualiser(this.currentVisualiser);
            this.currentVisualiser = null;
        }
        this.currentVisualiser = this.createVisualiser(visualiserName);

        this.canvas.innerHTML = '';
        this.canvas.appendChild(this.renderer.domElement);

        // this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        // runs the update loop of the currently selected visualiser - as defined in its class
        this.currentVisualiser.update();
    }
    resizeCanvas = () => {
        this.renderer.setSize(window.innerWidth - 20, window.innerHeight- 200);

    }
}

export default ThreeVisualiserHandler;