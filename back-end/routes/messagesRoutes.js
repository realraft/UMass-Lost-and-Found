import express from 'express';
import * as messagesController from '../controllers/messagesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

//get conversation messages
router.get("/conversation/:id", authenticate, messagesController.getConversation);

//create a conversation 
router.post("/conversation", authenticate, messagesController.createConversation);

//add a message
router.put("/conversation/:id/message", authenticate, messagesController.addMessageConversation);

export default router;