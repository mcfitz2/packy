var fs = require("fs");
var async = require("async");
var mongoose = require("mongoose");
var path = require("path");
module.exports = function (options, callback) {
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

	function loadStreams(callback) {
		var streams = {};
		fs.readdir(options.streams_dir, function (err, files) {
			async.each(files, function (file, callback) {
					fs.stat(path.join(options.streams_dir, file), function (err, stat) {
						if (err) {
							return callback(err);
						}
						if (stat.isFile() && file.indexOf(".js") == file.length - 3) {
							var stream = require(path.join(options.streams_dir, file));
							var transformed = transformSchema(stream.schema);
							streams[stream.name] = mongoose.model(stream.name, transformed.schema, stream.name);
							Stream.findOneAndUpdate({
									name: stream.name
								}, {
									name: stream.name,
									keys: transformed.keys
								}, {
									upsert: true,
									new: true,
								},
								function (err, streamDoc) {
									callback(err);
								});
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
						return callback(null, streams);
					}
				});
		});
	}
	var streams = {}
	var db = mongoose.connection;
	var streamSchema = new mongoose.Schema({
		name: {
			type: String,
			required: true,
			unique: true
		},
		keys: [String]
	});
	var Stream = mongoose.model("Stream", streamSchema);

	db.on('error', console.error);
	db.once('open', function () {
		loadStreams(function (err, streams) {
			db.streams = streams;
			callback(null, db);
		});
	});
	mongoose.connect('mongodb://localhost/packy');
};