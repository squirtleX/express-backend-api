var mongoose = require('mongoose'),
	ObjectId = mongoose.Schema.ObjectId,
	autoIncrement = require('mongoose-auto-increment'),
	bcrypt = require('bcryptjs'),
	UserSchema = mongoose.Schema({
		username: {
			type: String,
			required: true,
			index: true
		}, // encrypted
		email: {
			type: String,
			required: true
		}, // encrypted
		password: {
			type: String,
			required: true
		}, // encrypted
		userType: {
			type: Number,
			default: 2 // 2 = User
		},
		dateRegistered: {
			type: Date,
			default: Date.now
		},
		isActive: {
			type: Boolean,
			default: true
		},
		personalInfo: {
			firstName: String,
			middleName: String,
			lastName: String,
			office: Number
		},
		refs: {},
	});

autoIncrement.initialize(mongoose.connection);
UserSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'incId', startAt: 1 });
var User = module.exports = mongoose.model('User', UserSchema, 'Users');
var modExprt = module.exports;
modExprt.getUserById = (id, callback) => {
	User.findById(id, callback);
}
modExprt.getUserByUsername = (username, callback) => {
	User.findOne({username: username}, callback);
}
modExprt.getUserByEmail = (email, callback) => {
	User.findOne({email: email}, callback);
}
modExprt.findByQuery = (query, callback) => {
	User.find(query, callback);
}
modExprt.createUser = (newUser, callback) => {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			if (err) throw err;
			newUser.password = hash;
			newUser.save(callback);
		});
	});
};
modExprt.comparePassword = (password, hash, callback) => {
	bcrypt.compare(password, hash, (err, isMatch) => {
		if (err) throw err;
		callback(null, isMatch);
	});
}
// Push data to reference
modExprt.pushDataToRef = (id, pushQuery, multi, callback) => {
	User.update({ _id: id }, { $set: { $push: pushQuery } }, { multi: multi }, callback);
}
// Pull reference datas
modExprt.pullRefData = (id, pullQuery, multi, callback) => {
	User.update({ _id: id }, { $set: { $pull: pullQuery } }, { multi: multi }, callback);
}