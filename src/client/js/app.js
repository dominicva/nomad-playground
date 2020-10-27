// API credentials
const apis = {
  geonames: {
    key: '&username=domvana',
    baseUrl: 'http://api.geonames.org/findNearbyPostalCodesJSON?placename=',
  },
  weatherbit: {
    key: '23bb1049d17843959a5b48f527a5e5a7',
    baseUrl: {
      forecast: 'http://api.weatherbit.io/v2.0/forecast/daily',
      predicted: 'http://api.weatherbit.io/v2.0/normals',
    },
  },
  pixabay: {
    key: '18577030-c4b4775cd18f8de6fa0c1dd0a',
    baseUrl: 'https://pixabay.com/api/',
  },
};

// ==>> Helper functions
const fetchUserInput = () => ({
  destination: document.getElementById('destination').value,
  tripStartDate: document.getElementById('trip-start-date').value,
  tripEndDate: document.getElementById('trip-end-date').value,
  note: document.getElementById('note-input').value,
});

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

const calcAvgTemp = arr => {
  let sum = 0;
  for (const item of arr) {
    sum += item.temp;
  }
  return (sum / arr.length).toFixed(1);
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

// ==>> Core app logic

// gets lat/lng coordinates from Geonames api
const getCoords = async placeName => {
  const response = await fetch(
    `${apis.geonames.baseUrl}${placeName}${apis.geonames.key}`
  );

  const data = await response.json();
  const formattedData = {
    countryCode: data.postalCodes[0].countryCode,
    lat: data.postalCodes[0].lat.toFixed(2),
    lng: data.postalCodes[0].lng.toFixed(2),
  };
  return formattedData;
};

const formatWeatherData = weatherData => {
  const formattedWeatherData = {
    temp: calcAvgTemp(weatherData.data),
  };
  return formattedWeatherData;
};

const getForecastWeather = async coords => {
  const response = await fetch(
    `${apis.weatherbit.baseUrl.forecast}?lat=${coords.lat}&lon=${coords.lng}&key=${apis.weatherbit.key}`
  );

  const parsedResponse = await response.json();
  return parsedResponse;
};

const getPredictedWeather = async (coords, startDate, endDate) => {
  const response = await fetch(
    `${apis.weatherbit.baseUrl.predicted}?lat=${coords.lat}&lon=${coords.lng}&start_day=${startDate}&end_day=${endDate}&key=${apis.weatherbit.key}`
  );

  const parsedResponse = await response.json();
  return parsedResponse;
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
  loaderDisplay('show');

  try {
    const {
      destination,
      tripStartDate: startDate,
      tripEndDate: endDate,
      note,
    } = fetchUserInput();

    const coords = await getCoords(destination.trim());

    const weatherData = isTripWithinNDays(startDate, 7)
      ? await getForecastWeather(coords)
      : await getPredictedWeather(coords, startDate.slice(5), endDate.slice(5));

    const imageUrl = await getImage(
      apis.pixabay.baseUrl,
      apis.pixabay.key,
      destination
    );

    const formattedWeather = formatWeatherData(weatherData);

    await postData('http://localhost:3000/create-trip', {
      imageUrl: imageUrl,
      placeName: destination,
      startDate: startDate,
      endDate: endDate,
      tripLength: calcDaysBetweenDates(startDate, endDate),
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
