const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -likedProblems -likedSolutions')
      .lean();

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const problemsSolved = await Solution.countDocuments({ 
      user: user._id, 
      isAccepted: true 
    });

    const totalSubmissions = await Solution.countDocuments({ 
      user: user._id 
    });

    const problemsCreated = await Problem.countDocuments({ 
      author: user._id,
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          problemsSolved,
          totalSubmissions,
          problemsCreated,
          score: user.score,
          joinDate: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Owner only)
router.put('/:id', [
  protect,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('avatar')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Avatar URL too long')
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

    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const { name, bio, skills, avatar } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's problems
// @route   GET /api/users/:id/problems
// @access  Public
router.get('/:id/problems', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { 
      author: req.params.id,
      isActive: true 
    };

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Problem.countDocuments(filter);

    res.json({
      success: true,
      count: problems.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: problems
    });
  } catch (error) {
    console.error('Get user problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's solutions
// @route   GET /api/users/:id/solutions
// @access  Public
router.get('/:id/solutions', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('accepted').optional().isBoolean().withMessage('Accepted must be a boolean'),
  query('language').optional().isString().withMessage('Language must be a string')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.params.id };
    
    if (req.query.accepted !== undefined) {
      filter.isAccepted = req.query.accepted === 'true';
    }
    
    if (req.query.language) {
      filter.language = req.query.language;
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

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
router.get('/leaderboard', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['score', 'problemsSolved', 'recent']).withMessage('Invalid sort option')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let sort = {};
    switch (req.query.sort) {
      case 'problemsSolved':
        sort = { problemsSolved: -1, score: -1 };
        break;
      case 'recent':
        sort = { lastLogin: -1 };
        break;
      default: // score
        sort = { score: -1, problemsSolved: -1 };
    }

    const users = await User.find({ isActive: true })
      .select('name email score problemsSolved avatar createdAt lastLogin')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({ isActive: true });

    // Add rank
    users.forEach((user, index) => {
      user.rank = skip + index + 1;
    });

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const userId = req.params.id;

    // Get basic user info
    const user = await User.findById(userId).select('score problemsSolved createdAt');
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get detailed statistics
    const [
      totalSubmissions,
      acceptedSubmissions,
      problemsCreated,
      solutionsByLanguage,
      recentActivity
    ] = await Promise.all([
      Solution.countDocuments({ user: userId }),
      Solution.countDocuments({ user: userId, isAccepted: true }),
      Problem.countDocuments({ author: userId, isActive: true }),
      Solution.aggregate([
        { $match: { user: userId, isAccepted: true } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Solution.find({ user: userId, isAccepted: true })
        .populate('problem', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('problem language createdAt')
        .lean()
    ]);

    const acceptanceRate = totalSubmissions > 0 
      ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        score: user.score,
        problemsSolved: user.problemsSolved,
        totalSubmissions,
        acceptedSubmissions,
        problemsCreated,
        acceptanceRate: parseFloat(acceptanceRate),
        solutionsByLanguage,
        recentActivity,
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
router.get('/search', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.q;

    const users = await User.find({
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { skills: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    })
    .select('name email score problemsSolved avatar skills')
    .sort({ score: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await User.countDocuments({
      isActive: true,
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { skills: { $in: [new RegExp(searchQuery, 'i')] } }
      ]
    });

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
