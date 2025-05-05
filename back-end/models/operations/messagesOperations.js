import { Message, Conversation } from '../Messages.js';
import { User } from '../Users.js';

/**
 * Add a message to a conversation.
 * @param {string} id - conversation ID
 * @returns {Promise<Object>} message object
 */
const addMessage = async (id, message, user) => {
    try {
        const conversation = await Conversation.findOne({ where: { id } });
        if (!conversation) {
            throw new Error(`Conversation with ID ${id} not found`);
        }
        const newMessage = await Message.create({
            conversation_id: id,
            user_id: user.id,
            text: message
        });
        return newMessage;
    } catch (error) {
        throw new Error(`Error adding message: ${error.message}`);
    }
};

/**
 * Create a conversation.
 * @param {string} id - conversation ID
 * @returns {Promise<Object>} Conversation object
 */
const createConversationById = async (id) => {
    try {
        let conversation = await Conversation.findOne({ where: { id } });
        if (!conversation) {
            conversation = await Conversation.create({ id });
        }
        return conversation;
    } catch (error) {
        throw new Error(`Error creating the conversation ${id}: ${error.message}`);
    }
};

/**
 * Get a conversation.
 * @param {string} id - conversation ID
 * @returns {Promise<Object>} Conversation object
 */
const getConversationById = async (id) => {
    try {
        const conversation = await Conversation.findByPk(id, {
            include: [{
                model: Message,
                as: 'messages',
                include: [{
                    model: User,
                    as: 'user'
                }]
            }]
        })
        return conversation
    } catch (error) {
        throw new Error(`Error getting the conversation ${id}: ${error.message}`);
    }
};

export {
    addMessage,
    createConversationById,
    getConversationById,
}