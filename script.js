'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  id = String(Math.floor(Math.random() * Date.now())).slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

let newCycling = new Cycling([29, -12], 24, 98, 523);
let newRunning = new Running([29, -12], 9, 30, 178);

console.log(newCycling, newRunning);

class App {
  #map;
  #mapEvent;
  #workout = [];

  constructor() {
    // Gets current location and load the map to the DOM
    this._getPosition();

    // Listening & Handling submit event on the form
    form.addEventListener('submit', this._addNewWorkout.bind(this));

    // Listening & Handling change event on type input
    inputType.addEventListener('change', this._toggleTypeField);
  }

  _getPosition() {
    // Check if the navigation API is available
    if (navigator.geolocation) {
      // Gets the current location
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your Location');
        }
      );
    }
  }

  _loadMap(position) {
    // Assigning coordinates to the variables
    const { latitude, longitude } = position.coords;

    // Renders map to the DOM
    this.#map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;

    // Removes 'hidden' class from the form element
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value =
      '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleTypeField() {
    // Handling change event on the type field
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _addNewWorkout(event) {
    // Prevents default behavior of the form
    event.preventDefault();

    // Function for verifying Inputs (Must be Number and Positive)
    const verifyInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp) && inp > 0);

    // Get the data from Input fields
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    // Getting and assigning coordinates
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // Checks the type and store the value to the 'cadenceOrElevationGain' variable
    const cadenceOrElevationGain =
      type === 'running' ? +inputCadence.value : +inputElevation.value;

    // Validates the input
    if (!verifyInputs(cadenceOrElevationGain, distance, duration)) {
      alert('Input must be valid and positive Number');
    }

    // Add new workout
    if (type === 'running') {
      workout = new Running(
        [lat, lng],
        distance,
        duration,
        cadenceOrElevationGain
      );
    }

    if (type === 'cycling') {
      workout = new Cycling(
        [lat, lng],
        distance,
        duration,
        cadenceOrElevationGain
      );
    }

    this.#workout.push(workout);

    console.log(this.#workout);

    // Adds popup to the map
    this._renderWorkoutPopup(workout);

    // Render workout to the UI
    this._renderWorkoutToUI(workout);

    // Clearing the input fields
    this._hideForm();
  }

  _renderWorkoutPopup(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkoutToUI(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += ` 
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(2)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }

    if (workout.type === 'cycling') {
      html += ` 
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(2)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }
}

let app = new App();
