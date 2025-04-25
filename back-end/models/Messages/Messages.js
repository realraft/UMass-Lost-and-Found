class Message {
    constructor({ user, text }) {
      this.user = user
      this.text = text
      this.createdAt = new Date()
    }
}
  
class Conversation {
    constructor({ id, messages = [] }) {
      this.id = id
      this.messages = messages
    }
  
    addMessage(user, text) {
      const newMessage = new Message({ user, text })
      this.messages.push(newMessage)
    }
  }
  
export { Message, Conversation }