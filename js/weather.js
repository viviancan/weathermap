$(document).ready(function () {
	"use strict";

	$.get("http://api.openweathermap.org/data/2.5/weather", {
		APPID: OPEN_WEATHER_APPID,
		q:     "San Antonio, US",
		units: "imperial"
	}).done(function(data) {
		$('#current-city').html(getCurrentCity(data));
		$('#weather-card').html(createWeatherCard(data));
	});

	function getCurrentCity(data){
		return data.name;
	}

	function createWeatherCard(data){
		var tempMin = data.main.temp_min;
		var tempMax = data.main.temp_max;
		var humidity = data.main.humidity;
		var pressure = data.main.pressure;
		var wind = data.wind.speed;
		var description = data.weather[0].description;
		var icon = data.weather[0].icon;

		var html = '';
		html += '<div class="card">'
		html += '<div class="card-header text-center">'
		html += new Date().toLocaleDateString()
		html += '</div>'
		html += '<div class="card-body">'
		html += '<h5 class="card-title text-center">'+ tempMin + '&#8457 / ' + tempMax +'&#8457</h5>'
		html += '<img class="mx-auto d-block" src="http://openweathermap.org/img/w/' + icon+ '.png" alt="">'
		html += '<p class="card-text"><span class="font-weight-bold">Description: </span>'+ description +'</p>'
		html += '<p class="card-text"><span class="font-weight-bold">Humidity: </span>' + humidity + '</p>'
		html += '<p class="card-text"><span class="font-weight-bold">Wind: </span>' + wind + '</p>'
		html += '<p class="card-text"><span class="font-weight-bold">Pressure: </span>' + pressure + '</p>'
		html += '</div>'
		html += '</div>';

		return html;
	}

});
