import AudioOscillatorController from "./audioProcessing/audio-oscillator-controller.js";
import Potentiometer from "./potentiometer.js";

// publisher/subject
export class SelectedOscillatorStore {

    constructor() {
        this.observers = [];
        this.currentOscillator = null;
    }


    set(oscillator) {
        this.currentOscillator = oscillator;
        this.notify();
    }

    getOscillator() {
        return this.currentOscillator;
    }
    subscribe(observer) {
        this.observers.push(observer);
    }
    unsubscribe(observer) {
    }
    notify() {
        if (!this.currentOscillator) return;

        this.observers.forEach(observer => observer.update(this.currentOscillator));
    }
}

class Observer {
    constructor(oscillatorStore) {
        this.oscillatorStore = oscillatorStore;
        this.oscillatorStore.subscribe(this);
        this.currentOscillator = this.oscillatorStore.getOscillator();
    }

    update(parameter) {
        console.log("Observer update called with parameter:", parameter);
    }



}
class ObserverWithPotentiometer extends Observer {
    constructor(oscillatorStore, potentiometer) {
        super(oscillatorStore);

        this.potentiometer = null;
    }
    /**
  * Needs to be seperated from the constructor, because of mututal depedency of a UI potentiometer
  * and the 
  * gegenseitige abhäng., aber auch, weil nicht
  * alle Observer einen Potentiometer haben
  * 
  * @param {*} potentiometer 
  */
    setPotentiometer(potentiometer) {
        if (!potentiometer || !(potentiometer instanceof Potentiometer))
            throw new Error("Invalid potentiometer. Expected an instance of AudioOscllatorController.");

        this.potentiometer = potentiometer;
    }
    /**
         * @param {*} parameter - The parameter can be an instance of AudioOscillatorController or a number.
         * @returns 
         */
    update(parameter) {

        if (!this.currentOscillator || !this.potentiometer)
            throw new Error("Current oscillator or potentiometer is not set.");

        // updates the current oscillator
        if (parameter instanceof AudioOscillatorController) {
            this.currentOscillator = parameter;


            this.updateValueInPotentiometer();

            // updates the attack value in the UI
        } else if (typeof parameter === "number") {



            this.updateValueInOscillator(parameter)

        } else {
            console.error("Invalid parameter type. Expected AudioOscillatorController or number.");
            return;
        }


        /*  this.value.textContent = this.currentOscillator.getFrequency();
         this.range.value = this.value.textContent; */
    }
    // TODO make private
    updateValueInOscillator(parameter) {
        console.log("Updating value in Oscillator: " + parameter);
    }
    // TODO make private
    updateValueInPotentiometer() {
        console.log("Updating value in Potentiometer: ", this.currentOscillator);
    }

}
// observer/subscriber
export class AttackControl extends ObserverWithPotentiometer {

    constructor(oscillatorStore) {
        super(oscillatorStore);

        this.attack = null;
    }
    // TODO make private
    updateValueInOscillator(parameter) {
        console.log("AttackControl: ");
        this.attack = parameter;
        this.currentOscillator.setAttack(this.attack);
    }
    // TODO make private
    updateValueInPotentiometer() {
        console.log(this.currentOscillator);
        this.attack = this.currentOscillator.getAttack();
        this.potentiometer.setCurrentValue(this.attack);
    }

}


export class DecayControl extends Observer {

    constructor(oscillatorStore) {
        super(oscillatorStore);

        this.decay = null;
        this.potentiometer = null;
    }

    // updating the value in the potentiometer UI

    update(parameter) {
        if (!this.currentOscillator || !this.potentiometer) return;

        // updates the current oscillator
        if (parameter instanceof AudioOscillatorController) {
            this.currentOscillator = parameter;
            this.decay = this.currentOscillator.getDecay();

            this.potentiometer.setCurrentValue(this.decay);

            // updates the decay value in the UI
        } else if (typeof parameter === "number") {
            this.decay = parameter;
            this.currentOscillator.setDecay(this.decay);
        } else {
            console.error("Invalid parameter type. Expected AudioOscillatorController or number.");
            return;
        }
    }

}
// extends Observer hinter dem Classname
// observer/subscriber
export class WaveformViewUpdater extends Observer {

    constructor(id, oscillatorStore) {
        super(oscillatorStore);
        // this.oscillatorStore = oscillatorStore;
        // this.oscillatorStore.subscribe(this);
        // this.currentOscillator = this.oscillatorStore.getOscillator();
        this.waveform = document.getElementById(id);

        this.waveform.addEventListener("change", (event) => {
            this.currentOscillator.setWaveform(event.target.value);
        });
    }
    update(oscillator) {
        this.currentOscillator = oscillator;
        this.waveform.value = this.currentOscillator.getWaveform();
    }
}

// observer/subscriber
export class FrequencyViewUpdater extends Observer {
    constructor(idRange, idDisplay, oscillatorStore) {
        super(oscillatorStore);


        this.range = document.getElementById(idRange);
        this.value = document.getElementById(idDisplay);
        // this.oscillatorStore = oscillatorStore;
        // this.oscillatorStore.subscribe(this);
        // this.currentOscillator = this.oscillatorStore.getOscillator();

        this.range.addEventListener("input", () => {
            if (this.oscillatorStore) {
                this.currentOscillator.setFrequency(parseFloat(this.range.value));
                this.value.textContent = this.range.value;
            }
        });
    }

    update(oscillator) {
        this.currentOscillator = oscillator;
        this.value.textContent = this.currentOscillator.getFrequency();
        this.range.value = this.value.textContent;
    }

}







/* 

class OscillatorSubscriber {
  constructor(id, oscillatorStore) {
    this.oscillatorStore = oscillatorStore;
    this.oscillatorStore.subscribe(this);
    this.currentOscillator = this.oscillatorStore.getOscillator();
    this.id = id;
  }
}


class SomeClass extends OscillatorSubscriber {
  constructor(id, oscillatorStore) {
    super(id, oscillatorStore);
  }
*/