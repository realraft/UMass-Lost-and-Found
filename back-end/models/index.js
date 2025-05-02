// Models index file - Defines relationships between models and exports them
import { sequelize, testConnection } from './config.js';
import User from './User.js';
import Post from './Post.js';
import Report from './Report.js';
import AdminComment from './AdminComment.js';
import { Message, Conversation } from './Messages/Messages.js';

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

// Database sync function
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to sync database:', error);
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