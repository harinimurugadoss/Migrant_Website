const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the document'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Please specify the document type'],
      enum: ['identity', 'address', 'education', 'employment', 'skill', 'other']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    filePath: {
      type: String,
      required: [true, 'File path is required']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } 
  }
);

// Add virtual field to populate user details when needed
DocumentSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Document', DocumentSchema);
