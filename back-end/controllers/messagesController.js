import * as MessagesModel from '../models/Messages/index.js';

export const getAllConversations = (req, res) => {
    try {
        const conversations = MessagesModel.getAllPostsMessages();
        if (!Array.isArray(conversations)) {
            throw new Error('Invalid conversations data');
        }
        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllMessagesForPostandUsers = (req, res) => {
    try {
        const { id } = req.params;
        const conversation = MessagesModel.getConversationById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }
        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const createConversation = (req, res) => {
    try {
        const { postId, user1, user2 } = req.body;

        if (!postId || !user1 || !user2) {
            //console.error('Missing required fields:', { postId, user1, user2 });
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: postId, user1, or user2" 
            });
        }

        // Ensure consistent string format for IDs
        const conversationId = `${String(postId)}-${String(user1)}-${String(user2)}`;
        
        // Check if conversation already exists
        const existingConversation = MessagesModel.getConversationById(conversationId);
        if (existingConversation) {
            return res.status(200).json({ success: true, data: existingConversation });
        }
        
        // Create new conversation
        const newConversation = MessagesModel.createConversationById(conversationId);
        return res.status(201).json({ success: true, data: newConversation });
    } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const addMessagetoConversation = (req, res) => {
    try {
        const { id } = req.params;
        const { user, text } = req.body;
        
        if (!user || !text) {
            console.error('Missing message fields:', { user, text });
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: user or text" 
            });
        }

        // Convert user ID to string for consistency
        const messageData = {
            user: String(user),
            text: text
        };

        const updatedConversation = MessagesModel.addMessage(id, messageData);
        
        if (!updatedConversation) {
            console.error('Conversation not found:', id);
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }
        
        res.status(200).json({ success: true, data: updatedConversation });
    } catch (error) {
        console.error('Error in addMessagetoConversation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}