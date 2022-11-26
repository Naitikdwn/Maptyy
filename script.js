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
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace();
  }
  pace() {
    this.pace = this.duration / this.distance;
  }
}
class cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.speed();
  }
  speed() {
    this.pace = this.distance / this.duration;
  }
}
const run1 = new Running([34, -5], 43, 69, 432);
console.log(run1);
// Project Architecture
class App {
  #map;
  #mapEvent;
  #workout = [];
  constructor() {
    this._getposition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleEventField.bind(this));
  }
  _getposition() {
    if (navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(
        this._loadmap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _toggleEventField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();
    const validInputs = (...Inputs) =>
      Inputs.every(inp => Number.isFinite(inp));
    const allpositive = (...inputs) => inputs.every(inp => inp > 0);
    //Get data from form

    const type = inputType.value;
    console.log(type);
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    // Check the data
    // if workout runnning create running object
    if (type == 'running') {
      const cadence = +inputCadence.value;
      if (
        !validInputs(distance, duration, cadence) ||
        !allpositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // if workout cycling create cycing object
    if (type == 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allpositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      workout = new cycling([lat, lng], distance, duration, elevation);
    }
    // add new object to workout array
    this.#workout.push(workout);
    console.log(workout);
    // render workout on map as a marker
    this.renderWorkoutMarker(workout);
    // clear input field and  hide form
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
  renderWorkoutMarker(workout) {
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
      .setPopupContent('Workout')
      .openPopup();
  }

  // display marker

  _loadmap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const cords = [latitude, longitude];
    this.#map = L.map('map').setView(cords, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
}
const app = new App();

// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(
//     function (position) {
//       console.log(position);
//       const { latitude } = position.coords;
//       const { longitude } = position.coords;
//       console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
//       const cords = [latitude, longitude];
//       map = L.map('map').setView(cords, 15);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       map.on('click', function (mapE) {
//         mapEvent = mapE;
//         form.classList.remove('hidden');
//         inputDistance.focus();

// console.log(mapEvent);
// const { lat, lng } = mapEvent.latlng;
// L.marker([lat, lng])
//   .addTo(map)
//   .bindPopup(
//     L.popup({
//       maxWidth: 250,
//       minWidth: 100,
//       autoClose: false,
//       closeOnClick: false,
//       className: 'running - popup',
//     })
//   )
//   .setPopupContent('Workout')
//   .openPopup();
//     });
//   },

//   function () {
//     alert('could not get your location ');
//   }
// );
