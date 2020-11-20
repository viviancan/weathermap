$(document).ready(function () {
	"use strict";

	// Creates map with mapOptions
	const createMap = (latitude, longitude) => {
		mapboxgl.accessToken = MAPBOX_KEY;
		let mapOptions = {
			container: 'map', style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
			center: [longitude, latitude], // starting position [lng, lat]
			zoom: 7 // starting zoom
		}

		return new mapboxgl.Map(mapOptions);
	}

	//Creates marker
	const createMarker = (latitude, longitude, map) => {
		return new mapboxgl.Marker({draggable: true})
			.setLngLat([longitude, latitude])
			.addTo(map);
	}

	//Creates geocoder
	const createGeocoder = () => new MapboxGeocoder({accessToken: MAPBOX_KEY, mapboxgl: mapboxgl, marker: false});

	//https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md#on
	const monitorGeocoder = (geocoder, marker) => {
		geocoder.on('result', (e) => {
			const geometry = e.result.geometry.coordinates;
			const [geoLng, geoLat] = geometry;
			const city = e.result.place_name;

			updatePage(geoLat, geoLng, city , marker);
		});
	}

	//Updates the page dynamically with geocoder results
	const updatePage = (latitude, longitude, city, marker) => {
		getWeather(latitude, longitude);
		$('#current-city').html(city);
		marker.setLngLat([longitude, latitude]);
	}

	// ** NOTE ** I updated the reverseGeocode method to update the city instead of street address. Checkout geocoder-utils **
	const getCityName = (lat,lng) => {
		reverseGeocode({lat: lat, lng: lng}, MAPBOX_KEY).then( (result) => $('#current-city').html(result));
	}


	const loopThroughWeeklyForecast = data => {
		let html = '';

		for(let i = 0; i < 5; i++){
			html += `<div class="col-12 col-lg-2" id="weather-card"> ${createWeatherCard(data[i])}</div>`
		}

		return html;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
	// https://stackoverflow.com/questions/4822852/how-to-get-the-day-of-week-and-the-month-of-the-year
	// https://stackoverflow.com/questions/1056728/where-can-i-find-documentation-on-formatting-a-date-in-javascript
	const convertTimestampToDate = timestamp => {
		const theDate = new Date(timestamp * 1000);
		const options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return theDate.toLocaleDateString('en-us', options);
	}


	const extractWeatherData = data => (
		{
		 tempMin: data.temp.min,
		 tempMax: data.temp.max,
		 humidity: data.humidity,
		 pressure: data.pressure,
		 wind: data.wind_speed,
		 description: data.weather[0].description,
		 icon: data.weather[0].icon,
		 timestamp: data.dt
		}
	)


	const createWeatherCard = data => {
		const weather = extractWeatherData(data);

		let html =` 
		<div class="card h-100">
		<div class="card-header text-center">
		<p> ${convertTimestampToDate(weather.timestamp)}</p>
		</div>
		<div class="card-block">
		<div class="card-body">
		<h5 class="card-title text-center"> ${weather.tempMin}&#8457 / ${weather.tempMax}&#8457</h5>
		<img class="mx-auto d-block" src="http://openweathermap.org/img/w/${weather.icon}.png" alt="">
		<p class="card-text"><span class="font-weight-bold">Description: </span>${weather.description}</p>
		<p class="card-text"><span class="font-weight-bold">Humidity: </span>${weather.humidity}</p>
		<p class="card-text"><span class="font-weight-bold">Wind: </span>${weather.wind}</p>
		<p class="card-text"><span class="font-weight-bold">Pressure: </span>${weather.pressure}</p>
		</div>
		</div>
		</div>`

		return html;
	}

	const getWeather = (latitude, longitude) =>{
		$.get("https://api.openweathermap.org/data/2.5/onecall", {
			APPID: OPEN_WEATHER_APPID,
			lat:    latitude,
			lon:   longitude,
			units: "imperial",
			exclude: "minutely,hourly,alerts"
		}).done(function(data) {
			$('#weather-row').html(loopThroughWeeklyForecast(data.daily));
		});
	}

	const runPage = (latitude, longitude) => {
		getWeather(latitude, longitude);

		const map = createMap(latitude, longitude)

		const marker = createMarker(latitude, longitude, map);

		const geocoder = createGeocoder();
		map.addControl(geocoder);

		monitorGeocoder(geocoder, marker);

		//https://docs.mapbox.com/mapbox-gl-js/example/drag-a-marker/
		function onDragEnd(){
			const lngLat = marker.getLngLat();
			const newLng = lngLat.lng;
			const newLat = lngLat.lat;

			const city = getCityName(newLat, newLng)
			updatePage(newLat, newLng, city, marker);
		}

		marker.on('dragend', onDragEnd);

	}

	//On on initial load, use these starting coordinates
	const startingLat =  29.423017;
	const startingLng = -98.48527;

	//On initial load set city name
	getCityName(startingLat, startingLng);

	//On initial run the page
	runPage(startingLat, startingLng)
});
