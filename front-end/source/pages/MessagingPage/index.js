import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";
import { BasePage } from "../BasePage/BasePage.js";

export class MessagingPage extends BasePage {
    #container = null;
    userId = null;

    constructor() {
        super();
        this.loadCSS("pages/MessagingPage", "MessagingPage");
        this.userId = localStorage.getItem('userId') || '101';
    }

    #getTemplate() {
        return `
            <div class="messaging-page-container">
                <div class="posts-container">
                </div>        
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

    async #getPostsMessages() { //from server
        try {
            console.log('Fetching conversations...');
            const response = await fetch('http://localhost:3000/api/conversations/conversation')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            console.log('Fetched conversations:', result.data);
            return result.data || []  // Return empty array if no data
        } catch (error) {
            console.error('Error fetching conversations:', error)
            return []  // Return empty array on error
        }
    }

    async #getPosts() {
        try {
            console.log('Fetching posts...');
            const response = await fetch('http://localhost:3000/api/posts')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const result = await response.json()
            console.log('Fetched posts:', result.data);
            return result.data || []  // Return empty array if no data
        } catch (error) {
            console.error('Error fetching posts:', error)
            return []  // Return empty array on error
        }
    }

    #addEventListeners() { //add actions to buttons 
        const send_button = this.#container.querySelector("#send-message")
        const newMessage = this.#container.querySelector("#newMessage")

        if (send_button && newMessage) {
            send_button.addEventListener('click', (event) => {
                event.preventDefault()
                this.#handleNewMessage(newMessage)
            })
        }
    }

    #createContainer() {
        this.#container = document.createElement("div");
        this.#container.className = "messaging-page";
        
        // Create the inner structure
        const template = `
            <div class="posts-container">
            </div>        
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
        `;
        
        this.#container.innerHTML = template;
        console.log('Container created with template');
    }

    async render() {
        console.log('Rendering MessagingPage, userId:', this.userId);
        if (this.#container) {
            console.log('Container exists, returning existing');
            return this.#container;
        }
        
        this.#createContainer();
        console.log('Created container');
        
        // Ensure container is properly created before continuing
        if (!this.#container) {
            console.error('Failed to create container');
            return document.createElement('div');
        }

        try {
            await this.#renderFirstMessagePage();
            this.#addEventListeners();
            this.#addSubscriptions();
            console.log('MessagingPage render complete');
        } catch (error) {
            console.error('Error during MessagingPage render:', error);
            this.#container.innerHTML = '<div class="error-message">Failed to load messaging page. Please try again.</div>';
        }

        return this.#container;
    }

    async #renderFirstMessagePage() { //render first conversation
        try {
            const [postsMessages, posts] = await Promise.all([
                this.#getPostsMessages(),
                this.#getPosts()
            ]);

            if (!Array.isArray(postsMessages)) {
                throw new Error('Invalid conversations data received');
            }

            // Filter conversations where current user is either user1 or user2
            const userPostMessages = postsMessages.filter(p => {
                try {
                    const [, user1, user2] = p.id.split("-");
                    return String(user1) === String(this.userId) || String(user2) === String(this.userId);
                } catch (err) {
                    console.error('Invalid conversation ID format:', p.id);
                    return false;
                }
            });

            const postsContainer = this.#container.querySelector(".posts-container");
            const messageContainer = this.#container.querySelector('.message-container');

            if (!postsContainer || !messageContainer) {
                throw new Error('Required containers not found');
            }

            // Clear existing content
            postsContainer.innerHTML = '';
            messageContainer.querySelector('.messages-content').innerHTML = '';

            if (userPostMessages.length > 0) {
                // Map conversations to rendering promises
                const renderedConversations = userPostMessages.map(async (pM) => {
                    try {
                        const [postId] = pM.id.split("-");
                        const post = posts.find(p => String(p.id) === String(postId));
                        if (post) {
                            this.#addPosttoSidebar(post, pM.id, pM.messages || []);
                        }
                    } catch (err) {
                        console.error('Error rendering conversation:', err);
                    }
                });

                await Promise.all(renderedConversations);

                // Handle active conversation if one is set
                const activeConversationId = localStorage.getItem('activeConversationId');
                if (activeConversationId) {
                    const activeButton = this.#container.querySelector(`button[id="id: ${activeConversationId}"]`);
                    if (activeButton) {
                        activeButton.classList.add('active');
                        const conversation = userPostMessages.find(p => p.id === activeConversationId);
                        if (conversation) {
                            this.#clearMessages_content();
                            this.#renderConversation(activeConversationId, conversation.messages || []);
                        }
                        localStorage.removeItem('activeConversationId');
                        return;
                    }
                }

                // Show first conversation if no active one
                const firstPostButton = this.#container.querySelector('.post-button');
                if (firstPostButton) {
                    firstPostButton.classList.add('active');
                    const firstPostId = firstPostButton.id.replace('id: ', '');
                    const firstPostMessages = userPostMessages.find(p => p.id === firstPostId);
                    if (firstPostMessages) {
                        this.#renderConversation(firstPostId, firstPostMessages.messages || []);
                    }
                }
            } else {
                messageContainer.innerHTML = '<div class="no-messages">No conversations yet</div>';
            }
        } catch (error) {
            console.error('Error rendering messages:', error);
            const messageContainer = this.#container.querySelector('.message-container');
            if (messageContainer) {
                messageContainer.innerHTML = '<div class="error-message">Failed to load messages. Please try again later.</div>';
            }
        }
    }

    #addPosttoSidebar(post, id, messages) { //add post to sidebar
        const eventhub = EventHub.getEventHubInstance()
        const postsContainer = this.#container.querySelector(".posts-container")

        const postMessage = document.createElement("div")
        postMessage.className = "post-messages"

        const postButton = document.createElement("button")
        postButton.className = "post"
        postButton.textContent = post.title

        const postMessagesButton = document.createElement("button")
        postMessagesButton.className = "post-button"
        postMessagesButton.textContent = "Post Messages"
        postMessagesButton.id = `id: ${id}`

        postMessage.appendChild(postButton)
        postMessage.appendChild(postMessagesButton)
        postsContainer.appendChild(postMessage)

        postButton.addEventListener("click", () => {
            eventhub.publish(Events.ViewPost, post)
        })

        postMessagesButton.addEventListener("click", () => {
            this.#container.querySelectorAll('.post-button').forEach(btn => {
                btn.classList.remove('active')
            })
            postMessagesButton.classList.add('active')
            this.#clearMessages_content()
            this.#renderConversation(id, messages)
        })
    }

    #handleNewMessage(newMessage) { //handle the new message
        const message = newMessage.value.trim();
        if (message.length === 0) {
            alert("Please enter a message");
            return;
        }
        const activePostButton = this.#container.querySelector('.post-button.active');
        if (!activePostButton) {
            alert("Please select a conversation first");
            return;
        }

        const sendButton = this.#container.querySelector('#send-message');
        sendButton.disabled = true;
        sendButton.value = "Sending...";

        const conversationId = activePostButton.id.replace('id: ', '');
        const messageObj = { user: this.userId, text: message };
        const info = {
            id: conversationId,
            text: messageObj
        };

        const eventhub = EventHub.getEventHubInstance();
        eventhub.publish(Events.NewUserMessage, info);
        newMessage.value = "";
        
        // Re-enable the send button after a short delay
        setTimeout(() => {
            sendButton.disabled = false;
            sendButton.value = "=>";
        }, 500);
    }

    #publishNewMessage(info) {
        const message_content = this.#container.querySelector('.messages-content');
        if (!message_content) return;
        
        const messageDiv = document.createElement("div");
        // Convert both userIds to strings for comparison
        messageDiv.className = String(this.userId) === String(info.data.user) ? "myMessage" : "otherMessage";
        const messageText = document.createElement("h3");
        messageText.textContent = info.data.text;
        messageDiv.appendChild(messageText);
        message_content.appendChild(messageDiv);
        message_content.scrollTop = message_content.scrollHeight;
    }

    #clearMessages_content() {
        const message_content = this.#container.querySelector('.messages-content')
        if (message_content) {
            message_content.innerHTML = ''
        }
    }

    async #sendMessagetoServer(info) {
        try {
            console.log('Sending message:', info);
            const messageData = {
                user: this.userId,
                text: info.text.text
            };
            
            console.log('Message data:', messageData);
            const sendResponse = await fetch(`http://localhost:3000/api/conversations/conversation/${info.id}/message`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });
            
            if (!sendResponse.ok) {
                const errorData = await sendResponse.json();
                throw new Error(errorData.message || "Failed to add message to conversation");
            }
            
            const result = await sendResponse.json();
            console.log('Message sent successfully:', result);
            return result.data;
        } catch (error) {
            console.error("Error sending message to server:", error);
            throw error;
        }
    }

    #addSubscriptions() { 
        const eventHub = EventHub.getEventHubInstance();
        eventHub.subscribe(Events.NewUserMessage, async info => {
            try {
                const updatedConversation = await this.#sendMessagetoServer(info);
                this.#publishNewMessage({id: info.id, data: info.text});
            } catch (error) {
                alert('Failed to send message. Please try again.');
            }
        });
    }

    #renderConversation(cid, messages) { //message array
        messages.forEach((mobj) => { //message format: {user: 1, text: "message"}}
            this.#publishNewMessage({id: cid, data: mobj})
        })
    }
}