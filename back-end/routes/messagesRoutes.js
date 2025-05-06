import express from 'express';
import * as messagesController from '../controllers/messagesController.js';

const router = express.Router();

//create a conversation 
router.post("/conversation/ids/:postId/:user1Id/:user2Id", messagesController.createConversation);

//add a message
router.put("/conversation/message/:cid/:userid", messagesController.addMessageConversation);

//get all conversations for a user
router.get("/conversation/user/:userId", messagesController.getAllConversationsforUser);

export default router;