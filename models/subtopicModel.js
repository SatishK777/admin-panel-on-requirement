const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Subtopic = mongoose.model('Subtopic', subtopicSchema);
module.exports = Subtopic;
