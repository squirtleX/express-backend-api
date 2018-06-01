var modExprt = module.exports;
modExprt.getToken = (headers) => {
	if (headers && headers.authorization) {
		var parted = headers.authorization.split(' ');
		if (parted.length === 2) {
			return parted[1];
		} else {
			return null;
		}
	} else {
		return null;
	}
}

modExprt.verifyToken = (req, res, next) => {
	// Get auth header value
	const bearerHeader = req.headers['authorization'];
	// Check if bearer is undefined
	if(typeof bearerHeader !== 'undefined') {
		// Split at the space
		const bearer = bearerHeader.split(' ');
		// Get token from array
		const bearerToken = bearer[1];
		// Set the token
		req.token = bearerToken;
		// Next middleware
		next();
	} else {
		// Forbidden
		res.sendStatus(403);
	}
}

/**
 * -----------------------------------------------------------------------------------
 * Cryptography using crypto module
 * Nodejs encryption with CTR
 **/
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	secret = 'z`1rG=Pn{;p!$T1';

modExprt.encrypt = (str) => {
	var cipher = crypto.createCipher(algorithm,secret)
	var crypted = cipher.update(str,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
}

modExprt.decrypt = (str) => {
	var decipher = crypto.createDecipher(algorithm,secret)
	var dec = decipher.update(str,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
}