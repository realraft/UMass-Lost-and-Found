import { Message, Conversation } from '../Messages.js';
import User from '../User.js';

/**
 * Add a message to a conversation.
 * @param {string} id - conversation ID
 * @param {User} user - user object
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
            user_id: user,
            text: message
        });
        return newMessage;
    } catch (error) {
        throw new Error(`Error adding message: ${error.message}`);
    }
};

/**
 * Create a conversation.
 * @param {string} postId - post ID
 * @param {string} user1Id - user1 ID
 * @param {string} user2Id - user2 ID
 * @returns {Promise<Object>} Conversation object
 */
const createConversationByIds = async (postId, user1Id, user2Id) => {
    try {
        let conversation = await Conversation.findOne({
            where: {
                post_id: postId,
                user1_id: user1Id,
                user2_id: user2Id
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                post_id: postId,
                user1_id: user1Id,
                user2_id: user2Id
            });
        }
        return conversation;
    } catch (error) {
        throw new Error(`Error creating or finding conversation: ${error.message}`);
    }
};

/**
 * Get all conversations for a user.
 * @param {string} id - conversation ID
 * @returns {Promise<Object[]>} Conversation object[]
 */
const getAllConversationsforUserId = async (userId) => {
    try {
        const conversations = await Conversation.findAll({
            where: {
                [Op.or]: [
                    { user1_id: userId },
                    { user2_id: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'User1',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'User2',
                    attributes: ['id', 'name']
                },
                {
                    model: Message,
                    attributes: ['id', 'user_id', 'text', 'createdAt'],
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
        return conversations;
    } catch (error) {
        throw new Error(`Error getting the conversation for user ${userId}: ${error.message}`);
    }
};

export {
    addMessage,
    createConversationByIds,
    getAllConversationsforUserId
}