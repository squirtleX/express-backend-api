var express = require('express'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	expressValidator = require('express-validator'),
	morgan = require('morgan'),
	config = require('./config/config'),
	port = process.env.PORT || 3009;
mongoose.connect(config.database, {auth:{authdb:config.authDb}, poolSize: 10});

var app = express();

// Allow CORS
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// User Morgan
app.use(morgan('dev'));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Passport init
app.use(passport.initialize());

// Express Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

var users = require('./routes/users');
app.use('/users', users);

app.listen(port, () => console.log('Server started at http://127.0.0.1:' + port));
