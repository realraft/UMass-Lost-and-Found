// Post database operations
import { Post, User, Report, AdminComment } from '../index.js';
import { Op } from 'sequelize';

/**
 * Get all posts with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} Array of posts
 */
export const getAllPosts = async (filters = {}) => {
  try {
    const whereClause = {};
    
    // Apply filters if provided
    if (filters.title) {
      whereClause.title = { [Op.like]: `%${filters.title}%` };
    }
    
    if (filters.location) {
      whereClause.location = { [Op.like]: `%${filters.location}%` };
    }
    
    const posts = await Post.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return posts;
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    throw error;
  }
};

/**
 * Get a post by ID
 * @param {number} id - Post ID
 * @returns {Promise<Object>} Post object
 */
export const getPostById = async (id) => {
  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    return post;
  } catch (error) {
    console.error(`Error in getPostById(${id}):`, error);
    throw error;
  }
};

/**
 * Get posts by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of posts
 */
export const getPostsByUserId = async (userId) => {
  try {
    const posts = await Post.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return posts;
  } catch (error) {
    console.error(`Error in getPostsByUserId(${userId}):`, error);
    throw error;
  }
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
export const createPost = async (postData) => {
  try {
    // First check if the user exists
    let user = await User.findByPk(postData.user_id);
    
    // If user doesn't exist, create a default user with that ID
    if (!user) {
      console.log(`User with ID ${postData.user_id} not found, creating a default user`);
      user = await User.create({
        id: postData.user_id,
        username: `user_${postData.user_id}`,
        email: `user_${postData.user_id}@example.com`,
        password: 'defaultPassword123', // In production, use a secure password or random hash
        role: 'user'
      });
      console.log(`Created default user with ID ${user.id}`);
    }

    // Create the post
    const post = await Post.create(postData);
    
    // Fetch the complete post with user data
    const completePost = await getPostById(post.id);
    return completePost;
  } catch (error) {
    console.error('Error in createPost:', error);
    throw error;
  }
};

/**
 * Update an existing post
 * @param {number} id - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} Updated post
 */
export const updatePost = async (id, postData) => {
  try {
    // First check if the post exists
    const existingPost = await getPostById(id);
    if (!existingPost) {
      console.log(`Post with ID ${id} not found for update`);
      return null;
    }
    
    await Post.update(postData, {
      where: { id },
      returning: true
    });
    
    // Always fetch the post after update to return the updated data
    const updatedPost = await getPostById(id);
    return updatedPost;
  } catch (error) {
    console.error(`Error in updatePost(${id}):`, error);
    throw error;
  }
};

/**
 * Delete a post
 * @param {number} id - Post ID
 * @returns {Promise<boolean>} True if deleted successfully
 */
export const deletePost = async (id) => {
  try {
    const deleted = await Post.destroy({
      where: { id }
    });
    
    return deleted > 0;
  } catch (error) {
    console.error(`Error in deletePost(${id}):`, error);
    throw error;
  }
};

/**
 * Get all reported posts
 * @returns {Promise<Array>} Array of reported posts with report details
 */
export const getReportedPosts = async () => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: Report,
          as: 'reports',
          where: { status: 'pending' },
          required: true
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    // Transform the data to include report information
    return posts.map(post => {
      const postJson = post.toJSON();
      const report = postJson.reports[0];
      return {
        ...postJson,
        reportedAt: report.createdAt,
        reportReason: report.reason,
        reportStatus: report.status
      };
    });
  } catch (error) {
    console.error('Error in getReportedPosts:', error);
    throw error;
  }
};

/**
 * Create a new report
 * @param {Object} reportData - Report data
 * @returns {Promise<Object>} Created report
 */
export const createReport = async (reportData) => {
  try {
    const report = await Report.create(reportData);
    return report;
  } catch (error) {
    console.error('Error in createReport:', error);
    throw error;
  }
};

/**
 * Get a reported post by ID
 * @param {number} id - Post ID
 * @returns {Promise<Object>} Post with report details
 */
export const getReportedPostById = async (id) => {
  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: Report,
          as: 'reports',
          where: { status: 'pending' },
          required: true
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    if (!post) return null;
    
    const postJson = post.toJSON();
    const report = postJson.reports[0];
    return {
      ...postJson,
      reportedAt: report.createdAt,
      reportReason: report.reason,
      reportStatus: report.status
    };
  } catch (error) {
    console.error(`Error in getReportedPostById(${id}):`, error);
    throw error;
  }
};

/**
 * Keep a reported post (mark reports as dismissed)
 * @param {number} id - Post ID
 * @returns {Promise<boolean>} True if successful
 */
export const keepPost = async (id) => {
  try {
    const updated = await Report.update(
      { status: 'dismissed' },
      { where: { post_id: id, status: 'pending' } }
    );
    return updated[0] > 0;
  } catch (error) {
    console.error(`Error in keepPost(${id}):`, error);
    throw error;
  }
};

/**
 * Delete reports for a post
 * @param {number} postId - Post ID
 * @returns {Promise<boolean>} True if successful
 */
export const deleteReports = async (postId) => {
  try {
    await Report.destroy({
      where: { post_id: postId }
    });
    return true;
  } catch (error) {
    console.error(`Error in deleteReports(${postId}):`, error);
    throw error;
  }
};

/**
 * Add an admin comment to a post
 * @param {number} postId - Post ID
 * @param {string} comment - Comment text
 * @returns {Promise<Object>} Created comment
 */
export const addAdminComment = async (postId, comment) => {
  try {
    const newComment = await AdminComment.create({
      post_id: postId,
      comment,
      admin_id: 101 // Using default admin ID, should be from session in production
    });
    return newComment;
  } catch (error) {
    console.error(`Error in addAdminComment(${postId}):`, error);
    throw error;
  }
};

/**
 * Get all admin comments for a post
 * @param {number} postId - Post ID
 * @returns {Promise<Object>} Comments with post details
 */
export const getAdminComments = async (postId) => {
  try {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: AdminComment,
          as: 'adminComments',
          include: [
            {
              model: User,
              as: 'admin',
              attributes: ['id', 'username']
            }
          ]
        }
      ]
    });
    
    if (!post) return null;
    
    return {
      post: post.toJSON(),
      comments: post.adminComments
    };
  } catch (error) {
    console.error(`Error in getAdminComments(${postId}):`, error);
    throw error;
  }
};

/**
 * Edit an admin comment
 * @param {number} postId - Post ID
 * @param {number} commentId - Comment ID
 * @param {string} comment - Updated comment text
 * @returns {Promise<Object>} Updated comment
 */
export const editAdminComment = async (postId, commentId, comment) => {
  try {
    const [updated] = await AdminComment.update(
      { comment },
      { 
        where: { 
          id: commentId,
          post_id: postId
        },
        returning: true
      }
    );
    
    if (updated) {
      const updatedComment = await AdminComment.findByPk(commentId, {
        include: [
          {
            model: User,
            as: 'admin',
            attributes: ['id', 'username']
          }
        ]
      });
      return updatedComment;
    }
    
    return null;
  } catch (error) {
    console.error(`Error in editAdminComment(${postId}, ${commentId}):`, error);
    throw error;
  }
};