import * as postModel from '../models/operations/postOperations.js';

export const getAllPosts = async (req, res) => {
  try {
    const posts = await postModel.getAllPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error in getAllPosts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error('Error in getPostById:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await postModel.getPostsByUserId(userId);
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error in getPostsByUserId:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const postData = req.body;
    const newPost = await postModel.createPost(postData);
    
    // Fetch the created post with user data
    const postWithUser = await postModel.getPostById(newPost.id);
    
    res.status(201).json({ success: true, data: postWithUser });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    
    const updatedPost = await postModel.updatePost(id, postData);
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error in updatePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await postModel.deletePost(id);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    res.status(200).json({ success: true, data: deletedPost });
  } catch (error) {
    console.error('Error in deletePost:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};