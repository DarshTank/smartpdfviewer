const mongoose = require('mongoose');

const OutlineSchema = new mongoose.Schema({
  pdfId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  outline: [
    {
      level: { type: String, enum: ['H1', 'H2', 'H3'], required: true },
      text: { type: String, required: true },
      page: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model('Outline', OutlineSchema); 