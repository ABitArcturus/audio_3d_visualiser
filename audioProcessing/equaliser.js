
/**
 * Last node needs to be connected to destination.
 */
class Equaliser {
    
    constructor(node, audioContext) {

        this.eqBands = [
            { frequency: 1000, type: "peaking" },
            { frequency: 3500, type: "peaking" },
            { frequency: 6000, type: "peaking" },
            { frequency: 8500, type: "peaking" },
            { frequency: 11000, type: "peaking" },
            { frequency: 13500, type: "peaking" },
            { frequency: 16000, type: "peaking" },
            { frequency: 18500, type: "peaking" }
        ];

        // creating filters
        this.eqFilters = this.eqBands.map(
            (eqBand) => {
                const filter = audioContext.createBiquadFilter();
                filter.type = eqBand.type;
                filter.frequency.value = eqBand.frequency;
                filter.Q.value = 5;
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
    /**
     * Returns the last node in the equalizer filter chain.
     *
     * @return {BiquadFilterNode} - The last node in the equalizer filter chain.
     */
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
