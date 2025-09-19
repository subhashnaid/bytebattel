const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium, or hard'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  statement: {
    type: String,
    required: [true, 'Problem statement is required'],
    minlength: [50, 'Problem statement must be at least 50 characters']
  },
  sampleInput: {
    type: String,
    required: [true, 'Sample input is required']
  },
  sampleOutput: {
    type: String,
    required: [true, 'Sample output is required']
  },
  testCases: [{
    input: {
      type: String,
      required: true
    },
    expectedOutput: {
      type: String,
      required: true
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  dislikes: {
    type: Number,
    default: 0,
    min: [0, 'Dislikes cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  submissions: {
    type: Number,
    default: 0,
    min: [0, 'Submissions cannot be negative']
  },
  acceptedSubmissions: {
    type: Number,
    default: 0,
    min: [0, 'Accepted submissions cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    default: 1000, // milliseconds
    min: [100, 'Time limit must be at least 100ms']
  },
  memoryLimit: {
    type: Number,
    default: 256, // MB
    min: [1, 'Memory limit must be at least 1MB']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
problemSchema.index({ title: 'text', statement: 'text', tags: 'text' });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ author: 1 });
problemSchema.index({ createdAt: -1 });
problemSchema.index({ likes: -1 });
problemSchema.index({ isActive: 1 });

// Virtual for acceptance rate
problemSchema.virtual('acceptanceRate').get(function() {
  if (this.submissions === 0) return 0;
  return ((this.acceptedSubmissions / this.submissions) * 100).toFixed(2);
});

// Virtual for problem stats
problemSchema.virtual('stats').get(function() {
  return {
    views: this.views,
    submissions: this.submissions,
    acceptedSubmissions: this.acceptedSubmissions,
    acceptanceRate: this.acceptanceRate,
    likes: this.likes,
    dislikes: this.dislikes
  };
});

// Method to increment views
problemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment submissions
problemSchema.methods.incrementSubmissions = function() {
  this.submissions += 1;
  return this.save();
};

// Method to increment accepted submissions
problemSchema.methods.incrementAcceptedSubmissions = function() {
  this.acceptedSubmissions += 1;
  return this.save();
};

// Method to toggle like
problemSchema.methods.toggleLike = function(userId) {
  const userLiked = this.likedBy.includes(userId);
  
  if (userLiked) {
    this.likedBy.pull(userId);
    this.likes = Math.max(0, this.likes - 1);
  } else {
    this.likedBy.addToSet(userId);
    this.likes += 1;
  }
  
  return this.save();
};

module.exports = mongoose.model('Problem', problemSchema);
