const User = require('../models/User');

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      homeState: req.body.homeState,
      district: req.body.district,
      address: req.body.address,
      skills: req.body.skills,
      education: req.body.education,
      experience: req.body.experience
    };
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      fieldsToUpdate,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN CONTROLLERS

// @desc    Get all workers (admin only)
// @route   GET /api/admin/workers
// @access  Private/Admin
exports.getAllWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'worker' });
    
    res.status(200).json(workers);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve worker (admin only)
// @route   PUT /api/admin/workers/:id/approve
// @access  Private/Admin
exports.approveWorker = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    // Send email notification to worker
    // This would be implemented with the email service

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject worker (admin only)
// @route   PUT /api/admin/workers/:id/reject
// @access  Private/Admin
exports.rejectWorker = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    // Send email notification to worker
    // This would be implemented with the email service

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
