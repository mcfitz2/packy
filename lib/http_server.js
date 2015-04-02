var jsonParser = require('body-parser').json();
var express = require('express');
module.exports = function (options, callback) {
	var db = options.db;
	var streams = db.streams;
	var Stream = db.model("Stream");
	var mqtt = options.mqtt;

	function isValidDate(string) {
		try {
			var d = new Date(string);
			return Object.prototype.toString.call(d) === "[object Date]" && !isNaN(d.getTime())
		} catch (err) {
			console.log(err);
			return false;
		}
	}

	var app = express();

	app.use(jsonParser);
	app.get("/streams", function (req, res) {
		Stream.find({}, function (err, streams) {
			res.json(streams);
		})
	});
	app.get("/streams/:name", function (req, res) {
		Stream.findOne({
			name: req.params.name
		}, function (err, streams) {
			res.json(streams);
		})
	});
	app.post("/streams/:name", function (req, res) {
		var data = req.body;
		Stream.findOne({
			name: req.params.name
		}, function (err, stream) {
			if (!data.timestamp) {
				data.timestamp = new Date();
			}
			if (isValidDate(data.timestamp)) {
				var ts = new Date(data.timestamp);
				ts.setMilliseconds(0);
				data.timestamp = ts;
			} else {
				return res.send(400, "invalid timestamp");
			}
			var query = stream.keys.reduce(function (query, key) {
				query[key] = data[key];
				return query;
			}, {});
			if (Object.keys(query).length !== stream.keys.length) {
				return res.send(400, "you must provide values for all primary key fields")
			}
			streams[req.params.name].findOneAndUpdate(query, data, {
				upsert: true,
				new: true,
			}, function (err, newData) {
				if (err) {
					console.log(err);
					res.send(500);
				} else {

					mqtt.client.publish(req.params.name, JSON.stringify(newData));
					res.json(newData);
				}
			})
		});
	})
	callback(null, app);
};