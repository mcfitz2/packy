var mongoose = require("mongoose");
var schema = new mongoose.Schema({
	latitude: {
		type: Number,
	},
	longitude: {
		type: Number,
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User' //Edit: I'd put the schema. Silly me.
	}
});
module.exports = {
	name: "location",
	topic: "/location",
	schema: schema,
}