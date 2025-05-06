import { EventHub } from "../../eventHub/EventHub.js"; 
import { Events } from "../../eventHub/Events.js";
import { BasePage } from "../BasePage/BasePage.js";

export class MessagingPage extends BasePage {
    #container = null;
    userId = null;
    conversations = null
    status = 0

    constructor() {
        super();
        this.loadCSS("pages/MessagingPage", "MessagingPage");
        this.userId = localStorage.getItem('userId') || '101';
    }

    render() { //renders the page -- needs to handle post or menu entrance 
        this.#createContainer();
        this.#renderFirstPage(this.userId);
        setTimeout(() => {
            this.#addEventListeners();
            this.#addSubscriptions();
        }, 100);
        return this.#container;
    }    
    
    #createContainer() { //creates html container
        this.#container = document.createElement("div");
        this.#container.className = "messaging-page";
        this.#container.innerHTML = this.#getTemplate();
    }

    #getTemplate() { //htm template 
        return `
            <div class="messaging-page-container">
                <div class="posts-container"></div>        
                <div class="message-container">
                    <div class="messages-content"></div>
                    <form id="messageForm">
                        <div>
                            <label for="newMessage">Message: </label>
                            <input id="newMessage" type="text" />
                            <input id="send-message" type="submit" value="=>" />
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async #getConversations() { //get conversations for current user
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found in localStorage');
                return [];
            }
            const response = await fetch(`/api/conversation/user/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return [];
        }
    }

    //other method, getting the current post 

    #addEventListeners() {
        const send_button = this.#container.querySelector("#send-message");
        const newMessage = this.#container.querySelector("#newMessage");

        if (send_button && newMessage) {
            send_button.addEventListener('click', (event) => {
                event.preventDefault();
                this.#handleNewMessage(newMessage);
            });
        }
    }

    async #renderFirstPage() { 
        this.conversations = await this.#getConversations();
        const conversation = this.conversations.filter()
        this.#renderConversation(conversation)
    }

    #renderConversation(conversation) { //renders conversation
        const message_content = this.#container.querySelector('.messages-content');
        if (!message_content) return;

        const messages = conversation.messages;

        this.#clearMessages_content();
        messages.forEach(message => {
            this.#publishNewMessage(message_content, { data: message });
        });
    }    
    
    #addSubscriptions() {//adds subscriptions to the event hub
    }

    #addPosttoSidebar(post, id, messages) {
        const eventhub = EventHub.getEventHubInstance();
        const postsContainer = this.#container.querySelector(".posts-container");

        const postMessage = document.createElement("div");
        postMessage.className = "post-messages";

        const postButton = document.createElement("button");
        postButton.className = "post";
        postButton.textContent = post.title;

        const postMessagesButton = document.createElement("button");
        postMessagesButton.className = "post-button";
        postMessagesButton.textContent = "Post Messages";
        postMessagesButton.id = `id: ${id}`;

        postMessage.appendChild(postButton);
        postMessage.appendChild(postMessagesButton);
        postsContainer.appendChild(postMessage);

        postButton.addEventListener("click", () => {
            eventhub.publish(Events.ViewPost, post);
        });

        postMessagesButton.addEventListener("click", () => {
            this.#container.querySelectorAll('.post-button').forEach(btn => btn.classList.remove('active'));
            postMessagesButton.classList.add('active');
            this.#clearMessages_content();
            this.#renderConversation(id, messages);
        });
    }

    #handleNewMessage(newMessage) {
        const message = newMessage.value.trim();
        if (!message) return alert("Please enter a message");

        const activePostButton = this.#container.querySelector('.post-button.active');
        if (!activePostButton) return alert("Please select a conversation first");

        const sendButton = this.#container.querySelector('#send-message');
        sendButton.disabled = true;
        sendButton.value = "Sending...";

        const conversationId = activePostButton.id.replace('id: ', '');
        const messageObj = { user: this.userId, text: message };

        const info = {
            id: conversationId,
            text: messageObj
        };

        EventHub.getEventHubInstance().publish(Events.NewUserMessage, info);
        newMessage.value = "";

        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.value = "=>";
        }, 500);
    }

    #publishNewMessage(info) {
        const message_content = this.#container.querySelector('.messages-content');
        if (!message_content) return;

        const messageDiv = document.createElement("div");
        messageDiv.className = String(this.userId) === String(info.message) ? "myMessage" : "otherMessage";
        const messageText = document.createElement("h3");
        messageText.textContent = info.data.text;
        messageDiv.appendChild(messageText);
        message_content.appendChild(messageDiv);
        message_content.scrollTop = message_content.scrollHeight;
    }

    #clearMessages_content() {
        const message_content = this.#container.querySelector('.messages-content');
        if (message_content) message_content.innerHTML = '';
    }

    async #sendMessagetoServer(info) {
        try {
            const token = localStorage.getItem('token');
            const sendResponse = await fetch(`/api/conversation/${info.id}/message`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: info.text.text })
            });

            if (!sendResponse.ok) {
                const errorData = await sendResponse.json();
                throw new Error(errorData.message || "Failed to add message to conversation");
            }

            const result = await sendResponse.json();
            return result.data;
        } catch (error) {
            console.error("Error sending message to server:", error);
            throw error;
        }
    }
}
