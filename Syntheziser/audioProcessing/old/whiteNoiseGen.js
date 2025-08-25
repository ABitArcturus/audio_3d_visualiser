import { audioCtx } from "./oscController.js";
import { connectNodeToEQ } from "./equalizer.js";

const whiteNoise = audioCtx.createBufferSource();
const bufferSize = 2 * audioCtx.sampleRate;
const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
const outputData = buffer.getChannelData(0);
let whiteNoiseStarted = false;
let whiteNoiseOn = false;

// generates white noise
//fills the outputData array with random numbers between -1 & 1
for (let i = 0; i < bufferSize; i++) {
    outputData[i] = Math.random() * 2 - 1;
}

whiteNoise.buffer = buffer;
whiteNoise.loop = true;

const whiteNoiseGain = audioCtx.createGain();
let whiteNoiseCurrentGain = 0.5;
whiteNoiseGain.gain.value = whiteNoiseCurrentGain;

whiteNoise.connect(whiteNoiseGain);
connectNodeToEQ(whiteNoiseGain);


function startWhiteNoise() {
    if (!whiteNoiseStarted) {
        whiteNoise.start();
        whiteNoiseStarted = true;
        whiteNoiseOn = true;
    } else {
        whiteNoiseGain.gain.value = whiteNoiseCurrentGain;
        whiteNoiseOn = true;
    }
}

function stopWhiteNoise() {
    whiteNoiseGain.gain.value = 0;
    whiteNoiseOn = false;
}

function setWhiteNoiseGain(gain) {
    whiteNoiseCurrentGain = gain;
    if (whiteNoiseOn) {
        whiteNoiseGain.gain.value = whiteNoiseCurrentGain;
    }
}

export { startWhiteNoise, stopWhiteNoise, setWhiteNoiseGain }