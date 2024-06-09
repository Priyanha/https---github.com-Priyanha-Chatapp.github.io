// models/Chat.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
