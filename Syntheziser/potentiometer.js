/* 

CSS 0° angle is at 6 o'clock and continues clockwise

initial angle of ...todo

45 -315

*/


/**
 * Potentiometer class for creating a circular potentiometer UI element.
 */
class Potentiometer {

    // if - value then 0 in the top middle
    /**
     * 
     * @param {*} minimumValue - Defines the minimum value of the potentiometer.
     * @param {*} maximumValue - Defines the maximum value of the potentiometer.
     * @param {*} valueSteps 
     * @param {*} name - The name of the potentiometer, used as an ID for the input field.
     * @param {*} objectToUpdate - The actual object to be updated with the current value of the potentiometer.
     */
    constructor(minimumValue, maximumValue, valueSteps, name, objectToUpdate) {
        // TODO if parameters are invalid then throw error
        this.minimumValue = minimumValue;
        this.maximumValue = maximumValue;
        this.valueSteps = valueSteps;
        this.name = name;
        this.objectToUpdate = objectToUpdate;

        this.currentValue = 0;
        this.currentAngle = 0;


        // default appearance
        this.CIRCLE_HEIGHT = 101;
        this.CIRCLE_WIDTH = 101; // must be odd to get exact center
        this.CIRCLE_CENTER = 51;
        this.CONTAINER_HEIGHT = this.CIRCLE_HEIGHT + 50;
        this.CONTAINER_WIDTH = this.CIRCLE_WIDTH + 50;
        this.VERTICAL_CENTER_CIRCLE = this.CONTAINER_HEIGHT / 2;
        const BOX_COLOR = 'rgb(194, 194, 194)';
        const CIRCLE_COLOR = 'rgb(65, 64, 64)';
        const POINTER_COLOR = 'rgb(255, 255, 255)';
        this.DEFAULT_MARK_COLOR = 'black';
        this.ACTIVE_MARK_COLOR = 'rgb(39, 182, 87)';

        // wrapper
        this.potentiometerWrapper = document.createElement('div');
        this.potentiometerWrapper.className = 'potentiometer-wrapper';
        this.potentiometerWrapper.style.backgroundColor = 'transparent';

        /*
        z-index/layering structure:

        potentiometerWrapper
            - potentiometerContainer
                - currentValueInput
                - circle
                    - pointer
                    - markingss
        */

        // box
        this.potentiometerContainer = document.createElement('div');
        this.potentiometerContainer.className = 'potentiometer-box';
        this.potentiometerContainer.style.width = this.CONTAINER_WIDTH + 'px';
        this.potentiometerContainer.style.height = this.CONTAINER_HEIGHT + 'px';
        this.potentiometerContainer.style.backgroundColor = BOX_COLOR;
        this.potentiometerContainer.style.position = 'relative';
        this.potentiometerContainer.style.zIndex = 0;

        //this.potentiometerWrapper.appendChild(this.potentiometerContainer);

        this.currentValueInput = document.createElement('input');
        this.currentValueInput.id = this.name;
        this.currentValueInput.style.backgroundColor = 'transparent';
        this.currentValueInput.style.width = '30px';
        this.currentValueInput.style.height = '10px';
        this.currentValueInput.style.position = 'absolute';
        this.currentValueInput.style.top = '5px';
        this.currentValueInput.style.padding = '0px';
        this.currentValueInput.style.margin = '0px';
        this.currentValueInput.style.backgroundColor = 'rgb(196, 92, 92)';
        this.currentValueInput.style.color = 'white';
        this.currentValueInput.style.border = '1px solid black';




        this.currentValueInput.style.left = this.CONTAINER_WIDTH / 2 - 15 + 'px';

        //   this.currentValueInput.style.zIndex = 2;



        this.currentValueInput.style.MozAppearance = 'textfield'; // removes the arrow buttons in Firefox

        this.potentiometerContainer.appendChild(this.currentValueInput);


        // circle
        this.circle = document.createElement('div');
        this.circle.className = 'potentiometer-circle';
        this.circle.style.width = this.CIRCLE_WIDTH + 'px';
        this.circle.style.height = this.CIRCLE_HEIGHT + 'px';
        this.circle.style.borderRadius = '50%';
        this.circle.style.backgroundColor = CIRCLE_COLOR;
        this.circle.style.position = 'relative';

        this.circle.style.top = this.VERTICAL_CENTER_CIRCLE - this.CIRCLE_HEIGHT / 2 + 'px';
        this.circle.style.left = this.CONTAINER_WIDTH / 2 - this.CIRCLE_WIDTH / 2 + 'px';


        /*  this.circle.style.position = 're';
         this.circle.style.zIndex = 1;
  */
        // refers to the CSS rotate angle
        // clickable range is from 45° to 315°	
        this.startDegree = 45;
        this.endDegree = 315;

        this.potentiometerContainer.appendChild(this.circle);

        // spacer
        // to make the lines appear as markings/indicators (with a gap to the circle)
        const spacer = document.createElement('div');
        spacer.className = 'potentiometer-spacer';
        spacer.style.width = this.CIRCLE_WIDTH + 5 + 'px'; // default 5
        spacer.style.height = this.CIRCLE_HEIGHT + 5 + 'px';
        spacer.style.borderRadius = '50%';
        spacer.style.backgroundColor = BOX_COLOR;
        spacer.style.position = 'absolute';
        spacer.style.top = this.VERTICAL_CENTER_CIRCLE - (this.CIRCLE_HEIGHT + 5) / 2 + 'px';
        spacer.style.left = this.CONTAINER_WIDTH / 2 - (this.CIRCLE_WIDTH + 5) / 2 + 'px';
        spacer.style.zIndex = -1;

        this.potentiometerContainer.appendChild(spacer);

        // value labels
        const minimumValueLabel = document.createElement('label');
        minimumValueLabel.innerHTML = this.minimumValue;
        minimumValueLabel.className = 'potentiometer-minimum-value';
        minimumValueLabel.style.position = 'absolute';
        minimumValueLabel.style.left = '20px';
        minimumValueLabel.style.bottom = '20px';
        minimumValueLabel.style.userSelect = 'none'; // prevents the text from being selected when dragging the potentiometer

        const maximumValueLabel = document.createElement('label');
        maximumValueLabel.innerHTML = this.maximumValue;
        maximumValueLabel.className = 'potentiometer-maximum-value';
        maximumValueLabel.style.position = 'absolute';
        maximumValueLabel.style.bottom = '20px';
        maximumValueLabel.style.right = '20px';
        maximumValueLabel.style.userSelect = 'none'; // prevents the text from being selected when dragging the potentiometer

        this.potentiometerContainer.appendChild(minimumValueLabel);
        this.potentiometerContainer.appendChild(maximumValueLabel);

        // pointer/the current value line
        this.pointer = document.createElement('div');
        this.pointer.className = 'line';
        this.pointer.style.position = 'absolute';


        this.pointer.style.top = '50%';
        this.pointer.style.left = '50%';
        /*   this.pointer.style.top = this.CIRCLE_CENTER + 'px';
          this.pointer.style.left = this.CIRCLE_CENTER + 'px'; */

        this.pointer.style.width = '2px';
        this.pointer.style.height = this.CIRCLE_CENTER + 'px';
        this.pointer.style.backgroundColor = POINTER_COLOR;
        this.pointer.style.transformOrigin = 'top';
        this.pointer.style.transform = `rotate(${this.startDegree}deg)`;

        this.pointer.style.zIndex = 1;

        this.circle.appendChild(this.pointer);

        this.markings = [];
        this.nextDegree = this.startDegree;

        // creates the markings
        for (let i = 0; i < 28; i++) { //default 28
            const marking = document.createElement('div');
            marking.className = 'marking';
            marking.style.position = 'absolute';

            //marking.style.top = this.CIRCLE_CENTER + 'px';
            // marking.style.left = this.CIRCLE_CENTER + 'px';

            marking.style.left = '50%';
            marking.style.top = '50%';

            marking.style.width = '2px';
            marking.style.height = this.CIRCLE_CENTER + 5 + 'px';
            marking.style.backgroundColor = 'black';
            marking.style.transformOrigin = 'top';
            marking.style.transform = `rotate(${this.nextDegree}deg)`;


            this.nextDegree += 10;

            marking.style.zIndex = -1;
            //marking.id = this.circle.id + '-marking-' + + i;
            this.markings.push(marking);
            this.circle.appendChild(marking);

        }

        // circle click actions
        let isDragging = false;
        this.circle.addEventListener("mousedown", (e) => {
            isDragging = true;
        });

        this.circle.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            this.handlePotentiometerClick(e);
        });

        this.circle.addEventListener("mouseup", () => {
            isDragging = false;
        }
        );

        this.circle.addEventListener("click", (e) => {
            this.handlePotentiometerClick(e);
        });

        // input field action
        this.currentValueInput.addEventListener('input', (e) => {
            let newValue = e.target.value;
            if (newValue < this.minimumValue) {
                newValue = this.minimumValue;
            }
            if (newValue > this.maximumValue) {
                newValue = this.maximumValue;
            }

            this.currentValue = newValue;
            this.calculateCurrentAngle();
            this.refreshPotentiometer();
        });

    }
    handlePotentiometerClick(e) {
        const rect = this.circle.getBoundingClientRect();

        // gets the click position in the rectangle of the circle
        const clickX = e.clientX - rect.x;
        const clickY = e.clientY - rect.y;

        // gets the x,y distance from the center
        const distanceX = clickX - this.CIRCLE_CENTER;
        const distanceY = clickY - this.CIRCLE_CENTER;

        // calculates the angle in degrees
        this.angle = Math.atan2(distanceY, distanceX) * (180 / Math.PI);
        // * (180 / Math.PI) = rad to deg

        // gets the angle between 0° and 360°
        // 270 = aligns the starting point with the CSS way, so at 6 o'clock
        this.angle = (this.angle + 270 + 360) % 360;



        // out of working area
        if (this.angle < this.startDegree || this.angle > this.endDegree) {
            return;
        } else {
            //const value = Math.ceil(angle / 3.6) || 12;
            /*  this.value = ((this.angle - this.startDegree) / (this.endDegree - this.startDegree)) * 10;
             this.value = this.value.toFixed(2); */
            this.calculateCurrentValue();
            this.refreshPotentiometer();
            this.updateObject();
        }
    }

    calculateCurrentValue() {
        /*  this.currentValue = ((this.angle - this.startDegree) / (this.endDegree - this.startDegree)) * this.maximumValue;
        this.currentValue = Math.round(this.currentValue * 100) / 100; */

        // the relative position between the start and end degree - 0 to 1
        let angleRatio = (this.angle - this.startDegree) / (this.endDegree - this.startDegree);
       // console.log(this.minimumValue + "+" + angleRatio + "*" + (this.maximumValue + "-" + this.minimumValue));
        this.currentValue = this.minimumValue + angleRatio * (this.maximumValue - this.minimumValue);
        this.currentValue = Math.round(this.currentValue * 100) / 100;

    }
    calculateCurrentAngle() {
        this.angle = ((this.currentValue / this.maximumValue) * (this.endDegree - this.startDegree)) + this.startDegree;
    }
    refreshPotentiometer() {
        this.resetMarkColor();
        this.pointer.style.transform = `rotate(${this.angle}deg)`;
        this.currentValueInput.value = this.currentValue;
        this.colorActiveMark();
    }

    /**
     * colors the markings that are before the clicked one
     */
    colorActiveMark() {
        // compares all angles of the markings with the clicked one
        this.markings.forEach(element => {
            var transform = element.style.transform;
            var transformValue = transform.match(/rotate\((\d+\.?\d*)deg\)/);

            if (transformValue[1] <= (this.angle)) {
                element.style.backgroundColor = this.ACTIVE_MARK_COLOR;
            }
        });
    }
    /**
     * resets the color of all markings to the default color
     */
    resetMarkColor() {
        this.markings.forEach(element => {
            element.style.backgroundColor = this.DEFAULT_MARK_COLOR;
        });
    }
    setCurrentValue(newValue) {
        if (newValue < this.minimumValue) {
            newValue = this.minimumValue;
        }
        if (newValue > this.maximumValue) {
            newValue = this.maximumValue;
        }

        this.currentValue = newValue;
        this.calculateCurrentAngle();
        this.refreshPotentiometer();
    }
    /**
     * Returns the potentiometer box element and  thus all subsequent contents.
     * That's important for accessing setCurrentValue() and updating the UI.
     * 
     * @returns {HTMLDivElement} the potentiometer box element
     */
    getPotentiometer() {
        return this.potentiometerContainer;
        //return this.test;
    }
    /**
     *  Updates the actual object to which the potentiometer is applied.
     */
    updateObject() {
        this.objectToUpdate.update(this.currentValue);
    }
}

export default Potentiometer ; // todo warum default?