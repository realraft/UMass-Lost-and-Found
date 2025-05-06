import * as MessagesOps from "../models/operations/messagesOperations.js";

export const createConversation = async (req, res) => {
    try {
        const { postId, user1id, user2id } = req.params;
        if (!postId || !user2id || !user1id) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: postId or user1id or user2id" 
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
        const { id, user } = req.params;
        const { text } = req.body;

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
        const { userId } = req.params;
        const conversations = await MessagesOps.getAllConversationsforUserId(userId);
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ success: false, message: 'No conversations found.' });
        }

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error getting all conversations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}