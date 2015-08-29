var mongoose = require("mongoose");
var fs = require("fs");
var async = require("async");
var path = require("path");

function transformSchema(schema) {
	var has_key = false;
	var keys = ["timestamp"];
	if (schema instanceof mongoose.Schema) {
		schema.eachPath(function (field) {
			if (field == "_id") {
				return;
			}
			if (schema.path(field).options.unique) {
				has_key = true;
				keys.push(field);
			}
		});
		schema.path("timestamp", {
			type: Date,
			required: true,
			unique: true,
			default: Date.now
		});
		return {
			schema: schema,
			keys: keys
		};
	} else {
		for (var field in schema) {
			if (schema[field].unique) {
				has_key = true;
				keys.push(field);
			}
		}
		schema.timestamp = {
			type: Date,
			required: true,
			unique: true,
			default: Date.now
		};
		return {
			schema: new mongoose.Schema(schema),
			keys: keys
		};
	}
}

function loadStreams(app, streams_dir, callback) {
	console.log("Loading from", streams_dir)
	fs.readdir(streams_dir, function (err, files) {
		async.each(files, function (file, callback) {
				fs.stat(path.join(streams_dir, file), function (err, stat) {
					if (err) {
						return callback(err);
					}
					if (stat.isFile() && file.indexOf(".js") == file.length - 3 && file != "index.js") {
						console.log(">>", file);
						var stream = require(path.join(streams_dir, file));
						mongoose.model(stream.name, transformSchema(stream.schema).schema);
						app.add(stream.topic, function (app, topic, payload, next) {
							stream.transform(app, topic, payload, next);
						});
						callback();
					} else {
						callback();
					}
				});
			},
			function (err) {
				if (err) {
					console.log("loading streams failed", err);
					process.exit(1);
				} else {
					console.log("streams loaded");
					return callback(null);
				}
			});
	});
}


module.exports = function (app, callback) {
	loadStreams(app, __dirname, callback);
}