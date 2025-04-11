import { Events } from "../eventHub/Events.js";
import { Service } from "./Service.js";

export class MessagingService extends Service { //database specific to messaging service 
    constructor() {
        super();
        this.dbName = "messageDB" //name of database
        this.storeName = "messages" //store name 
        this.db = null //reference to indexedDB database

        this.initDB().then( //initialize connection to indexedDB
           () => {this.loadMessagesFromDB()}).catch(error => {console.log(error)})
        this.addSubscriptions()
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1)
            request.onsuccess = (event) => {
                this.db = event.target.result
                resolve()
            }
            request.onerror = (event) => {
                console.error("Error in opening database", event.target.errorCode)
                reject(event.target.error)
            }
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: "id" })
                }
            }
        })
    }

    async storeMessage(info) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite")
            const objectStore = transaction.objectStore(this.storeName)
            const request = objectStore.get(info.id)
            request.onsuccess = (event) => {
                const result = event.target.result
                if (result) {
                    result.messages.push(info.text)
                    const pRequest = objectStore.put(result);
                    pRequest.onsuccess = () => resolve();
                    pRequest.onerror = (event) => reject(event.target.error);
                } else {
                    const aRequest = objectStore.add({ id: info.id, messages: [info.text] })
                    aRequest.onsuccess = () => resolve()
                    aRequest.onerror = (event) => reject(event.target.error)
                }
            }
            request.onerror = (event) => {
                reject(event.target.error)
            }
        })
    }

    async loadConversationMessagesFromDB(id) { //get messages
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.storeName], "readwrite")
            let store = transaction.objectStore(this.storeName)
            let request = store.get(id) //get messages for specific conversation id
            request.onsuccess = (event) => {
                resolve(event.target.result)
            }
            request.onerror = (event) => {
                reject(event.target.errorCode)
            }
        });
    }

    async deleteConversation(id) { //delete a conversation
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite")
            const objectStore = transaction.objectStore(this.storeName)
            const request = objectStore.delete(id)
            request.onsuccess = () => resolve()
            request.onerror = (event) => reject(event.target.error)
        });
    }

    addSubscriptions() { //subscribe message saving functions
        this.subscribe(Events.NewMessage, async info => {
            try {
                await this.storeMessage(info);
            } catch (error) {
                console.error("Failed to store message:", error);
            }
        })
    }
}

//info: {id: "xxxx-xx-xx", messages: ["aaaaa", "bbbbb"]} per post and per user pair
//id => conversation id = postid + user1id + user2id