import express from 'express';
import * as messagesController from '../controllers/messageController.js';

const router = express.Router();

//get conversation
router.get("/conversation/:id", messagesController.getAllMessagesForPostandUsers)

//get a single message
router.get("/message/:id", messagesController.getSingleMessage)

//create a conversation 
router.post("/conversation", messagesController.createConversation)

//add a message
router.put("/conversation/:id/message", messagesController.addMessage)

export default router;