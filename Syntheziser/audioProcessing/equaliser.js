
/**
 * Last node needs to be connected to destination.
 */
class Equaliser {

    constructor(node, audioContext) {
        //this.audioContext = audioCtx;


       /*  this.eqBands = [
            { frequency: 80, type: "peaking" },
            { frequency: 160, type: "peaking" },
            { frequency: 250, type: "peaking" },
            { frequency: 500, type: "peaking" },
            { frequency: 900, type: "peaking" },
            { frequency: 1500, type: "peaking" },
            { frequency: 2500, type: "peaking" },
            { frequency: 3200, type: "peaking" }
        ]; */
         this.eqBands = [
            { frequency: 80, type: "peaking" },
            { frequency: 160, type: "peaking" },
            { frequency: 250, type: "peaking" },
            { frequency: 500, type: "peaking" },
            { frequency: 900, type: "peaking" },
            { frequency: 1500, type: "peaking" },
            { frequency: 2500, type: "peaking" },
            { frequency: 3200, type: "peaking" }
        ];

        this.eqFilters = null;

        // this.initialize();

        // create filters
        this.eqFilters = this.eqBands.map(
            (eqBand) => {
                const filter = audioContext.createBiquadFilter();
                filter.type = eqBand.type;
                filter.frequency.value = eqBand.frequency;
                filter.Q.value = 0.1; // CHANGE
                filter.gain.value = 0;
                return filter;
            });

        // connect filters together
        for (let i = 0; i < this.eqFilters.length - 1; i++) {
            this.eqFilters[i].connect(this.eqFilters[i + 1]);
        }

        // connections
        node.connect(this.eqFilters[0]);
        this.eqFilters[this.eqFilters.length - 1].connect(audioContext.destination);

    }
    // equalizer settings



    /**
     * Initializes the equalizer. Depends on the global audioCtx and analyser.
     *
     * @return {void}
     */
    initialize() {


    }

    /**
     * Connects the given node to the first filter in the equalizer.
     *
     * @param {AudioNode} node - The node to connect to the equalizer.
     * @param {AudioContext} audioContext - The actual audio context.
     * @return {void}
     */
    connectNodeToEQ(node, audioContext) {
        node.connect(this.eqFilters[0]);
        this.eqFilters[this.eqFilters.length - 1].connect(audioContext.destination);
    }
    getLastNode() {
        return this.eqFilters[this.eqFilters.length - 1];
    }

    /**
     * Sets the gain value of the corresponding band in the equalizer.
     *
     * @param {number} bandIndex - The index of the band in the eqFilters array.
     * @param {number} gain - The gain value to set for the band in the equalizer.
     * @return {void}
     */
    setEQGain(bandIndex, gain) {
        if (bandIndex >= 0 && bandIndex < this.eqFilters.length) {
            this.eqFilters[bandIndex].gain.value = gain;
        }
    }

}
export default Equaliser;
//export { connectNodeToEQ, setEQGain, initializeEQ };