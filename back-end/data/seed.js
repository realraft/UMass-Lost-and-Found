// Seed script to populate the database with sample data using Sequelize
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User, Post, Report, AdminComment, sequelize, syncDatabase, Conversation, Message } from '../models/index.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read data from server.json
const serverJsonPath = path.join(__dirname, '..', '..', 'front-end', 'source', 'Fake-Server', 'server.json');
const serverData = JSON.parse(fs.readFileSync(serverJsonPath, 'utf8'));

async function seedDatabase() {
  try {
    // Sync database models
    await syncDatabase();
    
    console.log('Database synchronized. Beginning seeding...');

    // First clear all existing data
    await Message.destroy({ where: {} });
    await Conversation.destroy({ where: {} });
    await AdminComment.destroy({ where: {} });
    await Report.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    // Create sample users based on user IDs in the posts
    const uniqueUserIds = [...new Set(serverData.posts.map(post => post.user_id))];
    const userPromises = uniqueUserIds.map(id => {
      return User.create({
        username: `user${id}`,
        email: `user${id}@umass.edu`,
        password: 'password123',
        role: id === 101 ? 'admin' : 'user' // Make user 101 an admin
      });
    });
    
    // Add an explicit admin user
    userPromises.push(
      User.create({
        username: 'admin',
        email: 'admin@umass.edu',
        password: 'adminpass',
        role: 'admin'
      })
    );
    
    const createdUsers = await Promise.all(userPromises);
    console.log(`Created ${createdUsers.length} users`);
    
    // Create a mapping of original user IDs to new Sequelize IDs
    const userIdMap = {};
    createdUsers.forEach((user, index) => {
      if (index < uniqueUserIds.length) {
        userIdMap[uniqueUserIds[index]] = user.id;
      }
    });

    // Create posts
    const postPromises = serverData.posts.map(post => {
      return Post.create({
        title: post.title,
        description: post.description,
        location: post.location,
        date: new Date(post.date),
        user_id: userIdMap[post.user_id] || createdUsers[0].id, // Use the first user as fallback
        imageUrl: null // No image URLs in server.json
      });
    });
    
    const createdPosts = await Promise.all(postPromises);
    console.log(`Created ${createdPosts.length} posts`);
    
    // Create a mapping of original post IDs to new Sequelize IDs
    const postIdMap = {};
    createdPosts.forEach((post, index) => {
      postIdMap[serverData.posts[index].id] = post.id;
    });
    
    // Create sample reports
    const reportData = [
      {
        post_id: postIdMap[1] || createdPosts[0].id,
        reason: "This watch looks suspicious and may be stolen",
        reported_by: userIdMap[102] || createdUsers[1].id,
        status: "pending"
      },
      {
        post_id: postIdMap[2] || createdPosts[1].id,
        reason: "These keys may belong to someone else, possible fraudulent post",
        reported_by: userIdMap[103] || createdUsers[2].id,
        status: "pending"
      },
      {
        post_id: postIdMap[3] || createdPosts[2].id,
        reason: "This phone might be stolen, serial number matches reported theft",
        reported_by: userIdMap[104] || createdUsers[3].id, 
        status: "pending"
      },
      {
        post_id: postIdMap[4] || createdPosts[3].id,
        reason: "Someone reported these sunglasses as counterfeit merchandise",
        reported_by: userIdMap[105] || createdUsers[4].id,
        status: "pending"
      },
      {
        post_id: postIdMap[5] || createdPosts[4].id,
        reason: "This backpack contains sensitive materials that need verification",
        reported_by: userIdMap[106] || createdUsers[5].id,
        status: "pending"
      }
    ];
    
    const createdReports = await Report.bulkCreate(reportData);
    console.log(`Created ${createdReports.length} reports`);
    
    // Add some admin comments
    const adminCommentData = [
      {
        post_id: createdPosts[0].id,
        comment: "Please provide more details about when this item was found",
        admin_id: createdUsers.find(u => u.role === 'admin').id
      },
      {
        post_id: createdPosts[1].id,
        comment: "This post has been verified",
        admin_id: createdUsers.find(u => u.role === 'admin').id
      }
    ];
    
    const createdAdminComments = await AdminComment.bulkCreate(adminCommentData);
    console.log(`Created ${createdAdminComments.length} admin comments`);

    const conversationData = [
      {
        post_id: createdPosts[0].id,
        user1_id: 1,
        user2_id: 2
      },
      {
        post_id: createdPosts[1].id,
        user1_id: 2,
        user2_id: 3
      }
    ];
    
    const createdConversations = await Conversation.bulkCreate(conversationData);
    console.log(`Created ${createdConversations.length} conversations`);

    const messageData = [
      {
        conversation_id: createdConversations[0].id,
        user_id: 1,
        text: "Hi, is this item still available?"
      },
      {
        conversation_id: createdConversations[0].id,
        user_id: 2,
        text: "Yes, it is. Would you like to meet on campus?"
      },
      {
        conversation_id: createdConversations[1].id,
        user_id: 2,
        text: "Hey, I think I saw this near the library."
      },
      {
        conversation_id: createdConversations[1].id,
        user_id: 3,
        text: "Thanks! I'll go check there."
      }
    ];

    const allConvos = await Conversation.findAll({ raw: true });
    console.log("All conversations in DB:", allConvos);

    const createdMessages = await Message.bulkCreate(messageData);
    console.log(`Created ${createdMessages.length} messages`);
    
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the seed function
seedDatabase();