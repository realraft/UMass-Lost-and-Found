import * as MessagesOps from "../models/operations/messagesOperations.js";

export const createConversation = async (req, res) => {
    try {
        const { postid, user1id, user2id } = req.params;
        const postId = parseInt(postid, 10);
        const user1Id = parseInt(user1id, 10);
        const user2Id = parseInt(user2id, 10);
        if (isNaN(postId) || isNaN(user1Id) || isNaN(user2Id)) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid fields: postid, user1id, or user2id"
            });
        }
        const [firstUser, secondUser] = [user1Id, user2Id].sort((a, b) => a - b);
        const conversation = await MessagesOps.createConversationByIds(postId, firstUser, secondUser);
        return res.status(conversation.createdAt === conversation.updatedAt ? 201 : 200).json({ //may already exist 
            success: true,
            conversation
        });
    } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const addMessageConversation = async (req, res) => {
    try {
        const id = parseInt(req.params.cid, 10);
        const user = parseInt(req.params.userid, 10);
        const { text } = req.body;
        if (isNaN(id) || isNaN(user)) {
            return res.status(400).json({ success: false, message: 'Invalid parameters.' });
        }
        if (!text) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required field: text" 
            });
        }
        const newMessage = await MessagesOps.addMessage(id, text, user);

        if (!newMessage) {
            return res.status(404).json({ success: false, message: "Conversation not found or message not added" });
        }

        res.status(200).json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Error adding message to conversation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllConversationsforUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.userid, 10);
        console.log('UserId received:', req.params.userid);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID.' });
        }
        
        let conversations;
        try {
            conversations = await MessagesOps.getAllConversationsforUserId(userId);
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ 
                success: false, 
                message: 'Database error while fetching conversations' 
            });
        }
        if (!conversations) {
            return res.status(404).json({ 
                success: false, 
                message: 'No conversations found for this user.' 
            });
        }
        return res.status(200).json({ 
            success: true, 
            data: conversations 
        });
    } catch (error) {
        console.error('Error getting all conversations:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};