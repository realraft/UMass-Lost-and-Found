// Seed script to populate the database with sample data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read data from server.json
const serverJsonPath = path.join(__dirname, '..', '..', 'front-end', 'source', 'Fake-Server', 'server.json');
const serverData = JSON.parse(fs.readFileSync(serverJsonPath, 'utf8'));

// Create sample users based on user IDs in the posts
const uniqueUserIds = [...new Set(serverData.posts.map(post => post.user_id))];
const users = uniqueUserIds.map(id => {
  return new User({
    id: id.toString(),
    username: `user${id}`,
    email: `user${id}@umass.edu`,
    password: 'password123',
    role: id === 101 ? 'admin' : 'user' // Make the first user an admin
  });
});

// Add an explicit admin user if needed
users.push(
  new User({
    id: 'admin',
    username: 'admin',
    email: 'admin@umass.edu',
    password: 'adminpass',
    role: 'admin'
  })
);

// Convert server.json posts to our Post model format
const posts = serverData.posts.map(post => {
  return new Post({
    id: post.id.toString(),
    title: post.title,
    description: post.description,
    type: post.title.toLowerCase().includes('lost') ? 'lost' : 'found', // Determine type based on title
    location: post.location,
    date: post.date,
    user_id: post.user_id.toString(),
    status: 'active',
    imageUrl: null // No image URLs in server.json
  });
});

// Create sample reports with proper format
const reports = [
  {
    id: "1",
    post_id: "1",
    reason: "This watch looks suspicious and may be stolen",
    reported_by: "102",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    post_id: "2",
    reason: "These keys may belong to someone else, possible fraudulent post",
    reported_by: "103",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    post_id: "3",
    reason: "This phone might be stolen, serial number matches reported theft",
    reported_by: "104",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "4",
    post_id: "4",
    reason: "Someone reported these sunglasses as counterfeit merchandise",
    reported_by: "105",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "5",
    post_id: "5",
    reason: "This backpack contains sensitive materials that need verification",
    reported_by: "106",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create empty admin comments array
const adminComments = [];

// Write seed data to files
fs.writeFileSync(
  path.join(__dirname, 'users.json'),
  JSON.stringify(users, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, 'posts.json'),
  JSON.stringify(posts, null, 2),
  'utf8'
);

// Write our properly formatted reports
fs.writeFileSync(
  path.join(__dirname, 'reports.json'),
  JSON.stringify(reports, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, 'postsMessages.json'),
  JSON.stringify(serverData.postsMessages, null, 2),
  'utf8'
);

// Write empty admin comments file
fs.writeFileSync(
  path.join(__dirname, 'adminComments.json'),
  JSON.stringify(adminComments, null, 2),
  'utf8'
);

console.log('Seed data has been generated successfully!');