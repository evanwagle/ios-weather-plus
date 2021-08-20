let lat = 0;
let lon = 0;

const weather = {
  // REMOVE BEFORE PUSHING TO GITHUB
  apiKey: "",
  // https://api.openweathermap.org/data/2.5/weather?q={city%20name}&appid={API%20key}
  // https://openweathermap.org/current
  // added '&units=imperial
  fetchCurrent: function (city) {
    // Error handling function if city cannot be found
    function handleErrors(response) {
      if (!response.ok) {
        throw new Error(response.statusText);
      } else {
        return response;
      }
    };

    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=" + this.apiKey
    ).then(handleErrors)
      .then(response => response.json())
      .then(data => this.displayCurrent(data))
      .catch(error => console.log("failed " + error));
  },

  displayCurrent: function (data) {
    // Destructuring assignment shorthand with fetchWeather object
    lat = data.coord.lat;
    lon = data.coord.lon;
    const { name } = data;
    const { description } = data.weather[0];
    const { temp, temp_min, temp_max, } = data.main;

    // Sets title of window
    document.getElementById("title").innerText = "Weather | " + name;

    // console.log(lat, lon, name, icon, description, temp, temp_max, temp_min);
    // Sets URL
    // window.history.pushState(null, name, "/" + name);

    document.querySelector(".city").innerText = name;
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = ' ' + Math.round(temp) + '°';
    document.querySelector(".max-min-temp").innerText = "H:" + Math.round(temp_max) + "°  L:" + Math.round(temp_min) + "°";
    // Removing CSS class after data is loaded
    // document.querySelector(".weather").classList.remove("blank-search")
    // Background from unsplash
    // document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + description + "')";
    // Fetches the hourly weather
    this.fetchHourly(lat, lon);

    function capitalizeFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    // Extended description
    document.querySelector(".extended-description").innerHTML = '<p>Today: ' + capitalizeFirst(description) + ' currently. The high will be ' +
      Math.round(temp_max) + '° and the low will be ' + Math.round(temp_min) + '°.</p>';

    // Fetches Air Quality
    this.fetchAirQuality(lat, lon);

    // Open in Maps text
    document.querySelector(".open-maps").innerHTML = '<p>Weather for ' +
      name + '. <a href="https://www.google.com/maps/place/' + name +
      '" target="_blank">Open in Maps</a></p>';

    // Changing URL query
    const url = new URL(window.location);
    url.searchParams.set('search', name);
    window.history.pushState({}, '', url);
  },

  fetchHourly: function (lat, lon) {
    // Uses lat and lon found from the city current weather call
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely&units=imperial&appid=" + this.apiKey)
      .then(response => response.json())
      .then(data => this.displayHourly(data));
  },

  displayHourly: function (data) {
    // Gets the current time
    let d = new Date();
    let currentHour = d.getHours();
    // Getting the next hourly weather forecast
    let hourData = "";
    const { hourly } = data;
    for (let i = 0; i <= 8; i++) {
      let hour = (i == 0) ? "Now" : currentHour + i;
      let icon = hourly[i].weather[0].icon;
      let temp = Math.round(hourly[i].temp);
      hourData +=
        '<div class="hour">' +
        '<p>' + hour + '</p>' +
        '<img class="icon" src="http://openweathermap.org/img/wn/' + icon + '.png" alt="">' +
        '<p class="temp">' + temp + '°' + '</p>' +
        '</div>';
    }
    // Injects HTML for hourly data
    document.querySelector(".hourly-container").innerHTML = hourData;
    // document.querySelector(".icon").src = "http://openweathermap.org/img/wn/" + icon + ".png";

    // Getting the weather forecast for the next 9 days
    const { daily } = data;
    let daysInWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayData = "";
    for (let i = 0; i <= 7; i++) {
      let day = daysInWeek[(d.getDay() + i) % 7];
      let icon = daily[i].weather[0].icon;
      let maxTemp = Math.round(daily[i].temp.max);
      let minTemp = Math.round(daily[i].temp.min);

      dayData += '<div class="day"><p class="day-of-week">' +
        day + '</p><img class="icon" src="http://openweathermap.org/img/wn/' +
        icon + '.png" alt=""><p class="max-temp">' +
        maxTemp + '</p><p class="min-temp">' + minTemp + '</p></div>';
    }
    // Injects HTML for daily data
    document.querySelector(".daily-container").innerHTML = dayData;

    // Misc Info Text
    let { sunrise, sunset, humidity, wind_deg, wind_speed, feels_like, pressure, visibility, uvi } = data.current;
    let { pop } = data.hourly[0];

    // Sunrise Formatting
    let sunriseHour = new Date(sunrise * 1000).getHours();
    let sunriseMinute = new Date(sunrise * 1000).getMinutes();
    sunriseHour = sunriseHour < 10 ? "0" + sunriseHour : sunriseHour;
    sunriseMinute = sunriseMinute < 10 ? "0" + sunriseMinute : sunriseMinute;
    document.querySelector(".sunrise").innerText = sunriseHour + ":" + sunriseMinute;
    // Sunset Formatting
    let sunsetHour = new Date(sunset * 1000).getHours();
    let sunsetMinute = new Date(sunset * 1000).getMinutes();
    sunsetHour = sunsetHour < 10 ? "0" + sunsetHour : sunsetHour;
    sunsetMinute = sunsetMinute < 10 ? "0" + sunsetMinute : sunsetMinute;
    document.querySelector(".sunset").innerText = sunsetHour + ":" + sunsetMinute;

    // Chance of rain
    pop = Math.round(pop * 100);
    document.querySelector(".chance-of-rain").innerText = pop + "%";

    document.querySelector(".humidity").innerText = humidity + "%";

    // Wind Direction and Speed setup
    function degToCompass(wind_deg) {
      let degConverted = Math.floor((wind_deg / 22.5) + 0.5);
      let dirArr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
      return dirArr[(degConverted % 16)];
    };
    document.querySelector(".wind").innerHTML = '<font size="5px">' + degToCompass(wind_deg) + "</font> " + Math.round(wind_speed) + " mph";

    document.querySelector(".feels-like").innerText = Math.round(feels_like) + "°";

    // Precipitation amount, if rain property exists, gets rain, default is 0
    let precipitation = 0;
    if (data.hourly[0].hasOwnProperty('rain')) {
      precipitation = data.hourly[0].rain["1h"];
    }
    document.querySelector(".precipitation").innerText = precipitation + " in";

    // Converts pressure in hpa to inHg
    pressure = (pressure / 33.863886666667).toFixed(2);
    document.querySelector(".pressure").innerText = pressure + " inHg";

    // Converts meters visibility to miles
    visibility = Math.round(visibility * 0.000621371);
    document.querySelector(".visibility").innerText = visibility + " mi";

    document.querySelector(".uvi").innerText = Math.round(uvi);
  },

  fetchAirQuality: function (lat, lon) {
    fetch("http://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=" + this.apiKey)
      .then(response => response.json())
      .then(data => this.displayAirQuality(data));
  },

  displayAirQuality: function (data) {
    const { aqi } = data.list[0].main;
    let qualityRange = ["", "Good", "Fair", "Moderate", "Poor", "Very Poor"];
    const { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;

    // Disclaimer: aqiNum is a general rating to calculate aqiMargin. Does not actually calculate AQI
    let aqiNum = Math.round((((co + no + no2 + o3 + so2 + pm2_5 + pm10 + nh3) / 8) * aqi) % 560);

    document.querySelector(".aqi").innerText = aqiNum + " - " + qualityRange[aqi];
    // Calculates margin from left based on the AQI
    let markerMargin = 0;

    if (aqi === 1) {
      markerMargin = 26;
    } else if (aqi === 2) {
      markerMargin = 70;
    } else if (aqi === 3) {
      markerMargin = 140;
    } else if (aqi === 4) {
      markerMargin = 260;
    } else if (aqi === 5) {
      markerMargin = 360;
    }
    document.getElementById("aqi-marker").style.marginLeft = markerMargin + "px";
  },

  search: function () {
    this.fetchCurrent(document.querySelector(".search-bar").value);
  },
}
// Checks if there's query string parameters for search then
// loads page automatically with search query
const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.get('search');
if (searchParam) {
  document.getElementById("search-bar").value = searchParam;
  weather.search();
}

// Search bar working with search button
document.querySelector(".search button").addEventListener("click", () => {
  weather.search();
});

// Search bar working with enter key
document.querySelector(".search-bar").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    weather.search();
  }
});

// TODO: Store cookies to keep track of cities
// Keeping track of cities
let cities = ["", "New York", "Denver", "Los Angeles", "Miami"];
document.getElementById("add-btn").addEventListener("click", () => {
  cities.add(document.querySelector(".search-bar").value);
  weather.search();
});
// Displaying saved cities
let savedCitiesHTML = "";

for (let i = 0; i < cities.length; i++) {
  savedCitiesHTML += '<a href="file:///Users/evanw/Documents/GitHub/ios-weather-plus/index.html?search=' + cities[i] + '"title="' + cities[i] + '"><div class="location-dot"></div></a>'
}

document.querySelector(".dot-container").innerHTML = savedCitiesHTML;