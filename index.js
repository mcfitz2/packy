var mongoose = require("mongoose")
var App = require("./lib/app.js").App;
var middlewares = require("./lib/app.js").middlewares;
var app = new App({});

var db = mongoose.connection;
db.once("open", function () {
	require("./streams")(app, function (err) {
		app.use(middlewares.toString);
		app.use(middlewares.toJSON);
		//app.use(function (app, topic, payload, next) {
		//	console.log(topic, payload);
		//		next(null, app, topic, payload);
		//	});
		app.use(app.route());
		app.use(function (app, topic, model, next) {
			if (model) {
				model.save(function (err) {
					if (err) {
						console.log(err);
					}
					console.log(model, "saved");
					next(null, app, topic, model);
				});
			}
		});
	});
});
mongoose.connect('mongodb://localhost/packy');