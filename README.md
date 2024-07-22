Project Features
=

Frontend:
-
1. Search Bar Functionality: Users can input a city name to search for weather information.
2. 5 Day Weather Forecast: Display weather data for the next five days.
3. Weather at Different Times: Show weather updates with a 3-hour interval on the selected day.

Backend:
-
1. Handle Search Request: Accept city names and fetch weather data from the OpenWeatherMap API.
2. Return Weather Data: Serve formatted weather data to the frontend.

Project Structure
=

Frontend Structure:
-
* HTML File: HTML file for the main search interface where users input city names.
* EJS File: EJS template to display weather information retrieved from the backend.
* CSS Styling: CSS stylesheet for styling the web application.

Backend Structure:
-
* Server Setup: Node.js with Express.js for handling HTTP requests and responses.
* Middleware: Middleware for parsing input, handling errors, and sending appropriate responses.
* External API Integration: Utilize Axios for fetching weather data from the OpenWeatherMap API.
* Routes:
   * GET /: Route to render the home.html page for searching weather information.
   * POST /: Endpoint to receive city name input, fetch weather data, and render it using the.ejs template.

 
FINAL PROJECT
=

I am using the "https://dribbble.com/shots/15524720-Weather-web-app" template from Masood Ahmad as inspiration for the design of this project.
