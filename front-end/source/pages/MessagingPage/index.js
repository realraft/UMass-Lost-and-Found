import { EventHub } from "../../eventHub/EventHub";
import { Events } from "../../eventHub/Events";
import { MessagingService } from "../../services/MessagingService";
import { BasePage } from "../BasePage/BasePage";

export class MessagingPage extends BasePage {

    #container = null
    messagingService = null

    constructor() {
        super()
        this.loadCSS("pages/MessagingPage", "MessagingPage")
        this.messagingService = new MessagingService()
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

    render() {
        this.#createContainer()
        this.#addEventListeners()
        this.#addSubscriptions()
        return this.#container
    }

    #handleNewMessage(newMessage) {
        const eventhub = EventHub.getEventHubInstance()
        const message = newMessage.value
        const data = message.split(":") //get the user 
        if (data[1].length > 0) {
            const info = {id: `${postid}-${data[0]}-${user2Id}`, text: data[1]} //message format, same ID as post-conversation object
            eventhub.publish(Events.events["NewUserMessage"], info)
            newMessage.value = "message received"
        } else {
            alert("Please enter a message")
        }
    }

    #publishNewMessage(info) {
        const message_content = document.querySelector('message-content')

        const ids = info.id.split("-")
        const userId = ids[1]
        const textdata = info.text.split(":")
        const user = textdata[0]
        const message = textdata[1]

        const messageDiv = document.createElement("div")
        messageDiv.className = userId === user ? "myMessage" : "otherMessage"
        const messageText = document.createElement("h3")
        messageText.textContent = message
        messageDiv.appendChild(messageText)
        message_content.appendChild(messageDiv)
        message_content.scrollTop = message_content.scrollHeight
    }

    #clearMessages_content() {
        const message_content = document.querySelector('message-content')
        message_content.replaceChildren()
    }

    #addSubscriptions() {
        const eventHub = EventHub.getEventHubInstance()
        eventHub.subscribe(Events.events["NewUserMessage"], async info => {
            this.#publishNewMessage(info)
        })
    }

    async renderConversation(id) { //id
        await this.messagingService.loadConversationMessagesFromDB(id).then((data) => {
            this.#clearMessages_content()
            if (data) {
                const messages = data.messages
                messages.forEach((message) => {
                    this.#publishNewMessage({id: data.id, text: message})
                })
            }
        })
    }
}//const eventhub = EventHub.getEventHubInstance()