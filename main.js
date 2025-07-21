import Analyser from "./audioProcessing/analyser.js";
import Equaliser from "./audioProcessing/equaliser.js";
import ThreeVisualiserHandler from "./visualiser/three-visualiser-handler.js";

const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer = null;
let audioSource = null;
let startflag = false;
let isAudioLoaded = false;
let isVisualiserReady = false;
let visualiser3D = null;
let equaliser = null;
let analyser = null;



fetch("./audio/Motionless In White - Wasp.mp3")
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(decodedAudio => {
        audioBuffer = decodedAudio;
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        document.getElementById('play-audio-button').textContent = 'play audio - ready';
        isAudioLoaded = true;
    })
    .catch(error => console.error('error loading audio', error));


// ------------------------------------------------------------------------
// drag and drop
const dropzone = document.getElementById('dropzone');
const playAudioButton = document.getElementById('play-audio-button');

dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
});

dropzone.addEventListener('dragleave', () => {
});

dropzone.addEventListener('drop', async (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];

    if (!file || !file.type.startsWith('audio/')) {
        alert('The file must be an audio file.');
        return;
    }
    // stop previous audio
    if (audioSource) {
        audioContext.suspend();
        audioSource.stop();
    }

    playAudioButton.textContent = 'loading audio ...';

    const reader = new FileReader();
    reader.onload = async function (event) {
        const arrayBuffer = event.target.result;

        try {
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            audioSource = audioContext.createBufferSource();
            startflag = false; // new audio = reset startflag
            playAudioButton.textContent = 'play audio - ready';
            isAudioLoaded = true;
        } catch (error) {
            console.error('error loading audio:', error);
        }
    };
    reader.readAsArrayBuffer(file);
});
// ------------------------------------------------------------------------



/**
 * Creates a new audio source and initializes equaliser, analyser and visualiser and stops any previous audio.
 * 
 * @return {void}
 */
function createSource() {

    // clearing all previous objects
    if (equaliser) {
        try {
            equaliser = null;
        } catch (err) { }
    }
    if (analyser) {
        try {
            analyser = null;
        } catch (err) { }
    }
    if (visualiser3D) {
        try {
            visualiser3D.disposeVisualiser(visualiser3D.currentVisualiser);
            visualiser3D = null;
        } catch (err) { }
    }

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;

    equaliser = new Equaliser(audioSource, audioContext);
    analyser = new Analyser(equaliser.getLastNode(), audioContext);
    visualiser3D = new ThreeVisualiserHandler(analyser);
    isVisualiserReady = true;
}

/**
 * Starts playing the loaded audio file.
 * 
 * @return {void}
 */
function playAudio() {
    if (audioBuffer) {
        createSource();
        audioSource.start(0);
    } else {
        console.log('audio is not loaded yet');
    }
}

playAudioButton.addEventListener('click', () => {

    if (isAudioLoaded) {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
            playAudioButton.textContent = 'pause';
        }
        if (!startflag) {
            startflag = true;
            playAudio();
        }
        if (audioContext.state === 'running') {
            audioContext.suspend();
            playAudioButton.textContent = 'resume';
        }
    }
});


const buttonChangeVisualiserToFewLines = document.getElementById("visualiser-flying-lines");
buttonChangeVisualiserToFewLines.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[0]);
});

const buttonChangeVisualiserToLaserLines = document.getElementById("visualiser-laser-lines");
buttonChangeVisualiserToLaserLines.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[1]);
});

const buttonChangeVisualiserTo3DMountains = document.getElementById("visualiser-3d-mountains");
buttonChangeVisualiserTo3DMountains.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[2]);
});

const buttonChangeVisualiserToManyLines = document.getElementById("visualiser-flying-fading-lines")
buttonChangeVisualiserToManyLines.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[3]);
});

const buttonChangeVisualiserToMirrorLines = document.getElementById("visualiser-mirror-lines")
buttonChangeVisualiserToMirrorLines.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[4]);
});

const buttonChangeVisualiserUpDown = document.getElementById("visualiser-up-down")
buttonChangeVisualiserUpDown.addEventListener("click", () => {
    if (isVisualiserReady)
        visualiser3D.changeVisualiser(ThreeVisualiserHandler.availableVisualisers[5]);
});


// adds event listeners to the equaliser sliders
for (let i = 1; i <= 7; i++) {
    document.getElementById(`eq-band-${i}`).addEventListener("input", (event) => {
        equaliser.setEQGain(i - 1, event.target.value);
    });
}


document.getElementById("reset-equaliser").addEventListener("click", (event) => {
    // reset all equaliser bands to 0
    for (let i = 1; i <= 7; i++) {
        equaliser.setEQGain(i - 1, 0);
    }
    for (let i = 1; i <= 7; i++) {
        document.getElementById(`eq-band-${i}`).value = 0;
    }
}
);

function resizeCanvas() {
    // console.log(window.innerWidth, window.innerHeight);
    if (visualiser3D != null)
        visualiser3D.resizeCanvas();
}

window.onresize = resizeCanvas;
let isUIHidden = false;
window.addEventListener("keypress", (event) => {

    switch (event.key) {
        case 'h':
            if (!isUIHidden) {
                hideUI();
                isUIHidden = true;
            }
            else {
                showUI();
                isUIHidden = false;
            }

            break;

        case 'H':
            if (!isUIHidden) {
                hideUI();
                isUIHidden = true;
            }
            else {
                showUI();
                isUIHidden = false;
            }
            break;
    }

});
function hideUI() {
    document.getElementById('dropzone').style.display = 'none';
    document.getElementById('play-audio-button').style.display = 'none';
    document.getElementById('visualiser-buttons').style.display = 'none';
    document.getElementsByClassName('fader-container')[0].style.display = 'none';
    resizeCanvas();
}
function showUI() {
    document.getElementById('dropzone').style.display = 'flex';
    document.getElementById('play-audio-button').style.display = 'inline-block';
    document.getElementById('visualiser-buttons').style.display = 'flex';
    document.getElementsByClassName('fader-container')[0].style.display = 'flex';
    resizeCanvas();
}
