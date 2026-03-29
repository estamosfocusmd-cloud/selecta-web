const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  publicId:     { type: String, required: true },
  originalName: { type: String, required: true },
  url:          { type: String, required: true },
  order:        { type: Number, default: 0 }
});

const gallerySchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  clientName:    { type: String, default: '', trim: true },
  slug:          { type: String, required: true, unique: true },
  passwordHash:  { type: String, default: null },
  hasPassword:   { type: Boolean, default: false },
  maxSelections: { type: Number, default: 0 },
  status:        { type: String, enum: ['active', 'closed'], default: 'active' },
  photos:        [photoSchema]
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
