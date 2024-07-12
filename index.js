import express from "express";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
import env from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
env.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const WeatherAPIKey = process.env.API_KEY;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

app.post("/getInfo", async (req, res) => {
  const location = req.body.locationInput;
  let lat, lng;

  try {
  //fetching geo cordinates
  const geoResult = await axios.get("http://api.openweathermap.org/geo/1.0/direct", {
    params: {
      q: location,
      appid: WeatherAPIKey
    }
  }) 

  lat = geoResult.data[0].lat;
  lng = geoResult.data[0].lon;

  // Fetch weather data from OpenWeatherMap API
  const weatherResult = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
    params: {
      lat: lat,
      lon: lng,
      appid: WeatherAPIKey,
      units: "metric",
    },
  });

  // console.log(weatherResult.data.list);
  // console.log(weatherResult.data.list[0].weather);

  let actualDate =  weatherResult.data.list[0].dt_txt.split(' ')[0];
  const formattedDate = new Date(actualDate).toLocaleDateString();

  console.log(weatherResult.data);
  // console.log(weatherResult.data);

  res.render("weatherInfo.ejs", {data: weatherResult.data, location: location, date:formattedDate})

  } catch (error) {
    console.log(error);
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});