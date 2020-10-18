import { calcDaysBetweenDates, createTrip } from './js/app.js';

import './styles/styles.scss';

// button to create new trip
const createTripBtn = document.getElementById('create-trip');
createTripBtn.addEventListener('click', createTrip);

export { calcDaysBetweenDates, createTrip };
