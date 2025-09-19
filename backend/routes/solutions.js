const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Solution = require('../models/Solution');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { executeCode } = require('../utils/codeExecutor');

const router = express.Router();

// @desc    Get solutions for a problem
// @route   GET /api/solutions/problem/:problemId
// @access  Public
router.get('/problem/:problemId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('language').optional().isString().withMessage('Language must be a string'),
  query('sort').optional().isIn(['newest', 'oldest', 'most-liked', 'fastest', 'shortest']).withMessage('Invalid sort option')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { 
      problem: req.params.problemId,
      isAccepted: true,
      isPublic: true
    };

    if (req.query.language) {
      filter.language = req.query.language;
    }

    // Build sort
    let sort = {};
    switch (req.query.sort) {
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'most-liked':
        sort.likes = -1;
        break;
      case 'fastest':
        sort.executionTime = 1;
        break;
      case 'shortest':
        sort.codeLength = 1;
        break;
      default: // newest
        sort.createdAt = -1;
    }

    const solutions = await Solution.find(filter)
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Solution.countDocuments(filter);

    // Add user-specific data if authenticated
    if (req.user) {
      const userLikedSolutions = req.user.likedSolutions || [];
      solutions.forEach(solution => {
        solution.isLiked = userLikedSolutions.includes(solution._id.toString());
      });
    }

    res.json({
      success: true,
      count: solutions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: solutions
    });
  } catch (error) {
    console.error('Get solutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's solutions
// @route   GET /api/solutions/user/:userId
// @access  Public
router.get('/user/:userId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('problemId').optional().isMongoId().withMessage('Invalid problem ID')
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.params.userId };
    if (req.query.problemId) {
      filter.problem = req.query.problemId;
    }

    const solutions = await Solution.find(filter)
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Solution.countDocuments(filter);

    res.json({
      success: true,
      count: solutions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: solutions
    });
  } catch (error) {
    console.error('Get user solutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Submit solution
// @route   POST /api/solutions
// @access  Private
router.post('/', [
  protect,
  body('problemId')
    .isMongoId()
    .withMessage('Valid problem ID is required'),
  body('code')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Code must be between 10 and 50,000 characters'),
  body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'])
    .withMessage('Invalid programming language'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { problemId, code, language, notes } = req.body;

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Execute code
    const executionResult = await executeCode(code, language, problem.sampleInput, problem.sampleOutput);

    // Create solution
    const solution = await Solution.create({
      problem: problemId,
      user: req.user.id,
      userName: req.user.name,
      code,
      language,
      result: executionResult,
      isAccepted: executionResult.status === 'success' && executionResult.isCorrect,
      notes: notes || '',
      executionTime: executionResult.runtime || 0,
      memoryUsed: executionResult.memory || 0,
      codeLength: code.length
    });

    // Update problem statistics
    await problem.incrementSubmissions();
    if (solution.isAccepted) {
      await problem.incrementAcceptedSubmissions();
    }

    // Update user statistics if accepted
    if (solution.isAccepted) {
      const user = await User.findById(req.user.id);
      user.problemsSolved += 1;
      
      // Calculate score based on difficulty
      const difficultyScores = { easy: 10, medium: 20, hard: 50 };
      user.score += difficultyScores[problem.difficulty] || 10;
      
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: solution.isAccepted ? 'Solution accepted!' : 'Solution rejected',
      data: solution
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during code execution'
    });
  }
});

// @desc    Get single solution
// @route   GET /api/solutions/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id)
      .populate('problem', 'title difficulty')
      .populate('user', 'name avatar')
      .lean();

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Add user-specific data if authenticated
    if (req.user) {
      const userLikedSolutions = req.user.likedSolutions || [];
      solution.isLiked = userLikedSolutions.includes(solution._id.toString());
    }

    res.json({
      success: true,
      data: solution
    });
  } catch (error) {
    console.error('Get solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle like on solution
// @route   POST /api/solutions/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    const userLiked = req.user.likedSolutions.includes(solution._id);

    if (userLiked) {
      // Unlike
      req.user.likedSolutions.pull(solution._id);
      solution.likes = Math.max(0, solution.likes - 1);
    } else {
      // Like
      req.user.likedSolutions.addToSet(solution._id);
      solution.likes += 1;
    }

    await Promise.all([req.user.save(), solution.save()]);

    res.json({
      success: true,
      message: userLiked ? 'Solution unliked' : 'Solution liked',
      isLiked: !userLiked,
      likes: solution.likes
    });
  } catch (error) {
    console.error('Toggle solution like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update solution (notes, visibility)
// @route   PUT /api/solutions/:id
// @access  Private (Owner only)
router.put('/:id', [
  protect,
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check if user is the owner
    if (solution.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this solution'
      });
    }

    const updateData = {};
    if (req.body.notes !== undefined) updateData.notes = req.body.notes;
    if (req.body.isPublic !== undefined) updateData.isPublic = req.body.isPublic;

    const updatedSolution = await Solution.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('problem', 'title difficulty');

    res.json({
      success: true,
      message: 'Solution updated successfully',
      data: updatedSolution
    });
  } catch (error) {
    console.error('Update solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete solution
// @route   DELETE /api/solutions/:id
// @access  Private (Owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const solution = await Solution.findById(req.params.id);

    if (!solution) {
      return res.status(404).json({
        success: false,
        message: 'Solution not found'
      });
    }

    // Check if user is the owner
    if (solution.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this solution'
      });
    }

    await Solution.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Solution deleted successfully'
    });
  } catch (error) {
    console.error('Delete solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
