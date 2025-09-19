const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    maxlength: [50000, 'Code cannot exceed 50,000 characters']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: {
      values: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'],
      message: 'Invalid programming language'
    }
  },
  result: {
    status: {
      type: String,
      enum: ['success', 'error', 'timeout', 'memory_limit_exceeded'],
      required: true
    },
    output: String,
    error: String,
    runtime: {
      type: Number,
      min: [0, 'Runtime cannot be negative']
    },
    memory: {
      type: Number,
      min: [0, 'Memory usage cannot be negative']
    },
    testCases: [{
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
      runtime: Number,
      memory: Number
    }]
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
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
  executionTime: {
    type: Number,
    min: [0, 'Execution time cannot be negative']
  },
  memoryUsed: {
    type: Number,
    min: [0, 'Memory used cannot be negative']
  },
  codeLength: {
    type: Number,
    min: [0, 'Code length cannot be negative']
  },
  isOptimal: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
solutionSchema.index({ problem: 1, user: 1 });
solutionSchema.index({ user: 1, createdAt: -1 });
solutionSchema.index({ problem: 1, isAccepted: 1, createdAt: -1 });
solutionSchema.index({ language: 1 });
solutionSchema.index({ isAccepted: 1 });
solutionSchema.index({ createdAt: -1 });

// Virtual for solution stats
solutionSchema.virtual('stats').get(function() {
  return {
    likes: this.likes,
    dislikes: this.dislikes,
    executionTime: this.executionTime,
    memoryUsed: this.memoryUsed,
    codeLength: this.codeLength,
    isOptimal: this.isOptimal
  };
});

// Method to toggle like
solutionSchema.methods.toggleLike = function(userId) {
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

// Method to calculate code metrics
solutionSchema.methods.calculateMetrics = function() {
  this.codeLength = this.code.length;
  
  // Calculate lines of code
  const lines = this.code.split('\n').length;
  
  // Calculate complexity (simple heuristic)
  const complexity = this.code.split(/if|for|while|switch|case/gi).length - 1;
  
  return {
    lines,
    complexity,
    length: this.codeLength
  };
};

// Pre-save middleware to calculate metrics
solutionSchema.pre('save', function(next) {
  if (this.isModified('code')) {
    this.codeLength = this.code.length;
  }
  next();
});

module.exports = mongoose.model('Solution', solutionSchema);
