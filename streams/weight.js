var mongoose = require("mongoose");

module.exports = {
	schema: {
		weight: Number,
		unit: {
			type: String,
			enum: ["lb", "kg"]
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User', //Edit: I'd put the schema. Silly me.
			required: true,
		}
	},
	name: "weight",
	topic: "/weight",
	transform: function (app, topic, payload, callback) {
		var Weight = mongoose.model("weight");
		try {
			var weightModel = new Weight({
				owner: payload.owner,
				unit: payload.unit,
				weight: payload.weight,
			});
			callback(null, app, topic, weightModel);
		} catch (err) {
			callback(err);
		}
	}
}