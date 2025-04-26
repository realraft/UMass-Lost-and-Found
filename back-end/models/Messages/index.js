import { Message, Conversation } from "./Messages.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const messagesFilePath = path.join(__dirname, '../../data/postsMessages.json');

if (!fs.existsSync(messagesFilePath)) {
    fs.writeFileSync(messagesFilePath, JSON.stringify([]), 'utf8');
}

let postsMessages = [];

try {
    const data = fs.readFileSync(messagesFilePath, 'utf8');
    postsMessages = JSON.parse(data);
    // Convert existing conversations to ensure proper format
    postsMessages = postsMessages.map(conv => new Conversation(conv));
} catch (error) {
    console.error('Error loading messages data:', error);
    postsMessages = [];
}

const saveData = () => {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(postsMessages, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving messages data:', error);
    }
};

const getAllPostsMessages = () => postsMessages;

const addMessage = (id, message) => {
    const conversation = postsMessages.find(p => String(p.id) === String(id));
    if (conversation) {
        const newMessage = new Message({
            user: String(message.user),
            text: message.text
        });
        conversation.messages.push(newMessage);
        saveData();
        return conversation;
    }
    return null;
};

const createConversationById = (conversationId) => {
    const existingConversation = postsMessages.find(p => String(p.id) === String(conversationId));
    if (existingConversation) {
        return existingConversation;
    }
    
    const newConversation = new Conversation({
        id: String(conversationId),
        messages: []
    });
    postsMessages.push(newConversation);
    saveData();
    return newConversation;
};

const getConversationById = (id) => {
    return postsMessages.find(p => String(p.id) === String(id)) || null;
};

export {
    addMessage,
    createConversationById,
    getConversationById,
    getAllPostsMessages
};