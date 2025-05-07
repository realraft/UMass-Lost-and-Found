import * as MessagesOps from "../models/operations/messagesOperations.js";

export const createConversation = async (req, res) => {
    try {
        const [postidStr, user1idStr, user2idStr] = req.params.conversationId.split('-');
        const postId = parseInt(postidStr, 10);
        const user1id = parseInt(user1idStr, 10);
        const user2id = parseInt(user2idStr, 10);
        if (isNaN(postId) || isNaN(user1id) || isNaN(user2id)) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid fields: postid, user1id, or user2id"
            });
        }
        const [firstUser, secondUser] = [user1id, user2id].sort((a, b) => a - b);
        const conversation = await MessagesOps.getAllConversationsforUserId(user1id).filter(c => c.post_id === postId && c.user1_id === firstUser && c.user2_id === secondUser)[0];
        if (conversation) {
            return res.status(200).json({ success: true, conversation });
        } else {
            const newConversation = await MessagesOps.createConversationByIds(postId, firstUser, secondUser);
            return res.status(201).json({ success: true, newConversation });        
        }
    } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const addMessageConversation = async (req, res) => {
    try {
        const id = parseInt(req.params.cid, 10);
        const user = parseInt(req.params.userid, 10);
        const { text } = req.body;
        if (isNaN(id) || isNaN(user)) {
            return res.status(400).json({ success: false, message: 'Invalid parameters.' });
        }
        if (!textObj) {
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