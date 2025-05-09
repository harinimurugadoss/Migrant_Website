const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      match: [/^[6-9]\d{9}$/, 'Please add a valid Indian phone number']
    },
    aadhar: {
      type: String,
      required: [true, 'Please add an Aadhar number'],
      match: [/^\d{12}$/, 'Aadhar number must be 12 digits'],
      unique: true
    },
    workerId: {
      type: String,
      unique: true
    },
    homeState: {
      type: String,
      required: [true, 'Please specify your home state']
    },
    district: {
      type: String,
      required: [true, 'Please specify your district']
    },
    address: {
      type: String
    },
    skills: {
      type: [String]
    },
    education: {
      type: String
    },
    experience: {
      type: String
    },
    role: {
      type: String,
      enum: ['worker', 'admin'],
      default: 'worker'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true 
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'migrantportal_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
