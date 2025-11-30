// server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Note the 'js' for the installed package

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures no two users have the same username
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures no two users have the same email
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// --- Mongoose Pre-Save Hook for Hashing ---
// This function runs BEFORE the user document is saved to MongoDB.
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt (a random value)
    const salt = await bcrypt.genSalt(10); // 10 is the cost factor

    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- Method to Compare Passwords for Login ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;