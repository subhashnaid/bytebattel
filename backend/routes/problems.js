const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all problems with filtering and pagination
// @route   GET /api/problems
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty'),
  query('sort').optional().isIn(['newest', 'oldest', 'most-liked', 'alphabetical', 'most-solved']).withMessage('Invalid sort option'),
  query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),
  query('tags').optional().isString().withMessage('Tags must be a string')
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

    // Build filter object
    const filter = { isActive: true };

    // Difficulty filter
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }

    // Tags filter
    if (req.query.tags) {
      const tags = req.query.tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tags };
    }

    // Search filter
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { statement: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } },
        { authorName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    switch (req.query.sort) {
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'most-liked':
        sort.likes = -1;
        break;
      case 'alphabetical':
        sort.title = 1;
        break;
      case 'most-solved':
        sort.acceptedSubmissions = -1;
        break;
      default: // newest
        sort.createdAt = -1;
    }

    // Get problems
    const problems = await Problem.find(filter)
      .populate('author', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Problem.countDocuments(filter);

    // Add user-specific data if authenticated
    if (req.user) {
      const userLikedProblems = req.user.likedProblems || [];
      problems.forEach(problem => {
        problem.isLiked = userLikedProblems.includes(problem._id.toString());
      });
    }

    res.json({
      success: true,
      count: problems.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: problems
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'name email')
      .lean();

    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Increment views
    await Problem.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Add user-specific data if authenticated
    if (req.user) {
      const userLikedProblems = req.user.likedProblems || [];
      problem.isLiked = userLikedProblems.includes(problem._id.toString());
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private
router.post('/', [
  protect,
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('tags')
    .isArray({ min: 1 })
    .withMessage('At least one tag is required'),
  body('statement')
    .isLength({ min: 50 })
    .withMessage('Problem statement must be at least 50 characters'),
  body('sampleInput')
    .notEmpty()
    .withMessage('Sample input is required'),
  body('sampleOutput')
    .notEmpty()
    .withMessage('Sample output is required')
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

    const {
      title,
      difficulty,
      tags,
      statement,
      sampleInput,
      sampleOutput,
      testCases = [],
      timeLimit = 1000,
      memoryLimit = 256
    } = req.body;

    // Create problem
    const problem = await Problem.create({
      title,
      difficulty,
      tags: tags.map(tag => tag.toLowerCase().trim()),
      statement,
      sampleInput,
      sampleOutput,
      testCases,
      timeLimit,
      memoryLimit,
      author: req.user.id,
      authorName: req.user.name
    });

    // Populate author info
    await problem.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      data: problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private (Author only)
router.put('/:id', [
  protect,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('tags')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one tag is required'),
  body('statement')
    .optional()
    .isLength({ min: 50 })
    .withMessage('Problem statement must be at least 50 characters')
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

    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user is the author
    if (problem.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this problem'
      });
    }

    // Update fields
    const updateData = { ...req.body };
    if (updateData.tags) {
      updateData.tags = updateData.tags.map(tag => tag.toLowerCase().trim());
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      message: 'Problem updated successfully',
      data: updatedProblem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private (Author only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user is the author
    if (problem.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this problem'
      });
    }

    // Soft delete by setting isActive to false
    problem.isActive = false;
    await problem.save();

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle like on problem
// @route   POST /api/problems/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    const userLiked = req.user.likedProblems.includes(problem._id);

    if (userLiked) {
      // Unlike
      req.user.likedProblems.pull(problem._id);
      problem.likes = Math.max(0, problem.likes - 1);
    } else {
      // Like
      req.user.likedProblems.addToSet(problem._id);
      problem.likes += 1;
    }

    await Promise.all([req.user.save(), problem.save()]);

    res.json({
      success: true,
      message: userLiked ? 'Problem unliked' : 'Problem liked',
      isLiked: !userLiked,
      likes: problem.likes
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get problem statistics
// @route   GET /api/problems/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).select('stats');

    if (!problem || !problem.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Get additional stats
    const totalSolutions = await Solution.countDocuments({ problem: problem._id });
    const acceptedSolutions = await Solution.countDocuments({ 
      problem: problem._id, 
      isAccepted: true 
    });

    res.json({
      success: true,
      data: {
        ...problem.stats,
        totalSolutions,
        acceptedSolutions,
        acceptanceRate: totalSolutions > 0 ? ((acceptedSolutions / totalSolutions) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get problem stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
