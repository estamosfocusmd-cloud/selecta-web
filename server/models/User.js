const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username:                { type: String, unique: true, sparse: true, trim: true },
  email:                   { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  name:                    { type: String, required: true, trim: true },
  password:                { type: String, required: true },
  verified:                { type: Boolean, default: false },
  verificationToken:       { type: String, default: null },
  verificationTokenExpiry: { type: Date,   default: null },
  resetToken:              { type: String, default: null },
  resetTokenExpiry:        { type: Date,   default: null },
  brandName:               { type: String, default: '', trim: true },
  bio:                     { type: String, default: '', maxlength: 300 },
  profileImage:            { type: String, default: null },
  profilePublicId:         { type: String, default: null },
  location:                { type: String, default: '', trim: true },
  socialLink:              { type: String, default: '', trim: true },
  slug:                    { type: String, unique: true, sparse: true, trim: true, lowercase: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
