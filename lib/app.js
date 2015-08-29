var mongoose = require("mongoose");
var fs = require("fs");
var async = require("async");
var mongoose = require("mongoose");
var path = require("path"),
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;
var Stream = require("./stream.js");
var User = require("./user.js");
var mqtt = require("mqtt");



function App(db) {
	this._client = mqtt.connect('mqtt://localhost');
	this.streams = [];
	this._routes = [];
	var self = this;
	self.middlewares = [];
	self._client.on("message", function (topic, payload) {
		//console.log(">>", topic, payload.toString());
		async.waterfall([function (next) {
			next(null, self, topic, payload)
		}].concat(self.middlewares), function (err, app, topic, payload) {
			if (err) {
				//console.log(err, topic, payload);
			}
		});
	});

}
App.prototype.use = function (func) {
	this.middlewares.push(func);

}
App.prototype.route = function () {
	var self = this;
	var routes = self._routes;
	return function (app, topic, payload, next) {
		for (var i = 0; i < self._routes.length; i++) {
			var route = self._routes[i];
			if (self._matches_sub(route[0], topic)) {
				return route[1](self, topic, payload, next);
			}
		}
	}
}

App.prototype.add = function (sub, callback) {
		this._client.subscribe(sub);
		this._routes.push([sub, callback]);
	}
	//ripped from mosquitto source
App.prototype._matches_sub = function (sub, topic) {
	var slen, tlen;
	var spos, tpos;
	var multilevel_wildcard = false;


	slen = sub.length;
	tlen = topic.length;

	if (slen && tlen) {
		if ((sub[0] == '$' && topic[0] != '$') || (topic[0] == '$' && sub[0] != '$')) {
			return false;
		}
	}
	spos = 0;
	tpos = 0;

	while (spos < slen && tpos < tlen) {
		if (sub[spos] == topic[tpos]) {
			if (tpos == tlen - 1) {
				/* Check for e.g. foo matching foo/# */
				if (spos == slen - 3 && sub[spos + 1] == '/' && sub[spos + 2] == '#') {
					multilevel_wildcard = true;
					return true;
				}
			}
			spos++;
			tpos++;
			if (spos == slen && tpos == tlen) {
				return true;
			} else if (tpos == tlen && spos == slen - 1 && sub[spos] == '+') {
				spos++;
				return true;
			}
		} else {
			if (sub[spos] == '+') {
				spos++;
				while (tpos < tlen && topic[tpos] != '/') {
					tpos++;
				}
				if (tpos == tlen && spos == slen) {
					return true;
				}
			} else if (sub[spos] == '#') {
				multilevel_wildcard = true;
				if (spos + 1 != slen) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	}
	if (multilevel_wildcard == false && (tpos < tlen || spos < slen)) {
		return false;
	}
}

module.exports = {
	App: App,
	middlewares: {
		toJSON: function (app, topic, payload, next) {
			try {
				payload = JSON.parse(payload);
				next(null, app, topic, payload);
			} catch (err) {

				next(null, app, topic, payload);
			}
		},
		toString: function (app, topic, payload, next) {
			try {
				payload = payload.toString();
				next(null, app, topic, payload);
			} catch (err) {
				next(err);
			}
		}
	}
};