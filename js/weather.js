$(document).ready(function () {
	"use strict";

	$.get("https://api.openweathermap.org/data/2.5/onecall", {
		APPID: OPEN_WEATHER_APPID,
		lat:    29.423017,
		lon:   -98.48527,
		units: "imperial",
		exclude: "minutely,hourly,alerts"
	}).done(function(data) {
		getCityName(data);
		$('#weather-row').html(loopThroughWeeklyForecast(data.daily));
	});

	function getCityName(data){
		var lat = data.lat;
		var lng = data.lon;

		// ** NOTE ** I updated the reverseGeocode method to update the city instead of street address. Checkout geocoder-utils **
		reverseGeocode({lat: lat, lng: lng}, MAPBOX_KEY).then(function (result) {
			$('#current-city').html(result);
		});
	}

	/***
	 * loopThroughWeeklyForecast is a method that iterates through array of weekly forecast
	 * @param {data} array is the daily array that is returned as part of openweathermaps weather object
	 * @returns {html} string with cards for 5 days of weather
	 *
	 */
	function loopThroughWeeklyForecast(data){
		var html = '';

		for(var i = 0; i < 5; i++){
			html += '<div class="col-12 col-lg-2" id="weather-card">';
			html += createWeatherCard(data[i])
			html += '</div>';
		}

		return html;
	}

	// function oldConvertTimestamp(timestamp){
	// 	var theDate = new Date(timestamp * 1000);
	// 	console.log(theDate);
	// 	var currentDate = theDate.getDate();
	// 	var currentMonth = theDate.getMonth() + 1; //Months are zero based
	// 	var currentYear = theDate.getFullYear();
	//
	// 	return currentMonth + "/" + currentDate + "/" + currentYear
	//
	// }


	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
	// https://stackoverflow.com/questions/4822852/how-to-get-the-day-of-week-and-the-month-of-the-year
	// https://stackoverflow.com/questions/1056728/where-can-i-find-documentation-on-formatting-a-date-in-javascript
	function convertTimestampToDate(timestamp){
		var theDate = new Date(timestamp * 1000);
		var options = {  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		return theDate.toLocaleDateString('en-us', options);
	}

	function createWeatherCard(data){
		var tempMin = data.temp.min;
		var tempMax = data.temp.max;
		var humidity = data.humidity;
		var pressure = data.pressure;
		var wind = data.wind_speed;
		var description = data.weather[0].description;
		var icon = data.weather[0].icon;
		var timestamp = data.dt;

		var html = '';
		html += '<div class="card h-100">';
		html += '<div class="card-header text-center">';
		html += '<p>' + convertTimestampToDate(timestamp) + '</p>';
		html += '</div>';
		html += '<div class="card-block">';
		html += '<div class="card-body">';
		html += '<h5 class="card-title text-center">'+ tempMin + '&#8457 / ' + tempMax +'&#8457</h5>';
		html += '<img class="mx-auto d-block" src="http://openweathermap.org/img/w/' + icon+ '.png" alt="">';
		html += '<p class="card-text"><span class="font-weight-bold">Description: </span>'+ description +'</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Humidity: </span>' + humidity + '</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Wind: </span>' + wind + '</p>';
		html += '<p class="card-text"><span class="font-weight-bold">Pressure: </span>' + pressure + '</p>';
		html += '</div>';
		html += '</div>';
		html += '</div>';

		return html;
	}

});
