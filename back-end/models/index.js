// In-memory data store for posts and users
import Post from './Post.js';
import User from './User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our JSON data files
const postsFilePath = path.join(__dirname, '../data/posts.json');
const usersFilePath = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize with empty arrays
if (!fs.existsSync(postsFilePath)) {
  fs.writeFileSync(postsFilePath, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
}

// In-memory representation of our data
let posts = [];
let users = [];

// Load data from JSON files
try {
  posts = JSON.parse(fs.readFileSync(postsFilePath, 'utf8'));
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
} catch (error) {
  console.error('Error loading data:', error);
}

// Save data to JSON files
const saveData = () => {
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Posts CRUD operations
const getAllPosts = () => posts;

const getPostById = (id) => posts.find(post => post.id === id);

const getPostsByUserId = (userId) => posts.filter(post => post.user_id === userId);

const createPost = (postData) => {
  const newPost = new Post({
    ...postData,
    id: Date.now().toString(), // Simple unique ID generation
  });
  posts.push(newPost);
  saveData();
  return newPost;
};

const updatePost = (id, postData) => {
  const index = posts.findIndex(post => post.id === id);
  if (index !== -1) {
    posts[index] = { 
      ...posts[index], 
      ...postData,
      updatedAt: new Date()
    };
    saveData();
    return posts[index];
  }
  return null;
};

const deletePost = (id) => {
  const index = posts.findIndex(post => post.id === id);
  if (index !== -1) {
    const deletedPost = posts.splice(index, 1)[0];
    saveData();
    return deletedPost;
  }
  return null;
};

export {
  getAllPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost
};