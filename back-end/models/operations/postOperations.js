// Post database operations
import { Post, User } from '../index.js';
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
    const post = await Post.create(postData);
    return post;
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
    const deleted = await Post.destroy({
      where: { id }
    });
    
    return deleted > 0;
  } catch (error) {
    console.error(`Error in deletePost(${id}):`, error);
    throw error;
  }
};