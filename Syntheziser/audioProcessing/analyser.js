class Analyser {

    constructor(node, audioContext) {
        this.audioContext = audioContext;

        // after audioCtx and analyser are created
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 4096;

        this.canvas = document.getElementById("analyser-canvas");
        this.canvasCtx = this.canvas.getContext("2d");

        // 2048
        this.bufferLength = this.analyser.frequencyBinCount; //gibt die Anzahl der "Bins" (Frequenzbänder), die zur Darstellung des Frequenzspektrums verwendet werden.

        // values from 0 - 255
        this.dataArrayUint8 = new Uint8Array(this.bufferLength);


        this.nyquist = this.audioContext.sampleRate / 2;
        this.maxFreq = 20000;
        this.minFreq = 20;

        this.dataArrayFloat32 = new Float32Array(this.bufferLength);

        this.isAnalysing = false;
        //source.connect(this.analyser);
        node.connect(this.analyser);
    }


    stopAnalysing() {
        if (this.isAnalysing)
            this.isAnalysing = false;
    }


    connectNodeToAnalyser(node) {
        node.connect(this.analyser);
    }
    getAnalyserData() {
        return this.dataArrayUint8;
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
            //(index * this.nyquist) / this.bufferLength;
            // i * 24000 / 2048

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
     * Visualizes the frequency data in the canvas.
     * Works with values from 0 to 255.
     *
     * @return {void}
     */
    visualize = () => {// kontext von this geht ohne arrow fct verloren
        /* if (!this.isAnalysing)
            return; */


        // get the data from the analyser
        // Der Wert jedes Elements im Array entspricht der Amplitude der Frequenz an einer bestimmten Stelle im Frequenzspektrum.
        this.analyser.getByteFrequencyData(this.dataArrayUint8);

        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = this.canvas.width / this.bufferLength;

        for (let i = 0; i < this.bufferLength; i++) {
            const frequency = this.getFrequencyByIndex(i);
            //(index * this.nyquist) / this.bufferLength;
            // i * 24000 / 2048


            // skip frequencies outside our hearing spectrum
            if (frequency < this.minFreq || frequency > this.maxFreq) {
                continue;
            }

            const barHeight = this.dataArrayUint8[i];

            const xPosition = (frequency / this.maxFreq) * this.canvas.width;


            this.canvasCtx.fillStyle = "rgb(0, " + (barHeight + 100) + ", 0)";
            this.canvasCtx.fillRect(xPosition, this.canvas.height - barHeight / 2, barWidth, barHeight);
        }
        requestAnimationFrame(this.visualize);

    }
    /**
     * Returns the root mean square value of the audio.
     * 
     * @returns {number} The root mean square value.
     */
    getRMS() {
        this.analyser.getFloatFrequencyData(dataArrayFloat32);

        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            sum += Math.pow(dataArrayFloat32[i], 2);
        }

        const rms = Math.sqrt(sum / this.bufferLength);
        return rms;
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

    /**
     * Returns the frequency with the highest amplitude/the currently playing frequency.
     * 
     * @returns The frequency value.
     */
    getFrequency() {
        this.analyser.getByteFrequencyData(this.dataArrayUint8);

        let maxAmplitude = 0;
        let maxIndex = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            if (this.dataArrayUint8[i] > maxAmplitude) {
                maxAmplitude = this.dataArrayUint8[i];
                maxIndex = i;
            }
        }
        const frequency = maxIndex * this.nyquist / this.bufferLength;
        return frequency;
    }

    /* visualize();
     */
    //////////////////////////////////////////////////

    /* set the threshold for the average gain here (0-1).
    * (the larger the number, the louder)
    * 
    */
    static AVERAGE_GAIN_THRESHOLD = 0;

    /**
     * Checks the average gain over a AVERAGE_GAIN_THRESHOLD.
     *
     * @return {void}
     */
    checkAverageGainOverThreshold() {
        // get the data from the analyser
        this.analyser.getByteFrequencyData(this.dataArrayUint8);

        // get the average gain first
        const averageGain = calculateAverageGain(this.dataArrayUint8);

        // trigger fct if average gain is higher than threshold
        if (averageGain > AVERAGE_GAIN_THRESHOLD) {
            return handleHighAverageGain(averageGain);
        }

        /*  requestAnimationFrame(
             () => checkAverageGainOverThreshold()
         ); */
    }

    /**
     * Calculates the average gain value from the given data array.
     * Works with values from 0 to 255 but normalizes them to the range 0-1.
     *
     * @param {number[]} dataArray - The array of gain values.
     * @return {number} The average gain value.
     */
    calculateAverageGain() {
        // get the data from the analyser
        this.analyser.getByteFrequencyData(this.dataArrayUint8);

        let sum = 0;
        for (let i = 0; i < this.bufferLength; i++) {
        // normalize the data to the range 0-1
/*         sum += dataArrayUint8[i] / 255;
 */        sum += this.dataArrayUint8[i];

        }
        return sum / this.bufferLength;
    }
    ////////////////////////////////////////////////

    /**
     * Is triggered when the average gain is higher than the threshold.
     *
     * @param {number} averageGain - The average gain value to log.
     * @return {void}
     */
    handleHighAverageGain(averageGain) {

        return (averageGain * 100).toFixed(3);
    }

    /* checkAverageGainOverThreshold();
     */
    // maximum value = 0


    // boundary values: changing these values changes which logic fct is triggered
    //geht static auch nur einmal?
    static LOW_FREQ_MIN = 20;
    static LOW_FREQ_MAX = 500;
    static MID_FREQ_MIN = 501;
    static MID_FREQ_MAX = 2000;
    static HIGH_FREQ_MIN = 2001;
    static HIGH_FREQ_MAX = 20000;

    /**
     * Logs the frequency and gain of the current audio if the gain is above a certain threshold.
     * Works with a maximum value of 0.
     *
     * @return {void}
     */
    logRelevantFrequencies() {

        if (!this.isAnalysing)
            this.isAnalysing = true;

        const analyse = () => {
            if (!this.isAnalysing) {
                return;
            }

            // get the data from the analyser
            this.analyser.getFloatFrequencyData(this.dataArrayFloat32);

            // find the maximum gain and corresponding frequency
            let maxGain = -Infinity;
            let maxFreq = 0;

            for (let i = 0; i < this.bufferLength; i++) {
                const frequency = (i * this.nyquist) / this.bufferLength;
                const gain = this.dataArrayFloat32[i];

                if (gain > maxGain) {
                    maxGain = gain;
                    maxFreq = frequency;
                }
            }

            if (maxGain > Analyser.GAIN_THRESHOLD) {
                /*             console.log("frequency: ", maxFreq.toFixed(2), "Hz, gain: ", maxGain.toFixed(2), " dB");
                 */
                // checking if corresponding frequencies within the boundaries are being played          
                if (maxFreq >= Analyser.LOW_FREQ_MIN && maxFreq <= Analyser.LOW_FREQ_MAX) {
                    this.handleLowFrequency(maxFreq, maxGain);
                } else if (maxFreq > Analyser.MID_FREQ_MIN && maxFreq <= Analyser.MID_FREQ_MAX) {
                    this.handleMidFrequency(maxFreq, maxGain);
                } else if (maxFreq > Analyser.HIGH_FREQ_MIN && maxFreq <= Analyser.HIGH_FREQ_MAX) {
                    this.handleHighFrequency(maxFreq, maxGain);
                }
            }

            // wait 70 ms
            setTimeout(analyse, 70);

        }

        analyse();
    }
    // changing this value changes when the game logic functions are triggered
    static GAIN_THRESHOLD = -70;


    /**
     * Is triggered when the audio frequency is between LOW_FREQ_MIN and LOW_FREQ_MAX Hz.
     * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
     * The typical maximum value when one oscillator is played is -14 dB.
     * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
     * 
     * @param {number} frequency - The frequency value.
     * @param {number} gain - The gain value.
     * @return {void}
     */
    handleLowFrequency(frequency, gain) {
        console.log("low frequency: ", frequency.toFixed(2), "Hz, gain: ", gain.toFixed(2), " dB");
    }

    /**
     * Is triggered when the audio frequency is between MID_FREQ_MIN and MID_FREQ_MAX Hz.
     * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
     * The typical maximum value when one oscillator is played is -14 dB.
     * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
     *
     * @param {number} frequency - The frequency value.
     * @param {number} gain - The gain value.
     * @return {void}
     */
    handleMidFrequency(frequency, gain) {
        console.log("mid frequency: ", frequency.toFixed(2), " Hz, gain: ", gain.toFixed(2), " dB");

    }

    /**
     * Is triggered when the audio frequency is between HIGH_FREQ_MIN and HIGH_FREQ_MAX Hz.
     * Works with values from GAIN_THRESHOLD to 0 (the larger the number, the louder).
     * The typical maximum value when one oscillator is played is -14 dB.
     * When both oscillators are played simultaneously, with the same frequency, it reaches -8 dB.
     *
     * @param {number} frequency - The frequency value.
     * @param {number} gain - The gain value.
     * @return {void}
     */
    handleHighFrequency(frequency, gain) {
        console.log("high frequency: ", frequency.toFixed(2), " Hz, gain: ", gain.toFixed(2), " dB");
    }
}


export default Analyser;
//export { visualize, checkAverageGainOverThreshold, calculateAverageGain, getFrequency, getRMS };