const express = require('express');
const router = express.Router();
const passport = require('passport');
const Chat = require('../models/Chat'); // Assuming you have a Chat model

// Fetch chat messages for a specific user
router.get('/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const messages = await Chat.find({ recipients: { $all: [req.user.id, req.params.userId] } });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Send a chat message
router.post('/:userId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const newMessage = new Chat({
      text: req.body.message,
      sender: req.user.id,
      recipients: [req.params.userId],
    });
    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
