// Admin controller to handle admin-related operations
import { Post, Report, AdminComment, User } from '../models/index.js';

// Helper function for standardized error responses
const errorResponse = (res, status, message) => res.status(status).json({ success: false, message });

// Helper function for standardized success responses
const successResponse = (res, status, data, message) => res.status(status).json({ 
  success: true, 
  data, 
  message 
});

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { post_id, reason, reported_by } = req.body;
    
    if (!post_id || !reason || !reported_by) {
      return errorResponse(res, 400, 'Missing required fields: post_id, reason, and reported_by are required');
    }

    // Check if post exists
    const post = await Post.findByPk(post_id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }
    
    // Check if user exists, create a default user if not
    let userId = reported_by;
    let user = await User.findByPk(userId) || await User.findByPk(1);
    
    // If even the fallback user doesn't exist, create a default user
    if (!user) {
      user = await User.create({
        id: 1,
        username: 'anonymous_reporter',
        email: 'anonymous@example.com',
        password: 'password123',
        role: 'user'
      });
      userId = user.id;
    } else if (userId !== user.id) {
      userId = user.id; // Use the found user's ID
    }
    
    const newReport = await Report.create({
      post_id,
      reason,
      reported_by: userId,
      status: 'pending'
    });

    return successResponse(res, 201, {
      ...post.toJSON(),
      reportedAt: newReport.createdAt,
      reportReason: newReport.reason,
      reportStatus: newReport.status
    }, 'Report created successfully');
  } catch (error) {
    console.error('Error creating report:', error);
    return errorResponse(res, 500, error.message);
  }
};

// Get all reported posts for admin review
export const getReportedPosts = async (req, res) => {
  try {
    // Get reports with pending status and include the associated posts
    const reports = await Report.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: Post,
          as: 'post',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
        },
        { model: User, as: 'reporter', attributes: ['id', 'username', 'email'] }
      ]
    });

    // Map the reports to a format matching what the admin page expects
    const reportedPosts = reports.map(report => {
      const post = report.post || {};
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        location: post.location,
        tags: post.tags,
        user: post.user,
        reportedAt: report.createdAt,
        reportReason: report.reason,
        reportStatus: report.status,
        reportId: report.id
      };
    });

    return successResponse(res, 200, reportedPosts);
  } catch (error) {
    console.error('Error in getReportedPosts:', error);
    return errorResponse(res, 500, error.message);
  }
};

// Get a specific reported post by ID
export const getReportedPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id, {
      include: [
        {
          model: Report,
          as: 'reports',
          include: [{ model: User, as: 'reporter', attributes: ['id', 'username', 'email'] }]
        },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        {
          model: AdminComment,
          as: 'adminComments',
          include: [{ model: User, as: 'admin', attributes: ['id', 'username', 'email', 'role'] }]
        }
      ]
    });
    
    if (!post) {
      return errorResponse(res, 404, 'Reported post not found');
    }
    
    return successResponse(res, 200, post);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Keep a reported post (remove from reported list)
export const keepPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }
    
    // Update all reports for this post to 'resolved'
    await Report.update({ status: 'resolved' }, { where: { post_id: id } });
    
    const updatedPost = await Post.findByPk(id, {
      include: [
        { model: Report, as: 'reports' },
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    return successResponse(res, 200, updatedPost, 'Post has been kept');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Delete a reported post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }
    
    // First get all the data to return
    const postData = post.toJSON();
    
    // Delete the post - this should cascade delete reports and admin comments
    await post.destroy();
    
    return successResponse(res, 200, postData, 'Post and associated reports have been deleted');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Add an admin comment to a post
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, admin_id } = req.body;
    
    if (!comment || !admin_id) {
      return errorResponse(res, 400, !comment ? 'Comment is required' : 'Admin ID is required');
    }
    
    const post = await Post.findByPk(id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }
    
    await AdminComment.create({ post_id: id, comment, admin_id });
    
    const updatedPost = await Post.findByPk(id, {
      include: [{
        model: AdminComment,
        as: 'adminComments',
        include: [{ model: User, as: 'admin', attributes: ['id', 'username', 'email', 'role'] }]
      }]
    });
    
    return successResponse(res, 200, updatedPost, 'Comment added successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Get all comments for a post
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id, {
      include: [{
        model: AdminComment,
        as: 'adminComments',
        include: [{ model: User, as: 'admin', attributes: ['id', 'username', 'email', 'role'] }]
      }]
    });
    
    if (!post) {
      return errorResponse(res, 404, 'Post not found');
    }
    
    // Format the response to match what the frontend expects
    const responseData = {
      post: {
        id: post.id,
        title: post.title,
        description: post.description,
        location: post.location
      },
      comments: post.adminComments || []
    };
    
    return successResponse(res, 200, responseData);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// Edit an admin comment
export const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    
    if (!comment) {
      return errorResponse(res, 400, 'Comment is required');
    }
    
    // Find the comment and make sure it belongs to the specified post
    const adminComment = await AdminComment.findOne({
      where: { id: commentId, post_id: postId }
    });
    
    if (!adminComment) {
      return errorResponse(res, 404, 'Comment not found for this post');
    }
    
    // Update and save in one step
    adminComment.comment = comment;
    await adminComment.save();
    
    // Return the updated comment with admin details
    const updatedComment = await AdminComment.findByPk(commentId, {
      include: [{ model: User, as: 'admin', attributes: ['id', 'username', 'email', 'role'] }]
    });
    
    return successResponse(res, 200, updatedComment, 'Comment updated successfully');
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};