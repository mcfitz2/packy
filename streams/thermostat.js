var mongoose = require("mongoose");

module.exports = {
	schema: {
		setTemp: {
			type: Number,
			required: true
		},
		currentTemp: {
			type: Number,
			required: true
		},
		mode: {
			type: String,
			required: true,
			enum: ["COOLING", "OFF", "HEATING"]
		}
	},
	name: "ThermostatStatus",
	topic: "/thermostat/status",
	transform: function (app, topic, payload, callback) {
		if (!app.vars) {
			app.vars = {}
		}
		if (!app.vars.thermo_last_run || (app.vars.thermo_last_run && (new Date() - app.vars.thermo_last_run) > 10000)) {
			var Status = mongoose.model("ThermostatStatus");

			try {
				var arr = payload.split(":::");

				var model = new Status({
					currentTemp: arr[0],
					setTemp: arr[1],
					mode: arr[2],
				});
				app.vars.thermo_last_run = new Date();

				callback(null, app, topic, model);
			} catch (err) {
				callback(null);
			}
		} else {
			callback(true);
		}
	}
}