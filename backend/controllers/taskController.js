const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get worker tasks
// @route   GET /api/tasks
// @access  Private
exports.getWorkerTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Find task
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if task is assigned to this worker
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    // Update status
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN CONTROLLERS

// @desc    Create task (admin)
// @route   POST /api/admin/tasks
// @access  Private/Admin
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, assignedTo, location } = req.body;
    
    // Check if assigned worker exists
    const worker = await User.findById(assignedTo);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({
        success: false,
        message: 'Invalid worker assigned'
      });
    }
    
    // Create task
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      location,
      assignedTo,
      assignedBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks (admin)
// @route   GET /api/admin/tasks
// @access  Private/Admin
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate({
        path: 'assignedTo',
        select: 'name workerId'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Get tasks by worker (admin)
// @route   GET /api/admin/tasks/worker/:workerId
// @access  Private/Admin
exports.getTasksByWorker = async (req, res, next) => {
  try {
    // Find worker by workerId
    const worker = await User.findOne({ workerId: req.params.workerId });
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }
    
    // Get tasks assigned to this worker
    const tasks = await Task.find({ assignedTo: worker._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task (admin)
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, location, assignedTo } = req.body;
    
    // Prepare update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate;
    if (priority) updateData.priority = priority;
    if (status) updateData.status = status;
    if (location) updateData.location = location;
    
    // If assigning to different worker, verify worker exists
    if (assignedTo) {
      const worker = await User.findById(assignedTo);
      if (!worker || worker.role !== 'worker') {
        return res.status(400).json({
          success: false,
          message: 'Invalid worker assigned'
        });
      }
      updateData.assignedTo = assignedTo;
    }
    
    // Update task
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task (admin)
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
