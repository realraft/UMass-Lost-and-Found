import { Message, Conversation } from "./Messages.js"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const messagesFilePath = path.join(__dirname, '../data/postsMessages.json')

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(messagesFilePath)) {
  fs.writeFileSync(messagesFilePath, JSON.stringify([]), 'utf8');
}

let postsMessages = []

try {
  postsMessages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'))
} catch (error) {
  console.error('Error loading data:', error);
}

const saveData = () => {
  try {
    fs.writeFileSync(messagesFilePath, JSON.stringify(postsMessages, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

const getAllPostsMessages = () => postsMessages

const addMessage = (id, message) => {
    const conversation = postsMessages.find(p => p.id === id)
    if (conversation) {
        conversation.messages.push(message)
    } else {
        postsMessages.push(new Message(id, message))
    }
    saveData()
}

const createConversationById = (postId, user1, user2) => {
    const conversation = postsMessages.find(p => p.id === postId)
    if (conversation) {
        return conversation
    } else {
        const newConversation = new Conversation(`${postId}-${user1}-${user2}`, [])
        postsMessages.push(newConversation)
        saveData()
        return newConversation
    }
}

const getConversationById = (id) => {
    const conversation = postsMessages.find(p => p.id === id)
    if (conversation) {
        return conversation
    } else {
        return null
    }
}


export {
    addMessage,
    createConversationById,
    getConversationById,
    getAllPostsMessages
}