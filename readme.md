## Welcome to my Front End Nanodegree capstone project :)

## Simple travel planning app

### What it does
* User enters destination, trip dates and a personal note
* App renders a new trip to UI, containing:
  * an image of the destination (Pixabay)
  * the length of the trip (in days)
  * if the trip is within 1 week – forecasted temperature on day of arrival (Weatherbit API)
  * if trip is further away than 1 week – predicted temperature based on climate averages (also Weatherbit)
  * the user-entered personal note


### Motivation 
* This is (at time of writing) the final project for Udacity's Front End Developer Nanodegree. The aim was to practice
  the core material covered in the course (see Tech/Frameworks section for more detail). 


### Code style
* Used the Prettier VS code extension for auto-formatting. 
* Single quotes for strings in JS
* 2-space indentation
* arrow functions, let/const, etc. used throughout
* async/await for async code


### Tech/frameworks used
**Built with:**
* JS, SASS, HTML for client side
* Node.js with Express.js for server side
* Webpack for builds
* Service workers for offline functionality
* Jest for testing


### API reference
* Geonames to convert destination name to lat/lng coordinates
  * https://www.geonames.org/
* Weatherbit for forecasted and predicted weather
  * https://www.weatherbit.io/
* Pixabay for images
  * https://pixabay.com/service/about/api/ 


### How to use
* Clone repo, run `<npm install>` to install necessary node_modules
* Production build script: `<npm run build-prod>`
* Development build: `<npm run build-dev>`
* Server kick-off: `<npm start>`


### Credits
* Huge debt of grattitude to Maximilian Schwarzmueller of https://www.academind.com for his truly awesome learning material. 


### License
You have my blessing. 
