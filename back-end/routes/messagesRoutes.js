import express from 'express';
import * as messagesController from '../controllers/messagesController.js';

const router = express.Router();

// Get all conversations
router.get("/conversation", messagesController.getAllConversations);

//get conversation messages
router.get("/conversation/:id", messagesController.getAllMessagesForPostandUsers);

//create a conversation 
router.post("/conversation", messagesController.createConversation);

//add a message
router.put("/conversation/:id/message", messagesController.addMessagetoConversation);

export default router;