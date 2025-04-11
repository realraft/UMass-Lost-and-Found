import { EventHub } from "../../eventHub/EventHub";
import { Events } from "../../eventHub/Events";
import { MessagingService } from "../../services/MessagingService";
import { BasePage } from "../BasePage/BasePage";
import { PostedItemPage } from "../PostedItemPage/PostedItemPage";

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
        <div class="container">
            <div class="posts-container">
                <div class="post-messages">
                    <button class="post">Post 1</button>
                    <button class="post-button">Post Messages</button>
                </div>
                <div class="post-messages">
                    <button class="post">Post 2</button>
                    <button class="post-button">Post Messages</button>
                </div>
            </div>        
            <div class="message-container">
                <div class="messages-content"></div>
                <form id="messageForm">
                    <div>
                        <label for="newMessage">Message: </label>
                        <input id="newMessage" type="text" />
                        <input id="send" type="submit" value="=>" />
                    </div>
                </form>
            </div>
        </div>
        `;
    }

    async #getPostsMessages() { //from server
        try {
          const response = await fetch('http://localhost:3000/postsMessages')
          const postsMessages = await response.json();
          return postsMessages
        } catch (error) {
            console.error('Error fetching posts messages:', error);
        }
    }

    async #getPosts() { //from server
        try {
          const response = await fetch('http://localhost:3000/posts')
          const posts = await response.json();
          return posts
        } catch (error) {
            console.error('Error fetching posts messages:', error);
        }
    }

    #addEventListeners() {
        const send_button = document.querySelector("send")
        const newMessage = document.querySelector("newMessage")

        send_button.addEventListener('click', () => {
            this.#handleNewMessage(newMessage)
        })
    }

    #createContainer() {
        this.#container = document.createElement("div")
        this.#container.className = "messaging-page"
        this.#container.innerHTML = this.#getTemplate()
    }

    render() { //always with the first post saved if it exists
        this.#createContainer()
        this.#addEventListeners()
        this.#addSubscriptions()
        this.#renderFirstMessagePage()
        return this.#container
    }

    async #renderFirstMessagePage() {
        const postsMessages = await this.#getPostsMessages() //messages 
        const posts = await this.#getPosts() // posts
        const userPostMessages = postsMessages.filter(p => {
                const idarr = p.id.split("-")
                return idarr[1] === this.userId
            })
        if (userPostMessages.length > 0) {
            userPostMessages.forEach(pM => {
                const pid = pM.id.split("-")[0]
                const post = posts.find(p => p.id === pid)
                this.#addPosttoSidebar(p, pM.id, pM.messages)
            })

            let created = false
            let i = 0
            while (!created) {
                if (i > posts.length - 1) {break}
                const post = posts[i]
                const postM = postsMessages.find(p => p.id === `${post.id}-${1}-${post.user_id}`)
                if (postM) { //conversation exists for this post 
                    this.#renderConversation(postM.id, postM.messages)
                    created = true
                }
                i++
            }
        }
    }

    #addPosttoSidebar(post, id, messages) { //creates post container
        const postsContainer = this.#container.querySelector(".posts-container")

        const postMessage = document.createElement("div")
        postMessage.className = "post-messages"

        const postButton = document.createElement("button")
        postButton.className = "post-button"
        postButton.textContent = post.title

        const postMessagesButton = document.createElement("button")
        postMessagesButton.className = "post-button"
        postMessagesButton.textContent = "Post Messages"
        postMessagesButton.id = `id: ${id}`

        postMessage.appendChild(postButton)
        postMessage.appendChild(postMessagesButton)
        postsContainer.appendChild(postMessage)

        postButton.addEventListener("click", () => {
            this.#clearMessages_content()
            const newPost = new PostedItemPage()
            newPost.updatePost(post)
        })

        postMessagesButton.addEventListener("click", () => {
            this.#clearMessages_content()
            this.#renderConversation(id, messages) //post id and messages: {user: 1, text: "message"}
        })
    }

    #handleNewMessage(newMessage) {
        const eventhub = EventHub.getEventHubInstance()
        const message = newMessage.value
        if (message.length > 0) {
            const info = {id: `${postid}-${data[0]}-${user2Id}`, text: message}
            eventhub.publish(Events.events["NewUserMessage"], info)
            newMessage.value = ""
        } else {
            alert("Please enter a message")
        }
    }

    #publishNewMessage(info) {
        const message_content = document.querySelector('message-content')
        const messageDiv = document.createElement("div")
        messageDiv.className = userId === info.data.user ? "myMessage" : "otherMessage"
        const messageText = document.createElement("h3")
        messageText.textContent = info.data.text
        messageDiv.appendChild(messageText)
        message_content.appendChild(messageDiv)
        message_content.scrollTop = message_content.scrollHeight
    }

    #clearMessages_content() {
        const message_content = document.querySelector('message-content')
        message_content.replaceChildren()
    }

    async #sendMessagetoServer(info) {
        try {
            const postsMessages = await this.#getPostsMessages()
            let conversation = postsMessages.find(p => p.id === info.id)
            if (!conversation) {
                const newConversation = {
                    id: info.id,
                    messages: [{ user: this.userId, text: info.text }]
                }
                const response = await fetch('http://localhost:3000/postsMessages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newConversation)
                })
                if (!response.ok) {
                    throw new Error("Failed to create new conversation")
                }
            } else {
                conversation.messages.push({ user: this.userId, text: info.text })
                const response = await fetch(`http://localhost:3000/postsMessages/${conversation.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(conversation)
                })
                if (!response.ok) {
                    throw new Error("Failed to update conversation")
                }
            }
        } catch (error) {
            console.error("Error sending message to server", error)
            throw error
        }
    }

    #addSubscriptions() {
        const eventHub = EventHub.getEventHubInstance()
        eventHub.subscribe(Events.events["NewUserMessage"], async info => {
            this.#publishNewMessage(info)
        })

        eventHub.subscribe(Events.events["NewUserMessage"], async info => { //save to fake server
            this.#sendMessagetoServer(info)
        })
    }

    #renderConversation(cid, messages) { //message array
        messages.forEach((mobj) => { //message format: {user: 1, text: "message"}}
            this.#publishNewMessage({id: cid, data: mobj})
        })
    }
}