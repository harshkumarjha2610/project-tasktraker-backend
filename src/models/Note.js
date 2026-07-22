const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: '',
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
  },
  color: {
    type: String,
    default: 'default', // standard colors like red, blue, green, yellow, default
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
