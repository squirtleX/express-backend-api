var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	jwt = require('jsonwebtoken'),
	config = require('../config/config'),
	utils = require('../helpers/utils'),
	User = require('../models/user');

// Sign Up
router.post('/signup/', (req, res) => {
	var reqBody = req.body,
		email = reqBody.email,
		firstName = reqBody.firstName,
		middleName = reqBody.middleName,
		lastName = reqBody.lastName,
		office = reqBody.office,
		username = reqBody.username,
		password = reqBody.password,
		cPassword = reqBody.cPassword;	

	// Validate
	req.checkBody('email', 'Email Address is required').notEmpty();
	req.checkBody('email', 'You must provide a valid Email Address').isEmail();
	req.checkBody('firstName', 'First Name is required').notEmpty();
	req.checkBody('middleName', 'Middle Name is required').notEmpty();
	req.checkBody('lastName', 'Last Name is required').notEmpty();
	req.checkBody('office', 'Please provide your office').notEmpty();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors(true);

	if (errors) {
		res.json({
			success: false,
			errorType: 'validation',
			errors: errors,
			values: reqBody
		});
	} else {
		var newUser = new User({
			username: utils.encrypt(username),
			email: utils.encrypt(email),
			password: password,
			personalInfo: {
				firstName: utils.encrypt(firstName),
				middleName: utils.encrypt(middleName),
				lastName: utils.encrypt(lastName),
				office: office
			}
		});

		User.findByQuery({$or:[ {'email': utils.encrypt(email)}, {'username': utils.encrypt(username)}]}, (err, resUser) => {
			if (err) {
				res.status(400).send({success: false, errorType: 'code', msg: err});
			} else {

				if (resUser.length > 0) {
					res.json({success: false, errorType: 'duplication', msg: 'This username or email is already taken. Please use another account.'});
				} else {
					User.createUser(newUser, (err, resUser) => {
						if (err) {
							res.status(401).send({success: false, errorType: 'code', msg: err});	
						} else {
							res.json({
								success: true,
								user: resUser
							});
						}
					});
				}
			}

		});
	}

});

// Sign In
router.post('/signin/', (req, res) => {
	var reqBody = req.body,
		email = reqBody.email,
		password = reqBody.password;

	// Validate
	req.checkBody('email', 'Email Address is required').notEmpty();
	req.checkBody('email', 'You must provide a valid Email Address').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	var errors = req.validationErrors(true);

	if (errors) {
		res.json({
			success: false,
			errorType: 'validation',
			errors: errors,
			values: reqBody
		});
	} else {
		console.log(utils.encrypt(email));
		User.getUserByEmail( utils.encrypt(email), (err, resUser) => {

			if (err) res.status(400).send({success: false, errorType: 'code', msg: err});
			
			if (!resUser) res.status(401).send({success: false, errorType: 'no-result', msg: 'Invalid email or password'});

			User.comparePassword(password, resUser.password, (err, isMatch)=> {
				if (err) res.status(400).send({success: false, errorType: 'code', msg: err});
				var signOpts = {
					userId: resUser._id,
					incId: resUser.incId,
					username: utils.decrypt(resUser.username),
					email: utils.decrypt(resUser.email)
				};
				jwt.sign(signOpts, config.secretKey, { expiresIn: 60 * 60 }, (err, token) => {
					if (err) res.status(400).send({success: false, errorType: 'code', msg: err});
					res.json({
						success: true,
						token: 'JWT ' + token,
						user: signOpts
					});
				});
			});
		});
	}
});

module.exports = router;