// Seed script to populate the database with sample data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import User from '../models/User.js';

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

// Also write reports and messages data
fs.writeFileSync(
  path.join(__dirname, 'reports.json'),
  JSON.stringify(serverData.reports, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(__dirname, 'postsMessages.json'),
  JSON.stringify(serverData.postsMessages, null, 2),
  'utf8'
);

console.log('Seed data has been generated successfully!');