const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const speakeasy = require('speakeasy'); // Add this for MFA
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const keys = require('../config/keys');
const zxcvbn = require('zxcvbn');
const qrcode = require('qrcode');
const generateToken = require('../utils/generateToken');


// // Configure Nodemailer
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: "mynewsocial12345@gmail.com",
//     pass: "vkqo qafe aoqu jrfa",
//   },
// });


// // Simulating OTP storage for simplicity
// const otpStore = {};

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log('Missing fields');
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check password strength
  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    return res.status(400).json({ message: 'Password is too weak. Please choose a stronger password.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: keys.emailUser,
    pass: keys.emailPassword,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Simulating OTP storage for simplicity
const otpStore = {};

// Rate limiter for login route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many login attempts from this IP, please try again after 15 minutes",
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;

    const mailOptions = {
      from: keys.emailUser,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending OTP' });
      }
      res.json({ otpRequired: true, message: 'OTP sent to your email' });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// OTP verification route
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (otpStore[email] !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete otpStore[email];

    const user = await User.findOne({ email });
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('OTP verification error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate limiter for password reset request route
const passwordResetRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many password reset requests from this IP, please try again after 15 minutes",
});



// Password Reset Request Route
router.post('/password-reset-request', passwordResetRequestLimiter, async (req, res) => {
  const { email } = req.body;
  try {
    console.log('Finding user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Email not found' });
    }

    console.log('Generating token');
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const mailOptions = {
      to: user.email,
      from: 'mynewsocial12345@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    console.log('Sending email to:', user.email);
    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email', success: false });
      }
      res.status(200).json({ message: 'Password reset email sent', success: true });
    });
  } catch (error) {
    console.error('Error processing password reset request:', error);
    res.status(500).json({ message: 'Error processing password reset request', success: false });
  }
});


// Password Reset Route
router.post('/reset/:token', async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).json({ message: 'Password has been reset', success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password', success: false });
  }
});


router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

router.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});



router.post('/enable-mfa', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    req.user.mfaSecret = secret.base32;

    // Save the user with the new secret
    await req.user.save();

    // Generate a QR code
    const otpauthUrl = secret.otpauth_url;
    qrcode.toDataURL(otpauthUrl, (err, data_url) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to generate QR code' });
      }

      res.json({ message: 'MFA enabled', qrCode: data_url, secret: secret.base32 });
    });
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Server error');
  }
});

router.post('/verify-mfa', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { token } = req.body;

  try {
    const verified = speakeasy.totp.verify({
      secret: req.user.mfaSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid MFA token' });
    }

    req.user.mfaEnabled = true;
    await req.user.save();

    res.json({ message: 'MFA verified and enabled' });
  } catch (err) {
    console.error(err.stack);
    res.status(500).send('Server error');
  }
});

module.exports = router;
