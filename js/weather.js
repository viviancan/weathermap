$(document).ready(function () {
	"use strict";

	//On on initial load, use these starting coordinates
	var startingLat =  29.423017;
	var startingLng = -98.48527;

	//On initial load set city name
	getCityName(startingLat, startingLng);

	//On initial run the page
	runPage(startingLat, startingLng)

	// Creates map with mapOptions
	function createMap(latitude, longitude){
		mapboxgl.accessToken = MAPBOX_KEY;
		var mapOptions = {
			container: 'map', style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
			center: [longitude, latitude], // starting position [lng, lat]
			zoom: 7 // starting zoom
		}

		return new mapboxgl.Map(mapOptions);
	}

	//Creates marker
	function createMarker(latitude, longitude, map){
		var markerOptions = {
			draggable: true
		}
		return new mapboxgl.Marker(markerOptions)
			.setLngLat([longitude, latitude])
			.addTo(map);
	}

	//Creates geocoder
	function createGeocoder(){
		return new MapboxGeocoder({
			accessToken: MAPBOX_KEY,
			mapboxgl: mapboxgl,
			marker: false
		});

	}

	//https://github.com/mapbox/mapbox-gl-geocoder/blob/master/API.md#on
	function monitorGeocoder(geocoder, marker){
		geocoder.on('result', function(e) {
			var geoLat = e.result.geometry.coordinates[1];
			var geoLng =  e.result.geometry.coordinates[0];
			var city = e.result.place_name;

			updatePage(geoLat, geoLng, city , marker);
		});
	}


	//Updates the page dynamically with geocoder results
	function updatePage(latitude, longitude, city, marker){
		getWeather(latitude, longitude);
		$('#current-city').html(city);
		marker.setLngLat([longitude, latitude]);
	}

	function getCityName(lat,lng){
		// ** NOTE ** I updated the reverseGeocode method to update the city instead of street address. Checkout geocoder-utils **
		reverseGeocode({lat: lat, lng: lng}, MAPBOX_KEY).then(function (result) {
			$('#current-city').html(result);
		});
	}


	function loopThroughWeeklyForecast(data){
		var html = '';

		for(var i = 0; i < 5; i++){
			html += '<div class="col-12 col-lg-2" id="weather-card">';
			html += createWeatherCard(data[i])
			html += '</div>';
		}

		return html;
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
	// https://stackoverflow.com/questions/4822852/how-to-get-the-day-of-week-and-the-month-of-the-year
	// https://stackoverflow.com/questions/1056728/where-can-i-find-documentation-on-formatting-a-date-in-javascript
	function convertTimestampToDate(timestamp){
		var theDate = new Date(timestamp * 1000);
		var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return theDate.toLocaleDateString('en-us', options);
	}


	function extractWeatherData(data){
		return {
		 tempMin: data.temp.min,
		 tempMax: data.temp.max,
		 humidity: data.humidity,
		 pressure: data.pressure,
		 wind: data.wind_speed,
		 description: data.weather[0].description,
		 icon: data.weather[0].icon,
		 timestamp: data.dt
		}
	}

	function createWeatherCard(data){
		var weather = extractWeatherData(data);

		var html = '';
		html += '<div class="card h-100">';
		html += '<div class="card-header text-center">';
		html += '<p>' + convertTimestampToDate(weather.timestamp) + '</p>';
		html += '</div>';
		html += '<div class="card-block">';
		html += '<div class="card-body">';
		html += '<h5 class="card-title text-center">'+ weather.tempMin + '&#8457 / ' + weather.tempMax +'&#8457</h5>';
		html += '<img class="mx-auto d-block" src="http://openweathermap.org/img/w/' + weather.icon+ '.png" alt="">';
		html += '<p class="card-text"><span class="font-weight-bold">Description: </span>'+ weather.description +'</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Humidity: </span>' + weather.humidity + '</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Wind: </span>' + weather.wind + '</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Pressure: </span>' + weather.pressure + '</p>';
		html += '</div>';
		html += '</div>';
		html += '</div>';

		return html;
	}


	function getWeather(latitude, longitude){
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


	function runPage(latitude, longitude){
		getWeather(latitude, longitude);

		var map = createMap(latitude, longitude)

		var marker = createMarker(latitude, longitude, map);

		var geocoder = createGeocoder();
		map.addControl(geocoder);

		monitorGeocoder(geocoder, marker);

		//https://docs.mapbox.com/mapbox-gl-js/example/drag-a-marker/
		function onDragEnd(){
			var lngLat = marker.getLngLat();
			var newLng = lngLat.lng;
			var newLat = lngLat.lat;

			var city = getCityName(newLat, newLng)
			updatePage(newLat, newLng, city, marker);
			// getWeather(newLat, newLng);
		}

		marker.on('dragend', onDragEnd);

	}

});
