class Analyser {

    constructor(node, audioContext) {
        this.audioContext = audioContext;

        // after audioCtx and analyser are created
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 4096;

        // 2048
        this.bufferLength = this.analyser.frequencyBinCount;

        // values from 0 - 255
        this.dataArrayUint8 = new Uint8Array(this.bufferLength);

        this.nyquist = this.audioContext.sampleRate / 2;
        this.maxFreq = 20000;
        this.minFreq = 20;

        this.dataArrayFloat32 = new Float32Array(this.bufferLength);

        this.isAnalysing = false;
        node.connect(this.analyser);
    }
    stopAnalysing() {
        if (this.isAnalysing)
            this.isAnalysing = false;
    }


    connectNodeToAnalyser(node) {
        node.connect(this.analyser);
    }
   
    /**
     * Returns the human hearable frequency data of the audio
     * 
     * @returns 
     */
    analyse = () => {
        const result = [];
        this.analyser.getByteFrequencyData(this.dataArrayUint8);
        
        for (let i = 0; i < this.bufferLength; i++) {
            const frequency = this.getFrequencyByIndex(i);

            // skip frequencies outside our hearing spectrum
            if (frequency < this.minFreq || frequency > this.maxFreq) {
                continue;
            }

            const barHeight = this.dataArrayUint8[i];

            result.push(barHeight);
        }
        return result;
    }

    /**
     * Calculates the frequency for the given bin index.
     *
     * @param {number} index The bin index.
     * @return {number} The calculated frequency.
     */
    getFrequencyByIndex(index) {
        return (index * this.nyquist) / this.bufferLength;
    }
}

export default Analyser;