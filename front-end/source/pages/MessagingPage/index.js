import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";
import { MessagingService } from "../../services/MessagingService.js";
import { BasePage } from "../BasePage/BasePage.js";
import { PostedItemPage } from "../PostedItemPage/index.js";

export class MessagingPage extends BasePage {

    #container = null
    messagingService = null
    userId = -1

    constructor(id) {
        super()
        this.loadCSS("pages/MessagingPage", "MessagingPage")
        this.messagingService = new MessagingService()
        this.userId = id
    }

    #getTemplate() {
        return `
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
    }

    async #getPostsMessages() { //from server
        try {
          const response = await fetch('/front-end/source/Fake-Server/server.json')
          const result = await response.json();
          return result.postsMessages
        } catch (error) {
            console.error('Error fetching posts messages:', error);
        }
    }

    async #getPosts() { //from server
        try {
          const response = await fetch('/front-end/source/Fake-Server/server.json')
          const result = await response.json();
          return result.posts
        } catch (error) {
            console.error('Error fetching posts messages:', error);
        }
    }

    #addEventListeners() {
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
        this.#container = document.createElement("div")
        this.#container.className = "messaging-page"
        this.#container.innerHTML = this.#getTemplate()
    }

    render() {
        this.#createContainer()
        this.#renderFirstMessagePage()
        setTimeout(() => {
            this.#addEventListeners()
            this.#addSubscriptions()
        }, 100)
        return this.#container
    }

    async #renderFirstMessagePage() {
        const postsMessages = await this.#getPostsMessages() //messages 
        const posts = await this.#getPosts() // posts
        const userPostMessages = postsMessages.filter(p => {
                const idarr = p.id.split("-")
                return idarr[1] === String(this.userId)
            })
        if (userPostMessages.length > 0) {
            userPostMessages.forEach(pM => {
                const pid = parseInt(pM.id.split("-")[0])
                const post = posts.find(p => p.id === pid)
                if (post) {
                    this.#addPosttoSidebar(post, pM.id, pM.messages)
                }
            })

            // Set first conversation as active
            const firstPostButton = this.#container.querySelector('.post-button')
            if (firstPostButton) {
                firstPostButton.classList.add('active')
                const firstPostId = firstPostButton.id.replace('id: ', '')
                const firstPostMessages = userPostMessages.find(p => p.id === firstPostId)
                if (firstPostMessages) {
                    this.#renderConversation(firstPostId, firstPostMessages.messages)
                }
            }
        }
    }

    #addPosttoSidebar(post, id, messages) {
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

    #handleNewMessage(newMessage) {
        const message = newMessage.value.trim()
        if (message.length === 0) {
            alert("Please enter a message")
            return
        }
        const activePostButton = this.#container.querySelector('.post-button.active')
        if (!activePostButton) {
            alert("Please select a conversation first")
            return
        }

        const conversationId = activePostButton.id.replace('id: ', '')
        const messageObj = { user: this.userId, text: message }
        const info = {
            id: conversationId,
            text: messageObj
        }

        const eventhub = EventHub.getEventHubInstance()
        eventhub.publish(Events.NewUserMessage, info)
        
                newMessage.value = ""
    }

    #publishNewMessage(info) {
        const message_content = this.#container.querySelector('.messages-content')
        if (!message_content) return;
        
        const messageDiv = document.createElement("div")
        messageDiv.className = this.userId === info.data.user ? "myMessage" : "otherMessage"
        const messageText = document.createElement("h3")
        messageText.textContent = info.data.text
        messageDiv.appendChild(messageText)
        message_content.appendChild(messageDiv)
        message_content.scrollTop = message_content.scrollHeight
    }

    #clearMessages_content() {
        const message_content = this.#container.querySelector('.messages-content')
        if (message_content) {
            message_content.innerHTML = ''
        }
    }

    async #sendMessagetoServer(info) { //to indexeddb for now
        try {
            const postsMessages = await this.#getPostsMessages()
            let conversation = postsMessages.find(p => p.id === info.id)
            if (!conversation) {
                const newConversation = {
                    id: info.id,
                    messages: [{ user: this.userId, text: info.text }]
                }

                //---will be implemented in backend, can't write to the fake server ---
                //const response = await fetch('http://localhost:3000/postsMessages', {
                //    method: 'POST',
                //    headers: {
                //        'Content-Type': 'application/json'
                //    },
                //    body: JSON.stringify(newConversation)
                //})
                //if (!response.ok) {
                //    throw new Error("Failed to create new conversation")
                //}

            } else {
                conversation.messages.push({ user: this.userId, text: info.text })

                //const response = await fetch(`http://localhost:3000/postsMessages/${conversation.id}`, {
                //    method: 'PUT',
                //    headers: {
                //        'Content-Type': 'application/json'
                //    },
                //    body: JSON.stringify(conversation)
                //})
                //if (!response.ok) {
                //    throw new Error("Failed to update conversation")
                //}

            }
        } catch (error) {
            console.error("Error sending message to server", error)
            throw error
        }
        this.messagingService.storeMessage(info) //to indexeddb
    }

    #addSubscriptions() {
        const eventHub = EventHub.getEventHubInstance()
        eventHub.subscribe(Events.NewUserMessage, async info => {
            await this.#sendMessagetoServer(info)
            this.#publishNewMessage({id: info.id, data: info.text})
        })
    }

    #renderConversation(cid, messages) { //message array
        messages.forEach((mobj) => { //message format: {user: 1, text: "message"}}
            this.#publishNewMessage({id: cid, data: mobj})
        })
    }
}