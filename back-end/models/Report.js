import { Model, DataTypes } from 'sequelize';
import { sequelize } from './config.js';

class Report extends Model {}

Report.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'dismissed', 'resolved'),
    defaultValue: 'pending'
  }
}, {
  sequelize,
  modelName: 'Report',
  timestamps: true
});

export default Report;