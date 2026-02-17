const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
   
  username: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return; // nothing to do
  this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
});


// Method to check password
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
