// Models index file - Defines relationships between models and exports them
import { sequelize, testConnection } from './config.js';
import User from './User.js';
import Post from './Post.js';
import Report from './Report.js';
import AdminComment from './AdminComment.js';
import { Message, Conversation } from './Messages.js';

// Define model associations
User.hasMany(Post, {
  foreignKey: 'user_id',
  as: 'posts'
});

Post.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

User.hasMany(Report, {
  foreignKey: 'reported_by',
  as: 'reports'
});

Report.belongsTo(User, {
  foreignKey: 'reported_by',
  as: 'reporter'
});

Post.hasMany(Report, {
  foreignKey: 'post_id',
  as: 'reports'
});

Report.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

Post.hasMany(AdminComment, {
  foreignKey: 'post_id',
  as: 'adminComments'
});

AdminComment.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

User.hasMany(AdminComment, {
  foreignKey: 'admin_id',
  as: 'comments'
});

AdminComment.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin'
});

Post.hasMany(Conversation, {
  foreignKey: 'post_id',
  as: 'conversations'
});

Conversation.belongsTo(Post, {
  foreignKey: 'post_id',
  as: 'post'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'message'
});

Message.belongsTo(User, { 
  foreignKey: 'user_id',
  as: 'sender' 
})

User.hasMany(Conversation, {
  foreignKey: 'user1_id',
  as: 'ConversationsAsUser1'
});

User.hasMany(Conversation, {
  foreignKey: 'user2_id',
  as: 'ConversationsAsUser2'
});

Conversation.belongsTo(User, {
  as: 'User1',
  foreignKey: 'user1_id'
});

Conversation.belongsTo(User, {
  as: 'User2',
  foreignKey: 'user2_id'
});

// User-Message association (both sides)
User.hasMany(Message, {
  foreignKey: 'user_id',
  as: 'messages'
});

Message.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Database sync function
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

// Post operations
export const getPostById = async (id) => {
  try {
    return await Post.findByPk(id);
  } catch (error) {
    console.error('Error getting post by ID:', error);
    throw error;
  }
};

// Report operations
export const createReport = async (reportData) => {
  try {
    console.log('Creating report with data:', reportData);
    
    // Ensure these are proper integers for SQLite
    const postId = parseInt(reportData.post_id, 10);
    const reportedBy = parseInt(reportData.reported_by, 10);
    
    // First verify the post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }
    
    // Verify user exists (if not using a dummy ID)
    let user = null;
    try {
      user = await User.findByPk(reportedBy);
    } catch (error) {
      console.log('User lookup failed, using default admin user');
    }
    
    // If user doesn't exist, use admin user ID 1
    const finalReportedBy = user ? reportedBy : 1;
    
    // Create the report with the parsed values
    const newReport = await Report.create({
      post_id: postId,
      reason: reportData.reason,
      reported_by: finalReportedBy,
      status: 'pending'
    });
    
    console.log('Successfully created report:', newReport.id);
    return newReport;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

export const getReportedPosts = async () => {
  try {
    const reports = await Report.findAll({
      include: [{
        model: Post,
        as: 'post',
        attributes: ['id', 'title', 'description', 'location', 'date', 'tags']
      }]
    });

    // Map reports to include both report data and post data
    return reports.map(report => {
      const post = report.post;
      return {
        id: post.id,
        title: post.title,
        description: post.description,
        location: post.location,
        date: post.date,
        tags: post.tags,
        reportedAt: report.createdAt,
        reportReason: report.reason,
        reportStatus: report.status
      };
    });
  } catch (error) {
    console.error('Error getting reported posts:', error);
    throw error;
  }
};

export const getReportedPostById = async (postId) => {
  try {
    const report = await Report.findOne({
      where: { post_id: postId },
      include: [{
        model: Post,
        as: 'post',
        attributes: ['id', 'title', 'description', 'location', 'date', 'tags']
      }]
    });

    if (!report) return null;

    const post = report.post;
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      location: post.location,
      date: post.date,
      tags: post.tags,
      reportedAt: report.createdAt,
      reportReason: report.reason,
      reportStatus: report.status
    };
  } catch (error) {
    console.error('Error getting reported post by ID:', error);
    throw error;
  }
};

export const keepPost = async (postId) => {
  try {
    const report = await Report.findOne({ where: { post_id: postId } });
    if (!report) return null;

    await report.destroy();
    return { id: postId };
  } catch (error) {
    console.error('Error keeping post:', error);
    throw error;
  }
};

// Delete a reported post
export const deletePost = async (postId) => {
  try {
    console.log(`[MODEL] Deleting post with ID: ${postId}, type: ${typeof postId}`);
    
    // Ensure we're working with a numeric ID
    const id = parseInt(postId, 10);
    if (isNaN(id)) {
      console.log(`[MODEL] Invalid post ID format: ${postId}`);
      return null;
    }
    
    console.log(`[MODEL] Looking for post with ID: ${id}`);
    const post = await Post.findByPk(id);
    
    if (!post) {
      console.log(`[MODEL] Post with ID ${id} not found`);
      return null;
    }

    console.log(`[MODEL] Found post to delete: ${post.id}, title: ${post.title}`);
    
    // Delete related records first to avoid foreign key constraint errors
    // 1. First delete messages in conversations related to this post
    const conversations = await Conversation.findAll({ where: { post_id: id } });
    for (const conversation of conversations) {
      console.log(`[MODEL] Deleting messages for conversation ${conversation.id}`);
      await Message.destroy({ where: { conversation_id: conversation.id } });
    }
    
    // 2. Then delete conversations related to this post
    console.log(`[MODEL] Deleting conversations for post ${id}`);
    await Conversation.destroy({ where: { post_id: id } });
    
    // 3. Delete admin comments related to this post
    console.log(`[MODEL] Deleting admin comments for post ${id}`);
    await AdminComment.destroy({ where: { post_id: id } });
    
    // 4. Delete reports for this post
    console.log(`[MODEL] Deleting reports for post ${id}`);
    await Report.destroy({ where: { post_id: id } });
    
    // 5. Finally delete the post itself
    await post.destroy();
    console.log(`[MODEL] Successfully deleted post with ID: ${id}`);
    
    return { id: id };
  } catch (error) {
    console.error('[MODEL] Error deleting post:', error);
    throw error;
  }
};

export const deleteReports = async (postId) => {
  try {
    console.log(`[MODEL] Deleting reports for post ID: ${postId}`);
    
    // Ensure we're working with a numeric ID
    const id = parseInt(postId, 10);
    if (isNaN(id)) {
      console.log(`[MODEL] Invalid post ID format for report deletion: ${postId}`);
      return;
    }
    
    const result = await Report.destroy({ where: { post_id: id } });
    console.log(`[MODEL] Deleted ${result} reports for post ID: ${id}`);
  } catch (error) {
    console.error('[MODEL] Error deleting reports:', error);
    throw error;
  }
};

// Admin Comments operations
export const addAdminComment = async (postId, commentText) => {
  try {
    // Assuming admin_id is 1 for simplicity
    const adminId = 1;
    const comment = await AdminComment.create({
      post_id: postId,
      admin_id: adminId,
      comment: commentText
    });

    return { comment };
  } catch (error) {
    console.error('Error adding admin comment:', error);
    throw error;
  }
};

export const getAdminComments = async (postId) => {
  try {
    const comments = await AdminComment.findAll({
      where: { post_id: postId },
      order: [['createdAt', 'DESC']]
    });

    return { comments };
  } catch (error) {
    console.error('Error getting admin comments:', error);
    throw error;
  }
};

export const editAdminComment = async (postId, commentId, commentText) => {
  try {
    const comment = await AdminComment.findOne({
      where: { id: commentId, post_id: postId }
    });

    if (!comment) return null;

    comment.comment = commentText;
    await comment.save();
    
    return comment;
  } catch (error) {
    console.error('Error editing admin comment:', error);
    throw error;
  }
};

// Export models and database sync function
export {
  sequelize,
  testConnection,
  syncDatabase,
  User,
  Post,
  Report,
  AdminComment,
  Message,
  Conversation
};