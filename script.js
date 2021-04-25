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
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
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

  _toggleTypeField() {
    // Handling change event on the type field
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _addNewWorkout(event) {
    // Function for verifying Inputs (Must be Number and Positive)
    const verifyInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp) && inp > 0);

    // Get the data from Input fields
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // Checks the type and store the value to the 'paceOrSpeed' variable
    const paceOrSpeed =
      type === 'running' ? +inputCadence.value : +inputElevation.value;

    // Validates the input
    if (!verifyInputs(paceOrSpeed, distance, duration)) {
      alert('Input must be valid and positive Number');
    }

    // Clearing the input fields
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value =
      '';

    // Prevents default behavior of the form
    event.preventDefault();

    // Getting and assigning coordinates
    const { lat, lng } = this.#mapEvent.latlng;

    // Adds popup to the map
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 350,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Popup')
      .openPopup();
  }
}

let app = new App();
