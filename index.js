module.exports = function (options) {
	require("./lib/mqtt_server.js")({
		port: options.mqtt.port,
		db_url: options.mqtt.db_url
	}, function (err, mqtt_server) {

		require("./lib/database.js")({
			db_url: options.database.db_url,
			streams_dir: options.database.streams_dir,
		}, function (err, db) {
			require("./lib/http_server.js")({
				db: db,
				mqtt: mqtt_server,
			}, function (err, http_server) {
				http_server.listen(options.http.port);
			});
		});
	});
}

var options = {
	mqtt: {
		db_url: "mongodb://localhost:27017/mqtt",
	},
	database: {
		db_url: "mongodb://localhost:27017/packy",
		streams_dir: "/Users/micahfitzgerald/Dropbox/Code/packy/streams/",
	},
	http: {
		port: 8080,
	}
}