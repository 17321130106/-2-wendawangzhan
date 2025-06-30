const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  answerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema); 