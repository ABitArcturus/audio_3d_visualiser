import { connectNodeToEQ, initEQ } from "./equalizer.js";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 4096;

// after audioCtx and analyser are created
initEQ();


// for saving more than one controller
const controllers = [];

/**
 * Creates an oscillator with various parameters and settings.
 *
 * @return {Object} An object containing the oscillator and its associated properties and control functions.
 */
function createOSC() {

    const osc = audioCtx.createOscillator();
    osc.type = "sine";

    // oscillator start flag
    let oscStarted = false;

    // gain
    const oscGain = audioCtx.createGain();
    let oscCurrentGain = 1;
    oscGain.gain.value = oscCurrentGain;

    // adsr parameters
    let oscAttack = 0, oscDecay = 0, oscSustain = 1, oscRelease = 0;

    // frequency modulator
    const oscFreqMod = audioCtx.createOscillator();
    const oscFreqModGain = audioCtx.createGain();
    let oscFreqModCurrentGain = 0;
    oscFreqMod.connect(oscFreqModGain).connect(osc.frequency);
    let oscFreqModFrequency = 2;
    oscFreqMod.frequency.value = oscFreqModFrequency;
    let oscFreqModOn = true;

    // ringmodulator
    const oscRingMod = audioCtx.createOscillator();
    const oscRingModGain = audioCtx.createGain();
    oscRingMod.connect(oscRingModGain).connect(oscGain.gain);
    let oscRingModFrequency = 0;
    oscRingMod.frequency.value = oscRingModFrequency;
    let oscRingModOn = false;

    // connections
    osc.connect(oscGain);
    connectNodeToEQ(oscGain);

    /**
    * Sets the waveform of the oscillator.
    *
    * @param {string} type - The type of waveform to set.
    * @return {void}
    */
    function setOSCWaveform(type) {
        osc.type = type;
    }

    function setOSCFrequency(freq) {
        osc.frequency.value = freq;
    }

    function setOSCGain(gain) {
        oscCurrentGain = gain;
        oscGain.gain.value = oscCurrentGain;
    }

    function setOSCAttack(attack) {
        oscAttack = attack;
    }

    function setOSCDecay(decay) {
        oscDecay = decay;
    }

    function setOSCSustain(sustain) {
        oscSustain = sustain;
    }

    function setOSCRelease(release) {
        oscRelease = release;
    }

    /**
    * Transposes the frequency of the oscillator by a given interval in semitones.
    *
    * @param {number} semitones - The number of semitones by which the frequency should be transposed.
    * @return {void}
    */
    function transpose(semitones) {
        const factor = Math.pow(2, semitones / 12);
        osc.frequency.value *= factor;
    }
    /**
    * Switches the frequency modulation on/off.
    *
    * @return {void}
    */
    function toggleOSCFreqMod() {
        if (oscFreqModOn) {
            oscFreqMod.frequency.value = 0;
            oscFreqModOn = false;
        } else {
            oscFreqMod.frequency.value = oscFreqModFrequency;
            oscFreqModOn = true;
        }
    }

    function setOSCFrequModGain(gain) {
        oscFreqModCurrentGain = gain;
        if (oscFreqModOn) {
            oscFreqModGain.gain.value = oscFreqModCurrentGain;
        }
    }

    function setOSCFreqModFreq(freq) {
        oscFreqMod.frequency.value = freq;
    }

    function setOSCRingModFreq(freq) {
        oscRingModFrequency = freq;
        if (oscRingModOn) {
            oscRingMod.frequency.value = freq;
        }
    }

    function toggleOSCRingModFreq() {
        if (oscRingModOn) {
            oscRingMod.frequency.value = 0;
            oscRingModOn = false;
        } else {
            oscRingMod.frequency.value = oscRingModFrequency;
            oscRingModOn = true;
        }
    }

    /**
    * Plays the oscillator with the frequency modulator and the ring modulator if they are on.
    *
    *  @return {void}
    */
    function playOSC() {
        if (!oscStarted) {
            osc.start();
            oscFreqMod.start();
            oscRingMod.start();
            oscStarted = true;
        }

        let time = audioCtx.currentTime;
        oscGain.gain.cancelScheduledValues(time);
        oscGain.gain.setValueAtTime(0, time);
        // attack
        oscGain.gain.linearRampToValueAtTime(1, time + oscAttack);
        oscGain.gain.setValueAtTime(1, time + oscAttack);
        // decay, sustain
        oscGain.gain.linearRampToValueAtTime(oscSustain * oscCurrentGain, time + oscAttack + oscDecay);

        oscRingModGain.gain.setValueAtTime(1, time);
    }

    function stopOSC() {
        const time = audioCtx.currentTime;
        oscGain.gain.cancelScheduledValues(time);
        oscGain.gain.setValueAtTime(oscGain.gain.value, time);
        oscGain.gain.linearRampToValueAtTime(0, time + oscRelease);

        oscRingModGain.gain.setValueAtTime(0, time);
    }

    return {
        setOSCWaveform,
        setOSCFrequency,
        setOSCGain,
        setOSCAttack, setOSCDecay, setOSCSustain, setOSCRelease,
        transpose,
        toggleOSCFreqMod, setOSCFrequModGain, setOSCFreqModFreq,
        setOSCRingModFreq, toggleOSCRingModFreq,
        playOSC, stopOSC
    };
}
const controller1 = createOSC();
controllers.push(controller1);

const controller2 = createOSC();
controllers.push(controller2);

export { audioCtx, analyser, controllers };