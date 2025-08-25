import Analyser from "./analyser.js";
// import analyser from "../button-controller.js";
import Visualiser from "../visualiser/visualiser.js";
import Equaliser from "./equaliser.js";
//import ThreeVis from "../visualiser/three-visualiser.js"; // boring cubes
import ThreeVis from "../visualiser/three-visualiser-two.js"; // cool effect
//import ThreeVis from "../visualiser/three-visualiser-three.js"; // 3d mountains
//import ThreeVis from "../visualiser/three-visualiser-four.js"; // longer waves
//import ThreeVis from "../visualiser/three-visualiser-five.js"; // non wokring cubes
//import ThreeVis from "../visualiser/three-visualiser-six.js"; 


const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffer = null;
let audioSource = null;
let startflag = false;
let equaliser = null;
let visualiser3D = null;
let isAudioLoaded = false;

fetch("./audio/1.mp3")
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(decodedAudio => {
        audioBuffer = decodedAudio;
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        document.getElementById('play-audio-button').textContent = 'Play audio - ready';
    })
    .catch(error => console.error('error loading audio', error));

//////////////////////////////////////////////////////////// drag and drop
const dropzone = document.getElementById('dropzone');
const playAudioButton = document.getElementById('play-audio-button');

dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    // dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    // dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', async (event) => {
    event.preventDefault();
    // dropzone.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    
    if (!file || !file.type.startsWith('audio/')) {
        alert('The file must be an audio file.');
        return;
    }
    
    playAudioButton.textContent = 'loading audio ...';

    const reader = new FileReader();
    reader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        
        try {
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            createSource();
            startflag = false; // new audio = reset startflag
            playAudioButton.textContent = 'Play audio - ready';
        } catch (error) {
            console.error('error loading audio:', error);
        }
    };
    
    reader.readAsArrayBuffer(file);
});


function createSource() {

    // stop previous audio
    if (audioSource) {
        try {
            audioSource.stop();
        } catch (err) { }
    }
    
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    
    
    equaliser = new Equaliser(audioSource, audioContext);


    const analyser = new Analyser(equaliser.getLastNode(), audioContext);
  
    const visualiser2D = new Visualiser(analyser);
    visualiser2D.visualize();
    
    visualiser3D = new ThreeVis(analyser);
}

//////////////////////////////////////////////////////////// 


function playAudio() {
    if (audioBuffer) {
        createSource();
   
        audioSource.start(0);
    } else {
        console.log('audio is not loaded yet');
    }
}


playAudioButton.addEventListener('click', () => {

    if (audioContext.state === 'suspended') {
        audioContext.resume();
        playAudioButton.textContent = 'Pause';
    }
    if (!startflag) {
        startflag = true;
        playAudio();
    }
    if (audioContext.state === 'running') {
        audioContext.suspend();
        playAudioButton.textContent = 'Resume';

    }
});

const resetButton = document.getElementById('reset-view-button');
resetButton.addEventListener('click', () => {
    visualiser3D.resetView();
});




document.getElementById("eqBand1").addEventListener("input", (event) => {
    equaliser.setEQGain(0, event.target.value);
});

document.getElementById("eqBand2").addEventListener("input", (event) => {
    equaliser.setEQGain(1, event.target.value);
});

document.getElementById("eqBand3").addEventListener("input", (event) => {
    equaliser.setEQGain(2, event.target.value);
});

document.getElementById("eqBand4").addEventListener("input", (event) => {
    equaliser.setEQGain(3, event.target.value);
});

document.getElementById("eqBand5").addEventListener("input", (event) => {
    equaliser.setEQGain(4, event.target.value);
});

document.getElementById("eqBand6").addEventListener("input", (event) => {
    equaliser.setEQGain(5, event.target.value);
});

document.getElementById("eqBand7").addEventListener("input", (event) => {
    equaliser.setEQGain(6, event.target.value);
});

document.getElementById("eqBand8").addEventListener("input", (event) => {
    equaliser.setEQGain(7, event.target.value);
});

/* 
for (let i = 1; i <= 8; i++) {
    document.getElementById(`eqBand${i}`).addEventListener("input", (event) => {
        equaliser.setEQGain(i - 1, event.target.value);
    });
}
     */