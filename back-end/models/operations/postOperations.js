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
    const user = await User.findByPk(postData.user_id);
    if (!user) {
      throw new Error('Invalid user ID - user does not exist');
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
    const [updated] = await Post.update(postData, {
      where: { id },
      returning: true
    });
    
    if (updated) {
      const updatedPost = await getPostById(id);
      return updatedPost;
    }
    
    return null;
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
    // Get the post first to ensure it exists and to return it later
    const post = await Post.findByPk(id);
    if (!post) {
      return false; // Post not found
    }
    
    // Store post data before deletion
    const postData = post.toJSON();
    
    // Use sequelize directly for raw SQL to bypass foreign key constraints
    const { sequelize } = await import('../config.js');

    // Begin a transaction to ensure all operations complete successfully or all roll back
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Delete all messages tied to conversations for this post
      await sequelize.query(
        'DELETE FROM Messages WHERE conversation_id IN (SELECT id FROM Conversations WHERE post_id = ?)',
        {
          replacements: [id],
          transaction
        }
      );
      
      // 2. Delete all conversations for this post
      await sequelize.query(
        'DELETE FROM Conversations WHERE post_id = ?',
        {
          replacements: [id],
          transaction
        }
      );
      
      // 3. Delete all admin comments for this post
      await sequelize.query(
        'DELETE FROM AdminComments WHERE post_id = ?',
        {
          replacements: [id],
          transaction
        }
      );
      
      // 4. Delete all reports for this post
      await sequelize.query(
        'DELETE FROM Reports WHERE post_id = ?',
        {
          replacements: [id],
          transaction
        }
      );
      
      // 5. Finally delete the post itself
      const [affectedRows] = await sequelize.query(
        'DELETE FROM Posts WHERE id = ?',
        {
          replacements: [id],
          transaction
        }
      );
      
      // Commit the transaction
      await transaction.commit();
      
      // Return the post data for the response
      return postData;
    } catch (error) {
      // If an error occurs, roll back the transaction
      await transaction.rollback();
      throw error;
    }
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