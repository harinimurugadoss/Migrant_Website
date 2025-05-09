const Document = require('../models/Document');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Create document record
    const document = await Document.create({
      name: req.body.name,
      type: req.body.type,
      fileUrl: `/uploads/${req.file.filename}`,
      filePath: req.file.path,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user documents
// @route   GET /api/documents
// @access  Private
exports.getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user.id });
    
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if document belongs to user
    if (document.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }
    
    // Don't allow deletion of approved documents
    if (document.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Approved documents cannot be deleted'
      });
    }
    
    // Delete file from server
    fs.unlink(document.filePath, async (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
      
      // Delete document record from database
      await document.remove();
      
      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN CONTROLLERS

// @desc    Get all documents (admin)
// @route   GET /api/admin/documents
// @access  Private/Admin
exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find().populate({
      path: 'user',
      select: 'name workerId'
    });
    
    res.status(200).json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve document (admin)
// @route   PUT /api/admin/documents/:id/approve
// @access  Private/Admin
exports.approveDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject document (admin)
// @route   PUT /api/admin/documents/:id/reject
// @access  Private/Admin
exports.rejectDocument = async (req, res, next) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};
