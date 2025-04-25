// In-memory data store for posts and users
import Post from './Post.js';
import User from './User.js';
import Report from './Report.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to our JSON data files
const postsFilePath = path.join(__dirname, '../data/posts.json');
const usersFilePath = path.join(__dirname, '../data/users.json');
const reportsFilePath = path.join(__dirname, '../data/reports.json');
const adminCommentsFilePath = path.join(__dirname, '../data/adminComments.json');

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

if (!fs.existsSync(reportsFilePath)) {
  fs.writeFileSync(reportsFilePath, JSON.stringify([]), 'utf8');
}

if (!fs.existsSync(adminCommentsFilePath)) {
  fs.writeFileSync(adminCommentsFilePath, JSON.stringify([]), 'utf8');
}

// In-memory representation of our data
let posts = [];
let users = [];
let reports = [];
let adminComments = [];

// Load data from JSON files
try {
  posts = JSON.parse(fs.readFileSync(postsFilePath, 'utf8'));
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  reports = JSON.parse(fs.readFileSync(reportsFilePath, 'utf8'));
  adminComments = JSON.parse(fs.readFileSync(adminCommentsFilePath, 'utf8'));
} catch (error) {
  console.error('Error loading data:', error);
}

// Save data to JSON files
const saveData = () => {
  try {
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    fs.writeFileSync(reportsFilePath, JSON.stringify(reports, null, 2), 'utf8');
    fs.writeFileSync(adminCommentsFilePath, JSON.stringify(adminComments, null, 2), 'utf8');
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
    deleteReports(id);
    saveData();
    return deletedPost;
  }
  return null;
};

// Report-related operations
const createReport = (reportData) => {
  const newReport = new Report({
    ...reportData,
    id: Date.now().toString(),
    status: 'pending'
  });
  reports.push(newReport);
  saveData();
  return newReport;
};

const getReportsByPostId = (postId) => {
  return reports.filter(report => report.post_id === postId);
};

const getReportedPosts = () => {
  const reportedPostIds = new Set(reports.filter(r => r.status === 'pending').map(r => r.post_id));
  const reportedPosts = posts.filter(post => reportedPostIds.has(post.id)).map(post => {
    const report = reports.find(r => r.post_id === post.id && r.status === 'pending');
    return {
      ...post,
      reportedAt: report.createdAt,
      reportReason: report.reason,
      reportStatus: report.status
    };
  });
  return reportedPosts;
};

const getReportedPostById = (id) => {
  const post = posts.find(post => post.id === id);
  if (!post) return null;
  
  const postReports = getReportsByPostId(id);
  return { ...post, reports: postReports };
};

const deleteReports = (postId) => {
  reports = reports.filter(report => report.post_id !== postId);
  saveData();
};

const keepPost = (postId) => {
  const post = posts.find(post => post.id === postId);
  if (!post) return null;
  
  // Update all pending reports for this post to 'dismissed'
  reports.forEach(report => {
    if (report.post_id === postId && report.status === 'pending') {
      report.status = 'dismissed';
      report.updatedAt = new Date();
    }
  });
  
  saveData();
  return post;
};

// Admin comment operations
const addAdminComment = (postId, comment) => {
  const post = posts.find(post => post.id === postId);
  if (!post) return null;
  
  const newComment = {
    id: Date.now().toString(),
    post_id: postId,
    comment: comment,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  adminComments.push(newComment);
  saveData();
  return { ...post, comment: newComment };
};

const getAdminComments = (postId) => {
  const post = posts.find(post => post.id === postId);
  if (!post) return null;
  
  const postComments = adminComments.filter(comment => comment.post_id === postId);
  return { ...post, comments: postComments };
};

const editAdminComment = (postId, commentId, updatedComment) => {
  const post = posts.find(post => post.id === postId);
  if (!post) return null;
  
  const commentIndex = adminComments.findIndex(
    comment => comment.id === commentId && comment.post_id === postId
  );
  
  if (commentIndex === -1) return null;
  
  adminComments[commentIndex] = {
    ...adminComments[commentIndex],
    comment: updatedComment,
    updatedAt: new Date()
  };
  
  saveData();
  return adminComments[commentIndex];
};

export {
  getAllPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  createReport,
  getReportsByPostId,
  getReportedPosts,
  getReportedPostById,
  deleteReports,
  keepPost,
  addAdminComment,
  getAdminComments,
  editAdminComment
};