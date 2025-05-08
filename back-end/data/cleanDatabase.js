// Clean database script - Removes all pre-seeded reports from the Admin page
import { Sequelize, Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// First make a backup of the database file
const dbPath = path.join(__dirname, 'database.sqlite');
const backupPath = path.join(__dirname, `database.sqlite.backup-${Date.now()}`);
fs.copyFileSync(dbPath, backupPath);
console.log(`Created database backup at: ${backupPath}`);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// Define the Report model for direct database operations
const Report = sequelize.define('Report', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: Sequelize.INTEGER,
  reason: Sequelize.TEXT,
  reported_by: Sequelize.INTEGER,
  status: Sequelize.STRING
}, {
  tableName: 'Reports',
  timestamps: true
});

async function cleanDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Delete all existing reports - this will remove them from the Admin page
    console.log('Removing all reports from the database...');
    const deletedCount = await Report.destroy({
      where: {} // Empty where clause means "all records"
    });
    
    console.log(`Removed ${deletedCount} reports from the database.`);
    console.log('Database cleaned successfully!');
    console.log('No posts will appear in the Admin page until they are reported by users.');
    
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the clean function
cleanDatabase();