var mongoose = require("mongoose");

module.exports = {
	schema: {
		latitude: Number,
		longitude: Number,
		timezone: String,
		offset: Number,
		summary: String,
		icon: String,
		nearestStormDistance: Number,
		nearestStormBearing: Number,
		precipIntensity: Number,
		precipProbability: Number,
		temperature: Number,
		apparentTemperature: Number,
		dewPoint: Number,
		humidity: Number,
		windSpeed: Number,
		windBearing: Number,
		visibility: Number,
		cloudCover: Number,
		pressure: Number,
		ozone: Number
	},
	name: "WeatherMoment",
	topic: "/weather",
	transform: function (app, topic, payload, callback) {
		var WeatherMoment = mongoose.model("WeatherMoment");
		try {
			var model = new WeatherMoment({
				latitude: payload.latitude,
				longitude: payload.longitude,
				timezone: payload.timezone,
				offset: payload.offset,
				summary: payload.currently.summary,
				icon: payload.currently.icon,
				nearestStormDistance: payload.currently.nearestStormDistance,
				nearestStormBearing: payload.currently.nearestStormBearing,
				precipIntensity: payload.currently.precipIntensity,
				precipProbability: payload.currently.precipProbability,
				temperature: payload.currently.temperature,
				apparentTemperature: payload.currently.apparentTemperature,
				dewPoint: payload.currently.dewPoint,
				humidity: payload.currently.humidity,
				windSpeed: payload.currently.windSpeed,
				windBearing: payload.currently.windBearing,
				visibility: payload.currently.visibility,
				cloudCover: payload.currently.cloudCover,
				pressure: payload.currently.pressure,
				ozone: payload.currently.ozone
			});
			callback(null, app, topic, model);
		} catch (err) {
			callback(err);
		}
	}
}