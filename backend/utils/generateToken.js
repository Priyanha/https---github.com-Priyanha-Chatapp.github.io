const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const generateToken = (user) => {
  const payload = { id: user._id, email: user.email };
  return jwt.sign(payload, keys.secretOrKey, { expiresIn: '1h' });
};

module.exports = generateToken;
