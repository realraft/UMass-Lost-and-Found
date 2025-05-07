import { EventHub } from "../../eventHub/EventHub.js"; 
import { Events } from "../../eventHub/Events.js";
import { BasePage } from "../BasePage/BasePage.js";

export class MessagingPage extends BasePage {
    #container = null;
    user = null;
    conversations = null
    currentConversation = null;

    constructor() {
        super();
        this.loadCSS("pages/MessagingPage", "MessagingPage");
        this.user = {id: 102};
    }

    render() {
        this.#createContainer();
        this.#renderFirstPage(this.user.id);
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

    #getTemplate() { //html template 
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
            const response = await fetch(`/api/conversation/user/${this.user.id}`);
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

    #addEventListeners() {
        const hub = EventHub.getEventHubInstance();
        const send_button = this.#container.querySelector("#send-message");
        const newMessage = this.#container.querySelector("#newMessage");

        if (send_button && newMessage) {
            const m = newMessage.value
            send_button.addEventListener('click', () => {
                if (m.length > 0) {
                    newMessage.value = "";
                    hub.publish(Events.NewUserMessage, m); //propagate new message text
                } else {
                    alert("Please enter a message.");
                }
            });
        }
    }

    async #renderFirstPage() { 
        this.conversations = await this.#getConversations(); //returns an empty array because of the error
        if (this.conversations.length > 0) {
            this.currentConversation = this.conversations.reduce((last, curr) =>
                curr.id > last.id ? curr : last
            );
            this.#renderConversation(this.currentConversation);
            await this.#renderSideBar();
        } else {
            console.log('No conversations to display');
        }
    }

    #renderConversation(conversation) { //renders conversation
        const message_content = this.#container.querySelector('.messages-content');
        if (!message_content) return;

        const messages = conversation.messages;

        this.#clearMessages_content();
        messages.forEach(messageObj => {
            this.#renderNewMessage(messageObj);
        });
    }    
    
    #addSubscriptions() {//adds subscriptions to the event hub
        const hub = EventHub.getEventHubInstance()
        hub.subscribe(Events.NewUserMessage, (message) => {
            this.#handleNewMessage(message) //subscribe sending message to server and rendering it
            })
    }

    async #renderSideBar() {
        const postsContainer = this.#container.querySelector(".posts-container");
        if (!postsContainer) return;
    
        for (const conversation of this.conversations) {
            const post = await this.#getPostById(conversation.post_id);
            this.#addPosttoSidebar(post, conversation);
        }
    }

    async #getPostById(id) { //get post by id
        try {
            const response = await fetch(`/api/posts/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result.data || null;
        } catch (error) {
            console.error('Error fetching post:', error);
            return null;
        }
    }

    #addPosttoSidebar(post, conversation) {
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
        postMessagesButton.id = `id: ${id}`; // conversation id

        postMessage.appendChild(postButton);
        postMessage.appendChild(postMessagesButton);
        postsContainer.appendChild(postMessage);

        postButton.addEventListener("click", () => {
            eventhub.publish(Events.ViewPost, post);
        });

        postMessagesButton.addEventListener("click", () => {
            this.#clearMessages_content();
            this.currentConversation = conversation
            this.#renderConversation(conversation);
        });
    }

    #handleNewMessage(newMessage) { //send to server and render
        this.#renderNewMessage({ text: newMessage, user_id: this.user.id });
        this.#sendMessagetoServer(newMessage)
    }

    #renderNewMessage(messageObj) {
        const message_content = this.#container.querySelector('.messages-content');
        if (!message_content) return;

        const messageDiv = document.createElement("div");
        messageDiv.className = String(this.user.id) === String(messageObj.user_id) ? "myMessage" : "otherMessage";
        const messageText = document.createElement("h3");
        messageText.textContent = messageObj.text;
        messageDiv.appendChild(messageText);
        message_content.appendChild(messageDiv);
        message_content.scrollTop = message_content.scrollHeight;
    }

    #clearMessages_content() {
        const message_content = this.#container.querySelector('.messages-content');
        if (message_content) message_content.innerHTML = '';
    }

    async #sendMessagetoServer(message) {
        try {
            const response = await fetch(`/conversation/message/${this.currentConversation.id}/${this.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: message })
            });
    
            if (!response.ok) {
                throw new Error("Error sending message to server: " + response.statusText);
            }
    
            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error sending message to server:", error);
            throw error;
        }
    }
}