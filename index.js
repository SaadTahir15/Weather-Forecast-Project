import express from "express";
import axios from "axios";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import env from "dotenv";

// Setup
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
env.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database Client
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Error connecting to database", err));

const WeatherAPIKey = process.env.API_KEY;

// Home Route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

// Function to calculate time and conditions
const calculateTimeAndConditions = (weatherData) => {
  const timezoneOffset = weatherData.city.timezone;
  const currentTime = new Date(Date.now() + timezoneOffset * 1000);
  const hours = currentTime.getUTCHours();
  const minutes = currentTime.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = String(minutes).padStart(2, "0");

  let greeting;
  if (hours >= 6 && hours < 12) {
    greeting = "Good Morning";
  } else if (hours >= 12 && hours < 19) {
    greeting = "Good Afternoon";
  } else {
    greeting = "Good Night";
  }

  let actualDate = weatherData.list[0].dt_txt.split(" ")[0];
  const formattedDate = new Date(actualDate).toLocaleDateString();

  const dailyWeather = {};
  weatherData.list.forEach(entry => {
    const date = entry.dt_txt.split(" ")[0];
    if (!dailyWeather[date] || entry.main.temp_max > dailyWeather[date].main.temp_max) {
      dailyWeather[date] = entry;
    }
  });

  const dailyWeatherList = Object.keys(dailyWeather).map(date => {
    const entry = dailyWeather[date];
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      tempMax: Math.ceil(entry.main.temp_max),
      description: entry.weather[0].description,
    };
  });

  return {
    formattedDate,
    greeting,
    formattedHours,
    formattedMinutes,
    period,
    dailyWeatherList
  };
};

// Get Weather Information Route
app.post("/getInfo", async (req, res) => {
  const location = req.body.locationInput;

  try {
    // Check if weather data is already in the database and is valid
    const cachedDataQuery = await db.query(
      "SELECT * FROM weather WHERE location = $1 AND last_updated > NOW() - INTERVAL '1 hour'",
      [location]
    );
    const cachedData = cachedDataQuery.rows;

    let weatherData;

    if (cachedData.length > 0) {
      console.log("Fetching from Database");
      weatherData = cachedData[0].data;
    } else {
      console.log("Fetching from OpenWeatherMap API");
      // Fetch geo coordinates
      const geoResult = await axios.get("http://api.openweathermap.org/geo/1.0/direct", {
        params: {
          q: location,
          appid: WeatherAPIKey,
        },
      });

      const lat = geoResult.data[0].lat;
      const lng = geoResult.data[0].lon;

      // Fetch weather data from OpenWeatherMap API
      const weatherResult = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: {
          lat: lat,
          lon: lng,
          appid: WeatherAPIKey,
          units: "metric",
        },
      });

      weatherData = weatherResult.data;

      // Store the fetched data in the database
      await db.query(
        `INSERT INTO weather (location, data, last_updated) 
         VALUES ($1, $2, NOW())
         ON CONFLICT (location) DO UPDATE 
         SET data = EXCLUDED.data, last_updated = NOW()`,
        [location, weatherData]
      );
    }

    const {
      formattedDate,
      greeting,
      formattedHours,
      formattedMinutes,
      period,
      dailyWeatherList
    } = calculateTimeAndConditions(weatherData);

    res.render("weatherInfo.ejs", {
      data: weatherData,
      location: location,
      date: formattedDate,
      greeting: greeting,
      formattedHours: formattedHours,
      formattedMinutes: formattedMinutes,
      period: period,
      dailyWeatherList: dailyWeatherList,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred while fetching weather data.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
