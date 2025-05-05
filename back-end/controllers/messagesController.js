import MessagesOps from "../models/operations/messagesOperations.js";

export const getConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await MessagesOps.getConversationById(id);
        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }
        res.status(200).json({ success: true, conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const createConversation = async (req, res) => {
    try {
        const { postId, user2 } = req.body;
        const user1 = req.user.id;
        if (!postId || !user2) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: postId or user2" 
            });
        }
        const [firstUser, secondUser] = [user1, user2].sort((a, b) => a - b);
        const cId = `${String(postId)}-${String(firstUser)}-${String(secondUser)}`;
        const conversation = await MessagesOps.getConversationById(cId);
        if (conversation) {
            return res.status(200).json({ success: true, conversation });
        } else {
            const newConversation = await MessagesOps.createConversationById(cId);
            return res.status(201).json({ success: true, newConversation });        
        }
    } catch (error) {
        console.error('Error in createConversation:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const addMessageConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required field: text" 
            });
        }
        const newMessage = await MessagesOps.addMessage(id, { text }, user);

        if (!newMessage) {
            return res.status(404).json({ success: false, message: "Conversation not found or message not added" });
        }

        res.status(200).json({ success: true, data: newMessage });
    } catch (error) {
        console.error('Error adding message to conversation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};