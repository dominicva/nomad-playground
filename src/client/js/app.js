// API credentials
// Geonames creds
const geonamesApi = {
  apiKey: '&username=domvana',
  baseUrl: `http://api.geonames.org/findNearbyPostalCodesJSON?placename=`,
};

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

const isTripWithinNDays = (startDate, nDays) => {
  return calcDaysBetweenDates(Date.now(), startDate) <= nDays;
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
const getCoords = async placeName => {
  const response = await fetch(
    `${geonamesApi.baseUrl}${placeName}${geonamesApi.apiKey}`
  );

  const data = await response.json();
  const formattedData = {
    countryCode: data.postalCodes[0].countryCode,
    lat: data.postalCodes[0].lat.toFixed(2),
    lng: data.postalCodes[0].lng.toFixed(2),
  };
  return formattedData;
};

const calcAvgTemp = arr => {
  let sum = 0;
  for (const item of arr) {
    sum += item.temp;
  }
  return (sum / arr.length).toFixed(1);
};

const formatWeatherData = weatherData => {
  const formattedWeatherData = {
    temp: calcAvgTemp(weatherData.data),
  };
  return formattedWeatherData;
};

const getForecastWeather = async coords => {
  const response = await fetch(
    `${baseUrlWeatherbitForecast}?lat=${coords.lat}&lon=${coords.lng}&key=${apiKeyWeatherbit}`
  );

  const parsedResponse = await response.json();
  return parsedResponse;
};

const getPredictedWeather = async (coords, startDate, endDate) => {
  const response = await fetch(
    `${baseUrlWeatherbitPredicted}?lat=${coords.lat}&lon=${coords.lng}&start_day=${startDate}&end_day=${endDate}&key=${apiKeyWeatherbit}`
  );

  const parsedResponse = await response.json();
  return parsedResponse;
};

const getWeatherData = async (
  locationName,
  startDate,
  endDate,
  isWithin1Week
) => {
  const coordsData = await getCoords(
    baseUrlGeonames,
    locationName,
    apiKeyGeonames
  );

  let response;
  if (isWithin1Week) {
    response = await fetch(
      `${baseUrlWeatherbitForecast}?lat=${coordsData.lat}&lon=${coordsData.lng}&key=${apiKeyWeatherbit}`
    );
  } else {
    response = await fetch(
      `${baseUrlWeatherbitPredicted}?lat=${coordsData.lat}&lon=${coordsData.lng}&start_day=${startDate}&end_day=${endDate}&key=${apiKeyWeatherbit}`
    );
  }
  const parsedWeatherRespone = await response.json();
  return parsedWeatherRespone;
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

const loaderDisplay = show => {
  const loader = document.querySelector('.loader');

  if (show === 'show') {
    loader.style.display = 'block';
  } else if (show === 'hide') {
    loader.style.display = 'none';
  } else {
    throw new Error('check input to loaderDisplay helper function');
  }
};

const updateUI = async data => {
  const tripsContainer = document.getElementById('trips-container');

  // UI cleanup
  loaderDisplay('hide');
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
  const tripStartDate = document.getElementById('trip-start-date').value;
  const tripEndDate = document.getElementById('trip-end-date').value;
  const note = document.getElementById('note-input').value;

  loaderDisplay('show');

  try {
    const coords = await getCoords(newDestination);

    const weatherData = isTripWithinNDays(tripStartDate, 7)
      ? await getForecastWeather(coords)
      : await getPredictedWeather(
          coords,
          tripStartDate.slice(5),
          tripEndDate.slice(5)
        );

    const imageUrl = await getImage(
      baseUrlPixabay,
      apiKeyPixabay,
      newDestination
    );

    const formattedWeather = formatWeatherData(weatherData);

    await postData('http://localhost:3000/create-trip', {
      imageUrl: imageUrl,
      placeName: newDestination,
      startDate: tripStartDate,
      endDate: tripEndDate,
      tripLength: calcTripLength(),
      temp: formattedWeather.temp,
      placeNote: note,
    }).then(data => {
      updateUI(data);
    });
  } catch (error) {
    console.log(error);
    loaderDisplay('hide');
    alert(
      'Oh dear... something went wrong. Please check what you entered makes sense. If it does, I can only apologise :)'
    );
  }
};

export { calcDaysBetweenDates, createTrip };
