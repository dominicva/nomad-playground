// API credentials
// Geonames creds
const apiKeyGeonames = '&username=domvana';
const baseUrlGeonames = `http://api.geonames.org/findNearbyPostalCodesJSON?placename=`;

// Weatherbit creds
const apiKeyWeatherbit = '23bb1049d17843959a5b48f527a5e5a7';
const baseUrlWeatherbitForecast =
  'http://api.weatherbit.io/v2.0/forecast/daily';
const baseUrlWeatherbitPredicted = 'http://api.weatherbit.io/v2.0/normals';

// Pixabay api creds
const apiKeyPixabay = '18577030-c4b4775cd18f8de6fa0c1dd0a';
const baseUrlPixabay = 'https://pixabay.com/api/';

// Helper functions
const calcDaysBetweenDates = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const msBetweenDates = endDate.getTime() - startDate.getTime();

  const daysBetweenDates = parseInt(msBetweenDates / (1000 * 60 * 60 * 24));
  return daysBetweenDates;
};

const countdown = () => {
  const tripStartDateEl = document.getElementById('trip-start-date');
  const daysUntilTrip = calcDaysBetweenDates(Date.now(), tripStartDateEl.value);
  return daysUntilTrip;
};

const isTripWithin1Week = () => {
  if (countdown() <= 7) {
    return true;
  } else {
    return false;
  }
};

const calcTripLength = () => {
  const tripStartDateEl = document.getElementById('trip-start-date');
  const tripEndDateEl = document.getElementById('trip-end-date');

  const tripLength = calcDaysBetweenDates(
    tripStartDateEl.value,
    tripEndDateEl.value
  );
  return tripLength;
};

// Core app logic
// gets lat/lng coordinates from Geonames api
const getCoords = async (urlBase, placeName, key) => {
  const response = await fetch(`${urlBase}${placeName}${key}`);

  const data = await response.json();
  const formattedData = {
    countryCode: data.postalCodes[0].countryCode,
    lat: data.postalCodes[0].lat.toFixed(2),
    lng: data.postalCodes[0].lng.toFixed(2),
  };
  return formattedData;
};

const calcAvgTemp = (arr) => {
  let sum = 0;
  for (const item of arr) {
    sum += item.temp;
  }
  return (sum / arr.length).toFixed(1);
};

const getWeather = async (lat, lng, startDate, endDate, key) => {
  let response;
  if (isTripWithin1Week()) {
    response = await fetch(
      `${baseUrlWeatherbitForecast}?lat=${lat}&lon=${lng}&key=${key}`
    );

    const forecastWeather = await response.json();
    const forecastWeatherFormatted = {
      temp: calcAvgTemp(forecastWeather.data),
    };
    return forecastWeatherFormatted;
  } else {
    response = await fetch(
      `${baseUrlWeatherbitPredicted}?lat=${lat}&lon=${lng}&start_day=${startDate}&end_day=${endDate}&key=${key}`
    );

    const predictedWeather = await response.json();
    console.log(predictedWeather);
    const predictedWeatherFormatted = {
      temp: calcAvgTemp(forecastWeather.data),
    };
    return predictedWeatherFormatted;
  }
};

const getImage = async (urlBase, key, placeName) => {
  const urlToFetch = `${urlBase}?key=${key}&q=${encodeURIComponent(placeName)}`;
  const response = await fetch(urlToFetch);

  const data = await response.json();
  const imgUrl = data.hits[0].largeImageURL;
  return imgUrl;
};

const postData = async (url = '', data = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  try {
    const newData = await response.json();
    return newData;
  } catch (error) {
    console.log(error);
  }
};

const updateUI = async (data) => {
  const tripsContainer = document.getElementById('trips-container');

  // UI cleanup
  document.querySelector('.loader').style.display = 'none';
  document.getElementById('no-trips').style.display = 'none';
  document.getElementById('destination').value = '';
  document.getElementById('note-input').value = '';

  const lastEntry = data[data.length - 1];
  const newTripEl = document.createElement('section');
  const newTripHtml = `
      <div class="entry">
        <div class="image-holder"><img src="${lastEntry.imageUrl} alt="${lastEntry.placeName}"></div>
        <div class="title">${lastEntry.placeName}</div>
        <div class="trip-dates">${lastEntry.startDate} - ${lastEntry.endDate}</div>
        <div class="trip-length">Trip length: ${lastEntry.tripLength} days</div>
        <div class="temp">Avg temp forecast during trip: ${lastEntry.temp} degrees (C)</div>
        <div class="note">${lastEntry.placeNote}</div>
    </div>
    `;
  newTripEl.innerHTML = newTripHtml;
  tripsContainer.prepend(newTripEl);
};

const createTrip = async () => {
  const newDestination = document.getElementById('destination').value.trim();
  const tripStartDateEl = document.getElementById('trip-start-date');
  const tripEndDateEl = document.getElementById('trip-end-date');
  const note = document.getElementById('note-input').value;

  const loader = document.querySelector('.loader');
  loader.style.display = 'block';

  const tripData = {};

  try {
    const coordsData = await getCoords(
      baseUrlGeonames,
      newDestination,
      apiKeyGeonames
    );
    const weatherData = await getWeather(
      coordsData.lat,
      coordsData.lng,
      // slice ==>> Weatherbit api needs dates in MM-DD format
      tripStartDateEl.value.slice(5),
      tripEndDateEl.value.slice(5),
      apiKeyWeatherbit
    );
    tripData.weatherData = weatherData;

    const imageUrl = await getImage(
      baseUrlPixabay,
      apiKeyPixabay,
      newDestination
    );
    tripData.imageUrl = imageUrl;

    await postData('http://localhost:3000/create-trip', {
      imageUrl: tripData.imageUrl,
      placeName: newDestination,
      startDate: tripStartDateEl.value,
      endDate: tripEndDateEl.value,
      tripLength: calcTripLength(),
      temp: tripData.weatherData.temp,
      placeNote: note,
    }).then((data) => {
      updateUI(data);
    });
  } catch (error) {
    console.log(error);
    loader.style.display = 'none';
    alert(
      'Oh dear... something went wrong. Please check what you entered makes sense. If it does, I can only apologise :)'
    );
  }
};

export { calcDaysBetweenDates, createTrip };
