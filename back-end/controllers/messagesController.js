import * as MessagesModel from '../models/Messages/index.js';

export const getAllMessagesForPostandUsers = (req, res) => {
    try {
      const { id } = req.params
      const conversation = MessagesModel.getConversationById(id)
      if (!conversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" })
      }
      res.status(200).json({ success: true, data: conversation.messages })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
}

export const createConversation = (req, res) => {
    try {
      const { postId, user1, user2 } = req.body
      const newConversation = MessagesModel.createConversationById(postId, user1, user2)
      res.status(201).json({ success: true, data: newConversation })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
}

export const addMessagetoConversation = (req, res) => {
    try {
      const { id } = req.params
      const { user, text } = req.body
      const updatedConversation = MessagesModel.addMessage(id, { user, text })
      if (!updatedConversation) {
        return res.status(404).json({ success: false, message: "Conversation not found" })
      }
      res.status(200).json({ success: true, data: updatedConversation })
    } catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
}