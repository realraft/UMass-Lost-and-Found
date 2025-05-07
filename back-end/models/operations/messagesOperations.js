import { Message, Conversation } from '../Messages.js';
import User from '../User.js';
import { Op } from 'sequelize';

/**
 * Add a message to a conversation.
 * @param {number} id - conversation ID
 * @param {number} userid - user ID
 * @param {string} message - message text
 * @returns {Promise<Object>} message object
 */
const addMessage = async (id, message, userid) => {
    try {
        const conversation = await Conversation.findOne({ where: { id } });
        if (!conversation) {
            throw new Error(`Conversation with ID ${id} not found`);
        }
        const newMessage = await Message.create({
            conversation_id: id,
            user_id: userid,
            text: message
        });
        return newMessage;
    } catch (error) {
        throw new Error(`Error adding message: ${error.message}`);
    }
};

/**
 * Create a conversation.
 * @param {number} postId - post ID
 * @param {number} user1Id - user1 ID
 * @param {number} user2Id - user2 ID
 * @returns {Promise<Object>} Conversation object
 */
const createConversationByIds = async (postId, user1Id, user2Id) => {
    try {
        let conversation = await Conversation.findOne({
            where: {
                post_id: postId,
                user1_id: user1Id,
                user2_id: user2Id
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
                }
            ]
        });

        if (!conversation) {
            conversation = await Conversation.create({
                post_id: postId,
                user1_id: user1Id,
                user2_id: user2Id
            });
            conversation = await Conversation.findOne({
                where: { id: conversation.id },
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
                    }
                ]
            });
        }
        return conversation;
    } catch (error) {
        throw new Error(`Error creating or finding conversation: ${error.message}`);
    }
};

/**
 * Get all conversations for a user.
 * @param {number} id - conversation ID
 * @returns {Promise<Object[]>} Conversation object[]
 */
const getAllConversationsforUserId = async (userId) => {
    try {
        console.log('Fetching conversations for userId:', userId);
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
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: User,
                    as: 'User2',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Message,
                    as: 'messages',
                    attributes: ['id', 'user_id', 'text', 'createdAt'],
                    include: [
                        {
                            model: User,
                            as: 'sender',
                            attributes: ['id', 'username', 'email']
                        }
                    ]
                }
            ],
            order: [
                ['updatedAt', 'DESC'],
                [{ model: Message, as: 'messages' }, 'createdAt', 'DESC']
            ]
        });
        return conversations;
    } catch (error) {
        console.error('Error in getAllConversationsforUserId:', error);
        throw new Error(`Error getting the conversation for user ${userId}: ${error.message}`);
    }
};
export {
    addMessage,
    createConversationByIds,
    getAllConversationsforUserId
}