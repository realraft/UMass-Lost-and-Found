import express from 'express';
import * as messagesController from '../controllers/messagesController.js';

const router = express.Router();
//create a conversation 
router.post("/ids/:postid/:user1id/:user2id", messagesController.createConversation);

//add a message
router.put("/message/:cid/:userid", messagesController.addMessageConversation);

//get all conversations for a user
router.get("/user/:userid", messagesController.getAllConversationsforUser);

export default router;