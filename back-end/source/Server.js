import express from "express";
import userRoutes from "../routes/userRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import postRoutes from "../routes/postRoutes.js";
import messagesRoutes from "../routes/messagesRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection, syncDatabase } from "../models/index.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "../../front-end")));
app.use(express.static(path.join(__dirname, "../../front-end/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set basic headers manually instead of using CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Initialize database connection
(async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models with the database
    await syncDatabase();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/conversations", messagesRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});