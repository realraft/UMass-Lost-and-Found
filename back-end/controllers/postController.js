// Post controller to handle post-related operations
import * as postModel from '../models/index.js';

// Get all posts
export const getAllPosts = (req, res) => {
  try {
    const posts = postModel.getAllPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a post by ID
export const getPostById = (req, res) => {
  try {
    const { id } = req.params;
    const post = postModel.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all posts by user ID - key for post manager page
export const getPostsByUserId = (req, res) => {
  try {
    const { userId } = req.params;
    const posts = postModel.getPostsByUserId(userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new post
export const createPost = (req, res) => {
  try {
    const postData = req.body;
    const newPost = postModel.createPost(postData);
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an existing post
export const updatePost = (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    
    const updatedPost = postModel.updatePost(id, postData);
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a post
export const deletePost = (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = postModel.deletePost(id);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: deletedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};