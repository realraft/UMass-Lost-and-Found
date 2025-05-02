import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

class Message extends Model {}

Message.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Conversations',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Message',
  timestamps: true
});

class Conversation extends Model {}

Conversation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Posts',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Conversation',
  timestamps: true
});

// Define associations
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id'
});

export { Message, Conversation };