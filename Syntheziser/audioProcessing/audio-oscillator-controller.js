
/*  used with the following abbreviations
osc = oscillator
eq = equaliser
fm = frequency modulation
rm = ring modulation
*/

// nur 1x audio ctx
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const mixGain = audioCtx.createGain();


/**
 * Controls the oscillator and its parameters.
 * 
*/
class AudioOscillatorController {
    /**
     * Creates an oscillator and its parameters.
     * @constructor
     */
    constructor() {
        this.osc = audioCtx.createOscillator();
        this.osc.type = "sine";

        // oscillator start flag
        this.isOscillatorEnabled = false;

        // gain
        this.oscGain = audioCtx.createGain();
        this.oscCurrentGain = 1; // default 1
        this.oscGain.gain.value = this.oscCurrentGain;

        // adsr parameters
        this.oscAttack = 0, this.oscDecay = 0, this.oscSustain = 1, this.oscRelease = 0;

        // frequency modulator
        this.fm = audioCtx.createOscillator();
        this.fmGain = audioCtx.createGain();
        this.fmCurrentGain = 0;
        this.fm.connect(this.fmGain).connect(this.osc.frequency);
        this.fmFrequency = 2;
        this.fm.frequency.value = this.fmFrequency;
        this.isFMActive = true;

        // ringmodulator
        this.rm = audioCtx.createOscillator();
        this.rmGain = audioCtx.createGain();
        this.rm.connect(this.rmGain).connect(this.oscGain.gain);
        this.rmFrequency = 0;
        this.rm.frequency.value = this.rmFrequency;
        this.isRMActive = false;

        // connections
        this.osc.connect(this.oscGain);
        this.oscGain.connect(mixGain);
        //connectNodeToEQ(this.oscGain);
        //this.oscGain.connect(audioCtx.destination);

    }
    connectToDestination() {
        mixGain.connect(audioCtx.destination);
    }

    static getAudioContext() {
        return audioCtx;
    }
    // for connecting to an EQ, for intance
    static getMixGain() {
        return mixGain;
    }
    /**
    * Sets the waveform of the oscillator.
    *
    * @param {string} type The type of waveform to set.
    * @return {void}
    */
    setWaveform(type) {
        this.osc.type = type;
    }

    /**
     * Returns the waveform of the oscillator.
     *
     * @return {string} The type of waveform of the oscillator.
     */
    getWaveform() {
        return this.osc.type;
    }

    /**
     * Sets the frequency of the oscillator.
     *
     * @param {number} frequency The frequency value to set for the oscillator in Hertz.
     * @return {void}
     */
    setFrequency(frequency) {
        this.osc.frequency.value = frequency;
    }

    /**
     * Returns the frequency of the oscillator.
     *
     * @return {number} The frequency value of the oscillator in Hertz.
     */
    getFrequency() {
        return this.osc.frequency.value;
    }

    /**
     * Sets the gain of the oscillator.
     *
     * @param {number} gain The gain value to set for the oscillator.
     * @return {void}
     */
    setGain(gain) {
        this.oscCurrentGain = gain;
        this.oscGain.gain.value = this.oscCurrentGain;
    }

    /**
     * Sets the attack time of the oscillator in seconds.
     *
     * @param {number} attackSeconds The attack time of the oscillator in seconds.
     * @return {void}
     */
    setAttack(attackSeconds) {
        this.oscAttack = attackSeconds;
    }

     getAttack() {
        return this.oscAttack;
    }
    /**
     * Sets the decay time of the oscillator in seconds.
     * 
     * @param {*} decaySeconds The decay time of the oscillator in seconds.
    */
    setDecay(decaySeconds) {
        this.oscDecay = decaySeconds;
    }
      getDecay() {
        return this.oscDecay;
    }


    /**
     * Sets the sustain value of the oscillator.
     * 
     * @param {*} sustain The sustain value of the oscillator.
     */
    setSustain(sustain) {
        this.oscSustain = sustain;
    }

    /**
     * Sets the release time of the oscillator in seconds.
     * 
     * @param {*} releaseSeconds The release time of the oscillator in seconds.
     */
    setRelease(releaseSeconds) {
        this.oscRelease = releaseSeconds;
    }

    /**
    * Transposes the frequency of the oscillator by a given interval in semitones.
    *
    * @param {number} semitones - The number of semitones by which the frequency should be transposed.
    * @return {void}
    */
    transpose(semitones) {
        const factor = Math.pow(2, semitones / 12);
        this.osc.frequency.value *= factor;
    }

    /**
    * Switches the frequency modulation on/off.
    *
    * @return {void}
    */
    toggleFrequencyModulatior() {
        if (this.isFMActive) {
            this.fm.frequency.value = 0;
            this.isFMActive = false;
        } else {
            this.fm.frequency.value = this.fmFrequency;
            this.isFMActive = true;
        }
    }

    /**
     * Sets the gain of the frequency modulator.
     * 
     * @param {*} gain The gain value to set for the frequency modulator.
     */
    setGainOfFrequencyModulator(gain) {
        this.fmCurrentGain = gain;
        if (this.isFMActive) {
            this.fmGain.gain.value = this.fmCurrentGain;
        }
    }

    /**
     * Sets the frequency of the frequency modulator.
     * 
     * @param {*} frequency The frequency value to set for the frequency modulator.
     */
    setFrequencyOfFrequencyModulator(frequency) {
        this.fm.frequency.value = frequency;
    }

    /**
     * Returns the frequency of the frequency modulator.
     * 
     * @returns The frequency value of the frequency modulator.
     */
    getFrequencyOfFrequencyModulator() {
        return this.fm.frequency.value;
    }

    /**
     * Sets the frequency of the ring modulator.
     * 
     * @param {*} frequency The frequency value to set for the ring modulator.
     */
    setFrequencyOfRingModulator(frequency) {
        this.rmFrequency = frequency;
        if (this.isRMActive) {
            this.rm.frequency.value = frequency;
        }
    }

    /**
     * Toggles the ring modulator on/off.
     * 
     */
    toggleRingModulator() {
        if (this.isRMActive) {
            this.rm.frequency.value = 0;
            this.isRMActive = false;
        } else {
            this.rm.frequency.value = this.rmFrequency;
            this.isRMActive = true;
        }
    }

    /**
    * Plays the oscillator with the frequency modulator and the ring modulator if they are on.
    *
    *  @return {void}
    */
    playOscillator() {
        if (!this.isOscillatorEnabled) {
            this.osc.start();
            this.fm.start();
            this.rm.start();
            this.isOscillatorEnabled = true;
        }

        let time = audioCtx.currentTime;
        this.oscGain.gain.cancelScheduledValues(time);
        this.oscGain.gain.setValueAtTime(0, time);
        // attack
        this.oscGain.gain.linearRampToValueAtTime(this.oscCurrentGain, time + this.oscAttack);
        this.oscGain.gain.setValueAtTime(this.oscCurrentGain, time + this.oscAttack);
        // decay, sustain
        this.oscGain.gain.linearRampToValueAtTime(this.oscSustain * this.oscCurrentGain, time + this.oscAttack + this.oscDecay);

        this.rmGain.gain.setValueAtTime(1, time);
    }

    /**
    * Stops the oscillator.
    *
    * @return {void}
    */
    stopOscillator() {
        const time = audioCtx.currentTime;
        this.oscGain.gain.cancelScheduledValues(time);
        this.oscGain.gain.setValueAtTime(this.oscGain.gain.value, time);
        this.oscGain.gain.linearRampToValueAtTime(0, time + this.oscRelease);

        this.rmGain.gain.setValueAtTime(0, time);
    }
}

export default AudioOscillatorController;