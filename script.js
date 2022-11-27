'use strict';

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
  _setdescription() {
    //prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    // console.log(this._setdescription);
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.pace();
    this._setdescription();
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
    this._setdescription();
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
    //get data from local storage
    this._getlocalstorage();
    //Attach user's handles
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleEventField.bind(this));
    containerWorkouts.addEventListener('click', this._movetopopup.bind(this));
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
    // console.log(type);
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
    this._renderWorkoutMarker(workout);
    // rendring workouts
    this._renderWorkout(workout);
    // clear input field and  hide form
    this._hideForm();
    // set local storage
    this._setlocalstorage();
  }
  _setlocalstorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workout));
  }
  _getlocalstorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workout = data;
    this.#workout.forEach(work => {
      this._renderWorkout(work);
    });
  }
  _renderWorkoutMarker(workout) {
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
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `<li class="workout workout--${workout.Running}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♂️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running')
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>`;

    if (workout.type === 'cycling')
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>`;
    // console.log(html);
    form.insertAdjacentHTML('afterend', html);
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
    this.#workout.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _movetopopup(e) {
    const workoutel = e.target.closest('.workout');
    console.log(workoutel);
    if (!workoutel) return;
    const workout1 = this.#workout.find(
      work => work.id === workoutel.dataset.id
    );
    console.log(workout1);
    this.#map.setView(workout1.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}
const app = new App();
