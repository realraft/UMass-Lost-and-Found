// Admin controller to handle admin-related operations
import * as postModel from '../models/index.js';

// Create a new report
export const createReport = (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData.post_id || !reportData.reason || !reportData.reported_by) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: post_id, reason, and reported_by are required' 
      });
    }

    const post = postModel.getPostById(reportData.post_id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const newReport = postModel.createReport(reportData);
    res.status(201).json({ 
      success: true, 
      data: newReport,
      message: 'Report created successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reported posts for admin review
export const getReportedPosts = (req, res) => {
  try {
    const reportedPosts = postModel.getReportedPosts();
    res.status(200).json({ success: true, data: reportedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific reported post by ID
export const getReportedPostById = (req, res) => {
  try {
    const { id } = req.params;
    const post = postModel.getReportedPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Reported post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep a reported post (remove from reported list)
export const keepPost = (req, res) => {
  try {
    const { id } = req.params;
    const keptPost = postModel.keepPost(id);
    
    if (!keptPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: keptPost, message: 'Post has been kept' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a reported post
export const deletePost = (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = postModel.deletePost(id);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Also remove any reports associated with this post
    postModel.deleteReports(id);
    
    res.status(200).json({ 
      success: true, 
      data: deletedPost, 
      message: 'Post and associated reports have been deleted' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add an admin comment to a post
export const addComment = (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    
    const updatedPost = postModel.addAdminComment(id, comment);
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: updatedPost, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all comments for a post
export const getComments = (req, res) => {
  try {
    const { id } = req.params;
    const comments = postModel.getAdminComments(id);
    
    if (!comments) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit an admin comment
export const editComment = (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    
    const updatedComment = postModel.editAdminComment(postId, commentId, comment);
    
    if (!updatedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    res.status(200).json({ success: true, data: updatedComment, message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};