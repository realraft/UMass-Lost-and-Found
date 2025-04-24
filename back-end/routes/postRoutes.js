import express from "express";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// Route to get all posts
router.get("/", postController.getAllPosts);

// Route to get a post by ID
router.get("/:id", postController.getPostById);

// Route to get posts by user ID - for the post manager page
router.get("/user/:userId", postController.getPostsByUserId);

// Route to create a new post
router.post("/", postController.createPost);

// Route to update an existing post
router.put("/:id", postController.updatePost);

// Route to delete a post
router.delete("/:id", postController.deletePost);

export default router;