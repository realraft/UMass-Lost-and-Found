import express from "express";

const router = express.Router();

// Mock database (replace with actual database logic)
let posts = [
  { id: "1", title: "Lost Wallet", description: "Black leather wallet", location: "Library", tags: ["wallet", "black"], date: "2023-04-01" },
  { id: "2", title: "Lost Keys", description: "Set of house keys", location: "Cafeteria", tags: ["keys"], date: "2023-04-02" },
];
let messages = [];

// CRUD Routes for Posts

// Read all posts
router.get("/posts", (req, res) => {
  res.status(200).json(posts);
});

// Read a single post by ID
router.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.status(200).json(post);
});

// Delete a post by ID
router.delete("/posts/:id", (req, res) => {
  const postIndex = posts.findIndex((p) => p.id === req.params.id);
  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }
  posts.splice(postIndex, 1);
  res.status(200).json({ message: "Post deleted successfully" });
});

// CRUD Routes for Messages

// Read all messages for a specific post
router.get("/messages/:postId", (req, res) => {
  const postMessages = messages.filter((msg) => msg.postId === req.params.postId);
  res.status(200).json(postMessages);
});

// Create a new message for a post
router.post("/messages", (req, res) => {
  const { postId, content, sender } = req.body;
  if (!postId || !content || !sender) {
    return res.status(400).json({ message: "Post ID, content, and sender are required." });
  }
  const newMessage = {
    id: messages.length + 1,
    postId,
    content,
    sender,
    date: new Date().toISOString(),
  };
  messages.push(newMessage);
  res.status(201).json({ message: "Message created successfully", messageData: newMessage });
});

// Delete a message by ID
router.delete("/messages/:id", (req, res) => {
  const messageIndex = messages.findIndex((msg) => msg.id === parseInt(req.params.id));
  if (messageIndex === -1) {
    return res.status(404).json({ message: "Message not found" });
  }
  messages.splice(messageIndex, 1);
  res.status(200).json({ message: "Message deleted successfully" });
});

export default router;