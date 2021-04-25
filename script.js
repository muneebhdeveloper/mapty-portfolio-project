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

let mapEvent, map;

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
