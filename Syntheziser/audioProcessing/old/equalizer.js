import { audioCtx, analyser, controllers } from "./oscController.js";

// equalizer settings
const eqBands = [
    { frequency: 80, type: "peaking" },
    { frequency: 160, type: "peaking" },
    { frequency: 250, type: "peaking" },
    { frequency: 500, type: "peaking" },
    { frequency: 900, type: "peaking" },
    { frequency: 1500, type: "peaking" },
    { frequency: 2500, type: "peaking" },
    { frequency: 3200, type: "peaking" }
];

let eqFilters = null;


/**
 * Initializes the equalizer. Depends on the global audioCtx and analyser.
 *
 * @return {void}
 */
function initEQ() {

    // create filters
    eqFilters = eqBands.map(
        (eqBand) => {
            const filter = audioCtx.createBiquadFilter();
            filter.type = eqBand.type;
            filter.frequency.value = eqBand.frequency;
            filter.gain.value = 0;
            return filter;
        });

    // connect filters together
    for (let i = 0; i < eqFilters.length - 1; i++) {
        eqFilters[i].connect(eqFilters[i + 1]);
    }
    // connect last filter to analyser
    eqFilters[eqFilters.length - 1].connect(analyser);
    analyser.connect(audioCtx.destination);
}

/**
 * Connects the given node to the first filter in the equalizer.
 *
 * @param {AudioNode} node - The node to connect to the equalizer.
 * @return {void}
 */
function connectNodeToEQ(node) {
    node.connect(eqFilters[0]);
}

/**
 * Sets the gain value of the corresponding band in the equalizer.
 *
 * @param {number} bandIndex - The index of the band in the eqFilters array.
 * @param {number} gain - The gain value to set for the band in the equalizer.
 * @return {void}
 */
function setEQGain(bandIndex, gain) {
    if (bandIndex >= 0 && bandIndex < eqFilters.length) {
        eqFilters[bandIndex].gain.value = gain;
    }
}

export { connectNodeToEQ, setEQGain, initEQ };