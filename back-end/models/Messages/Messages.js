class Message {
    constructor({ user, text }) {
      this.user = String(user);
      this.text = text;
      this.createdAt = new Date();
    }
}
  
class Conversation {
    constructor({ id, messages = [] }) {
      this.id = String(id);
      this.messages = messages.map(msg => new Message(msg));
    }
  
    addMessage(user, text) {
      const newMessage = new Message({ user, text });
      this.messages.push(newMessage);
      return newMessage;
    }
}
  
export { Message, Conversation }