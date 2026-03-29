const mongoose = require('mongoose');

const selectionSchema = new mongoose.Schema({
  galleryId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Gallery', required: true },
  galleryName:          { type: String, default: '' },
  clientName:           { type: String, default: 'Cliente' },
  selectedPhotos:       [String],
  selectedPhotoDetails: [{
    id:           String,
    originalName: String,
    filename:     String
  }],
  note:         { type: String, default: '' },
  submittedAt:  { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Selection', selectionSchema);
