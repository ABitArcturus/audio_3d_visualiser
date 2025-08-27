//TODO pressing buttons not deselecting the key
//save presets
import AudioOscillatorController from "./audioProcessing/audio-oscillator-controller.js";
import Equaliser from "./audioProcessing/equaliser.js";
import Analyser from "./audioProcessing/analyser.js";
import { SelectedOscillatorStore, WaveformViewUpdater, FrequencyViewUpdater, AttackControl, DecayControl } from "./oscillator-state-manager.js";
import Potentiometer from "./potentiometer.js";
/* import { startWhiteNoise, stopWhiteNoise, setWhiteNoiseGain } from "./audioProcessing/whiteNoiseGen.js";
import { setEQGain } from "./audioProcessing/equalizer.js"; */

const root = document.documentElement;
const WHITE_SYNTHESIZER_KEY_HOVER_COLOR = getComputedStyle(root).getPropertyValue('--white-synthesizer-key-hover').trim();
const BLACK_SYNTHESIZER_KEY_HOVER_COLOR = getComputedStyle(root).getPropertyValue('--black-synthesizer-key-hover').trim();
//TODO const SELECTED_SYNTHESIZER_KEY_COLOR = getComputedStyle(root).getPropertyValue('--selected-synthesizer-key').trim();
const SELECTED_SYNTHESIZER_KEY_COLOR = "rgb(255, 17, 17)";
const SELECTED_SYNTHESIZER_KEY_BEING_PLAYED_COLOR = "rgb(156, 17, 17)";

/* const KEY_LAYOUT = {
    oscillator0: { index: 0, computerKeys: ["a", "A"], synthesizerKey: "c", hertz: 261 },
    oscillator1: { index: 1, computerKeys: ["w", "W"], synthesizerKey: "c-sharp", hertz: 277 },
    oscillator2: { index: 2, computerKeys: ["s", "S"], synthesizerKey: "d", hertz: 293 },
    oscillator3: { index: 3, computerKeys: ["e", "E"], synthesizerKey: "d-sharp", hertz: 311 },
    oscillator4: { index: 4, computerKeys: ["d", "D"], synthesizerKey: "e", hertz: 329 },
    oscillator5: { index: 5, computerKeys: ["f", "F"], synthesizerKey: "f", hertz: 349 },
    oscillator6: { index: 6, computerKeys: ["t", "T"], synthesizerKey: "f-sharp", hertz: 369 },
    oscillator7: { index: 7, computerKeys: ["g", "G"], synthesizerKey: "g", hertz: 392 },
    oscillator8: { index: 8, computerKeys: ["z", "Z"], synthesizerKey: "g-sharp", hertz: 415 },// z für deutsch y,Y für englisch
    oscillator9: { index: 9, computerKeys: ["h", "H"], synthesizerKey: "a", hertz: 440 },
    oscillator10: { index: 10, computerKeys: ["u", "U"], synthesizerKey: "a-sharp", hertz: 466 },
    oscillator11: { index: 11, computerKeys: ["j", "J"], synthesizerKey: "b", hertz: 493 }
}; */
const KEY_LAYOUT = {
    oscillator0: { index: 0, computerKeys: ["a", "A"], synthesizerKey: "c", hertz: 261 },
    oscillator1: { index: 1, computerKeys: ["w", "W"], synthesizerKey: "c-sharp", hertz: 477 },
    oscillator2: { index: 2, computerKeys: ["s", "S"], synthesizerKey: "d", hertz: 693 },
    oscillator3: { index: 3, computerKeys: ["e", "E"], synthesizerKey: "d-sharp", hertz: 811 },
    oscillator4: { index: 4, computerKeys: ["d", "D"], synthesizerKey: "e", hertz: 1029 },
    oscillator5: { index: 5, computerKeys: ["f", "F"], synthesizerKey: "f", hertz: 1249 },
    oscillator6: { index: 6, computerKeys: ["t", "T"], synthesizerKey: "f-sharp", hertz: 1469 },
    oscillator7: { index: 7, computerKeys: ["g", "G"], synthesizerKey: "g", hertz: 1692 },
    oscillator8: { index: 8, computerKeys: ["z", "Z"], synthesizerKey: "g-sharp", hertz: 1815 },// z für deutsch y,Y für englisch
    oscillator9: { index: 9, computerKeys: ["h", "H"], synthesizerKey: "a", hertz: 2240 },
    oscillator10: { index: 10, computerKeys: ["u", "U"], synthesizerKey: "a-sharp", hertz: 2466 },
    oscillator11: { index: 11, computerKeys: ["j", "J"], synthesizerKey: "b", hertz: 2893 }
};

const audioContext = AudioOscillatorController.getAudioContext();


// the oscillator when no key is selected
const detachedOscillator = new AudioOscillatorController();

const NUMBER_OF_KEYS = Object.entries(KEY_LAYOUT).length;
// using the const instead of Object.entries() is more efficient as Object.entries() would be recalculated on every iteration

const synthesizer = []; // includes all oscillators

/* const knob = document.getElementById("knob");
const style = getComputedStyle(knob); */
//const transform = style.transform;

/* //TODO selber machen
const values = transform.match(/matrix\(([^)]+)\)/)[1].split(', ');
const a = parseFloat(values[0]);
const b = parseFloat(values[1]);

// Rotation in Grad berechnen
let angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));

// Normalisieren auf positiven Wert
if (angle < 0) angle += 360;

console.log(`Rotation: ${angle}°`);



console.log(style.transform);
 */
/* knob.addEventListener("click", function (event) {
    // Position relativ zum Viewport
    const globalX = event.clientX;
    const globalY = event.clientY;
    const rect = knob.getBoundingClientRect();

    // Position relativ zum Element
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    console.log("Global Position: ", localX, localY);

}); */

// initializing all the oscillators/synthesizer
for (let i = 0; i < NUMBER_OF_KEYS; i++) {
    const oscillator = new AudioOscillatorController();
    oscillator.setFrequency(Object.entries(KEY_LAYOUT)[i][1].hertz);
    synthesizer.push(oscillator);
};

export const equaliser = new Equaliser(AudioOscillatorController.getMixGain(), audioContext);
//equaliser.connectNodeToEQ(AudioOscillatorController.getMixGain(), audioContext);

export const analyser = new Analyser(equaliser.getLastNode(), audioContext);
/* analyser.visualize();
analyser.logRelevantFrequencies(); */


/* const visualiser = new Visualiser(analyser);
visualiser.visualize(); */



//load(analyser);

////////////////////////////////////////////////////////////////////////////////
// keyboard events
window.addEventListener("keydown", (event) => {
    // modularer Weg, aber deutlich rechenintensiver - Alternative wäre,
    // mit Hilfe des Objekts zwei Arrays zu erstellen, eins mit den Comp.Tasten und das
    // andere mit den Synth. Tasten, wobei die Indizes der Arrays übereinstimmen MÜSSEN
    // checking if the pressed key is in the KEY_LAYOUT thus valid
    for (const key in KEY_LAYOUT) {
        if (KEY_LAYOUT[key].computerKeys.includes(event.key)) {
            doHoverEffect(KEY_LAYOUT[key].index);
            synthesizer[KEY_LAYOUT[key].index].playOscillator();
        }
    }

});

window.addEventListener("keyup", (event) => {
    for (const key in KEY_LAYOUT) {
        if (KEY_LAYOUT[key].computerKeys.includes(event.key)) {
            removeHoverEffect(KEY_LAYOUT[key].index);
            synthesizer[KEY_LAYOUT[key].index].stopOscillator();
        }
    }
});

function doHoverEffect(synthesizerKey) {


    const targetKey = document.querySelector(`[id=synthesizer-key-${synthesizerKey}]`);


    if (currentlySelectedKey === targetKey) {
        targetKey.style.backgroundColor = SELECTED_SYNTHESIZER_KEY_BEING_PLAYED_COLOR;
        return;
    }

    if (targetKey.className.includes("white")) {


        targetKey.style.backgroundColor = WHITE_SYNTHESIZER_KEY_HOVER_COLOR;

    } else if (targetKey.className.includes("black")) {
        targetKey.style.backgroundColor = BLACK_SYNTHESIZER_KEY_HOVER_COLOR;
    }
}

function removeHoverEffect(synthesizerKey) {

    const targetKey = document.querySelector(`[id=synthesizer-key-${synthesizerKey}]`);
    if (currentlySelectedKey === targetKey) {
        targetKey.style.backgroundColor = SELECTED_SYNTHESIZER_KEY_COLOR;
    } else {
        targetKey.style.backgroundColor = ""; // reset to default color
    }
}

////////////////////////////////////////////////////////////////////////////////

const selectedOscillator = new SelectedOscillatorStore();
selectedOscillator.set(detachedOscillator);
const freqencyViewUpdater = new FrequencyViewUpdater("frequency", "frequency-display", selectedOscillator);
const waveformViewUpdater = new WaveformViewUpdater("waveform", selectedOscillator);

const adsrContainer = document.getElementById("adsr-container");
//adsrContainer.style.display = "block";

// attack, decay, sustain, release potentiometers
const attackControl = new AttackControl(selectedOscillator);
const attackPotentiometer = new Potentiometer(0, 1, 0.1, "attack-potentiometer", attackControl);
attackControl.setPotentiometer(attackPotentiometer);

const attackContainer = document.getElementById("attack-container")
attackContainer.appendChild(attackPotentiometer.getPotentiometer());

/* const decayControl = new DecayControl(selectedOscillator);
const decayPotentiometer = new Potentiometer(0, 10, 0.1, "decay-potentiometer", decayControl);
decayControl.setPotentiometer(decayPotentiometer);
 
const decayContainer = document.getElementById("decay-container")
decayContainer.appendChild(decayPotentiometer.getPotentiometer());
 */

/* const test = document.createElement("div");
test.innerHTML = "test";
document.body.appendChild(test);
const test2 = document.createElement("div");
test2.innerHTML = "test2";
document.body.appendChild(test2); */

let selectedOscillatorIndex = null;
let currentlySelectedKey = null;
let isCurrentlyEditing = false;



// clicking on the keys to select them
window.addEventListener("click", (event) => {
    const targetKey = event.target;
    //console.log(event.target);

    if (targetKey.getAttribute("synthesizer-key")) {
        if (currentlySelectedKey) {
            currentlySelectedKey.style.backgroundColor = ""; // reset previous key color
        }
        if (currentlySelectedKey === targetKey) { // deselect
            currentlySelectedKey = null;
        } else {
            currentlySelectedKey = targetKey;
            currentlySelectedKey.style.backgroundColor = SELECTED_SYNTHESIZER_KEY_COLOR;
            isCurrentlyEditing = true;

            
            selectedOscillatorIndex = targetKey.getAttribute("index"); // TODO brauche ich noch?
            selectedOscillator.set(synthesizer[selectedOscillatorIndex]);
        }


        // click outside of the keyboard for deselection
        /*  if (currentlySelectedKey === targetKey) {
             currentlySelectedKey = null;
             selectedOscillator.set(detachedOscillator);
             selectedOscillatorIndex = null;
         } */
    } else {
        /*  currentlySelectedKey.style.backgroundColor = "";
         selectedOscillator.set(null);
         selectedOscillatorIndex = null;
         isCurrentlyEditing = false;
         console.log("editing oscillator:", selectedOscillatorIndex); */
    }
});



/* let waveformControl = document.getElementById("waveform");
 */
function updateControlUnitsFromSelectedOscillator() {

    /*     waveformControl.value = synthesizer[selectedOscillatorIndex].getOSCWaveform();
     */


    /* const oscillator = synthesizer[selectedOscillatorIndex];
    document.getElementById("oscillatorFrequency").value = oscillator.getFrequency();
    document.getElementById("oscillatorGain").value = oscillator.getGain();
    document.getElementById("oscillatorAttack").value = oscillator.getAttack();
    document.getElementById("oscillatorDecay").value = oscillator.getDecay();
    document.getElementById("oscillatorSustain").value = oscillator.getSustain();
    document.getElementById("oscillatorRelease").value = oscillator.getRelease();
    document.getElementById("oscillatorWaveform").value = oscillator.getWaveform(); */
}


/* 
// OSC 1
const controller1 = controllers[0];
let isOSC1Playing = false;
 
// play (1)
document.getElementById("osc1TogglePlay").addEventListener("click", function () {
    if (isOSC1Playing) {
        controller1.stopOSC();
    } else {
        controller1.playOSC();
    }
    isOSC1Playing = !isOSC1Playing;
});
 
 
// gain (1)
document.getElementById("osc1Gain").addEventListener("input", function () {
    controller1.setOSCGain(parseFloat(this.value));
    document.getElementById("osc1GainValue").textContent = this.value;
});
 
// attack (1)
document.getElementById("osc1Attack").addEventListener("input", function () {
    controller1.setOSCAttack(parseFloat(this.value));
    document.getElementById("osc1AttackValue").textContent = this.value;
});
 
// decay (1)
document.getElementById("osc1Decay").addEventListener("input", function () {
    controller1.setOSCDecay(parseFloat(this.value));
    document.getElementById("osc1DecayValue").textContent = this.value;
});
 
// sustain (1)
document.getElementById("osc1Sustain").addEventListener("input", function () {
    controller1.setOSCSustain(parseFloat(this.value));
    document.getElementById("osc1SustainValue").textContent = this.value;
});
 
// release (1)
document.getElementById("osc1Release").addEventListener("input", function () {
    controller1.setOSCRelease(parseFloat(this.value));
    document.getElementById("osc1ReleaseValue").textContent = this.value;
});
 
// transpose up (1)
document.getElementById("osc1TransposeUp").addEventListener("click", function () {
    controller1.transpose(1);
});
 
// transpose down (1)
document.getElementById("osc1TransposeDown").addEventListener("click", function () {
    controller1.transpose(-1);
});
 
// freq mod (1)
document.getElementById("osc1ToggleFreqMod").addEventListener("click", function () {
    controller1.toggleOSCFreqMod();
});
 
document.getElementById("osc1FrequModGain").addEventListener("input", function () {
    controller1.setOSCFrequModGain(parseFloat(this.value));
    document.getElementById("osc1FrequModGainValue").textContent = this.value;
});
 
document.getElementById("osc1FreqModFreq").addEventListener("input", function () {
    controller1.setOSCFreqModFreq(parseFloat(this.value));
    document.getElementById("osc1FreqModFreqValue").textContent = this.value;
});
 
// ring mod (1)
document.getElementById("toggleOSC1RingModFreq").addEventListener("click", function () {
    controller1.toggleOSCRingModFreq();
});
 
document.getElementById("osc1RingModFreq").addEventListener("input", function () {
    controller1.setOSCRingModFreq(parseFloat(this.value));
    document.getElementById("osc1RingModFreqValue").textContent = this.value;
});
 
// noise
document.getElementById("startWhiteNoiseBttn").addEventListener("click", function () {
    startWhiteNoise();
});
 
document.getElementById("stopWhiteNoiseBttn").addEventListener("click", function () {
    stopWhiteNoise();
});
 
document.getElementById("whiteNoiseGainSlider").addEventListener("input", function () {
    const gainValue = parseFloat(this.value);
    setWhiteNoiseGain(gainValue);
    document.getElementById("whiteNoiseGainValue").textContent = gainValue.toFixed(2);
});
*/
// eq
/* document.getElementById("eqBand1").addEventListener("input", (event) => {
    equaliser.setEQGain(0, event.target.value);
});

document.getElementById("eqBand2").addEventListener("input", (event) => {
    equaliser.setEQGain(1, event.target.value);
});

document.getElementById("eqBand3").addEventListener("input", (event) => {
    setEQGain(2, event.target.value);
});

document.getElementById("eqBand4").addEventListener("input", (event) => {
    setEQGain(3, event.target.value);
});

document.getElementById("eqBand5").addEventListener("input", (event) => {
    setEQGain(4, event.target.value);
});

document.getElementById("eqBand6").addEventListener("input", (event) => {
    setEQGain(5, event.target.value);
});

document.getElementById("eqBand7").addEventListener("input", (event) => {
    setEQGain(6, event.target.value);
});

document.getElementById("eqBand8").addEventListener("input", (event) => {
    setEQGain(7, event.target.value);
}); */




export { KEY_LAYOUT, selectedOscillator };
//export default analyser;