import { KEY_LAYOUT } from "./button-controller.js";

const NUMBER_OF_KEYS = Object.entries(KEY_LAYOUT).length;
const NOTES = ["c", "c-sharp", "d", "d-sharp", "e", "f", "f-sharp", "g", "g-sharp", "a", "a-sharp", "b"]; // 12

const keyboard = document.getElementById("keyboard");

// required steps to create the keyboard - related to the creation of the black keys
const C_TO_E = 5;
const F_TO_B = 7;

let keyPairContainerCount = 0;
let parentKeyContainer = null;

let octaveCount = 0;
let currentOctave = 0;


// 6. 13. taste bzw. 5 mal erstellen, dann 7 mal
// creating the keyboard keys
for (let i = 0; i < NUMBER_OF_KEYS; i++) {

    const key = document.createElement("div");

    if (NOTES[i % NOTES.length].includes("-sharp")) {
        key.className = "key black";
    } else {
        key.className = "key white";
    }

    key.setAttribute("synthesizer-key", NOTES[i % NOTES.length]);
    key.innerHTML = Object.entries(KEY_LAYOUT)[i][1].computerKeys[0];
    key.setAttribute("id", "synthesizer-key-" + i);
    key.setAttribute("index", i);
    // Using C0 as reference, which does not follow the standard octave convention (C4 is typically used as the middle C)
    key.setAttribute("octave", currentOctave);

    // for CSS layout purposes, the black keys are placed within the same div as the white keys
    if (!(NOTES[i % NOTES.length] == "e") && !(NOTES[i % NOTES.length] == "b")
        && keyPairContainerCount == 0) {
        const keyPair = document.createElement("div");
        keyPair.className = "key pair";
        keyboard.appendChild(keyPair);
        keyPair.appendChild(key);
        keyPairContainerCount++;

        parentKeyContainer = keyPair;

    } else if (keyPairContainerCount != 0) {
        parentKeyContainer.appendChild(key);
        keyPairContainerCount = 0;
    } else {
        // single white key
        keyboard.appendChild(key);
    }
    octaveCount++;
    if (octaveCount % 12 == 0) {//12
        currentOctave++;
        octaveCount = 0;
    }
    //console.log(key)
}
