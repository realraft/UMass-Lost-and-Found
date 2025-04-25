import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// Get all reported posts
router.get("/reports", adminController.getReportedPosts);

// Create a new report
router.post("/reports", adminController.createReport);

// Get a specific reported post
router.get("/reports/:id", adminController.getReportedPostById);

// Keep a reported post (remove from reported list)
router.put("/reports/:id/keep", adminController.keepPost);

// Delete a reported post
router.delete("/reports/:id", adminController.deletePost);

// Admin comments routes
router.post("/comments/:id", adminController.addComment);
router.get("/comments/:id", adminController.getComments);
router.put("/comments/:postId/:commentId", adminController.editComment);

export default router;