import express from 'express';
import * as messagesController from '../controllers/messagesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

//create a conversation 
router.post("/conversation/ids/:postId/:user1Id/:user2Id", authenticate, messagesController.createConversation);

//add a message
router.put("/conversation/:id/message", authenticate, messagesController.addMessageConversation);

//get all conversations for a user
router.get("/conversation/user/:userId", authenticate, messagesController.getAllConversationsforUser);

export default router;