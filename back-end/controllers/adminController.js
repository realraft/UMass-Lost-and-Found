// Admin controller to handle admin-related operations
import * as postModel from '../models/index.js';

// Create a new report
export const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    
    if (!reportData.post_id || !reportData.reason || !reportData.reported_by) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: post_id, reason, and reported_by are required' 
      });
    }

    const post = await postModel.getPostById(reportData.post_id);
    if (!post) {
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    const newReport = await postModel.createReport(reportData);
    
    // Create a safe response object without depending on toJSON()
    const responseData = {
      id: post.id,
      title: post.title,
      description: post.description,
      location: post.location,
      date: post.date,
      tags: post.tags,
      reportedAt: newReport.createdAt,
      reportReason: newReport.reason,
      reportStatus: newReport.status
    };
    
    res.status(201).json({ 
      success: true, 
      data: responseData,
      message: 'Report created successfully' 
    });
  } catch (error) {
    console.error('Error in createReport controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reported posts for admin review
export const getReportedPosts = async (req, res) => {
  try {
    const reportedPosts = await postModel.getReportedPosts();
    res.status(200).json({ success: true, data: reportedPosts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific reported post by ID
export const getReportedPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.getReportedPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Reported post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep a reported post (remove from reported list)
export const keepPost = async (req, res) => {
  try {
    const { id } = req.params;
    const keptPost = await postModel.keepPost(id);
    
    if (!keptPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: keptPost, message: 'Post has been kept' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a reported post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[ADMIN CONTROLLER] Attempting to delete post with ID: ${id}, type: ${typeof id}`);
    
    // Ensure we have a valid integer ID
    const postId = parseInt(id, 10);
    
    if (isNaN(postId)) {
      console.log(`[ADMIN CONTROLLER] Invalid post ID format: ${id}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid post ID format' 
      });
    }
    
    console.log(`[ADMIN CONTROLLER] Parsed post ID for deletion: ${postId}`);
    
    // Use the imported postModel functions instead of direct model access
    const deletedPost = await postModel.deletePost(postId);
    
    if (!deletedPost) {
      console.log(`[ADMIN CONTROLLER] Post with ID ${postId} not found for deletion`);
      return res.status(404).json({ 
        success: false, 
        message: 'Post not found' 
      });
    }
    
    // Also remove any reports associated with this post
    await postModel.deleteReports(postId);
    console.log(`[ADMIN CONTROLLER] All reports for post ${postId} deleted`);
    
    res.status(200).json({ 
      success: true, 
      data: deletedPost, 
      message: 'Post and associated reports have been deleted' 
    });
  } catch (error) {
    console.error('[ADMIN CONTROLLER] Error in deletePost controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add an admin comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    
    const updatedPost = await postModel.addAdminComment(id, comment);
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: updatedPost, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await postModel.getAdminComments(id);
    
    if (!comments) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit an admin comment
export const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required' });
    }
    
    const updatedComment = await postModel.editAdminComment(postId, commentId, comment);
    
    if (!updatedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    res.status(200).json({ success: true, data: updatedComment, message: 'Comment updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};