import { Events } from "../eventHub/Events";
import { Service } from "./Service"

export class MessagingService extends Service { //database specific to messaging service 
    constructor() {
        super();
        this.dbName = "messageDB" //name of database
        this.storeName = "messages" //store name 
        this.db = null //reference to indexedDB database

        this.initDB().then( //initialize connection to indexedDB
           () => {this.loadMessagesFromDB()}).catch(error => {console.log(error)})
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

    async storeMessage(info) { //store user's message
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite")
            const objectStore = transaction.objectStore(this.storeName)
            const request = objectStore.add(info)
            request.onsuccess = () => resolve()
            request.onerror = (event) => reject(event.target.error)
        });
    }

    async loadMessagesFromDB() { //get messages
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.storeName], "readwrite")
            let store = transaction.objectStore(this.storeName)
            let request = store.getAll()
            request.onsuccess = (event) => {
                resolve(event.target.result)
            }
            request.onerror = (event) => {
                reject(event.target.errorCode)
            }
        });
    }

    async clearMessages() { //delete all messages
        return new Promise((resolve, reject) => {
            let transaction = this.db.transaction([this.storeName], "readwrite")
            let store = transaction.objectStore(this.storeName)
            let request = store.clear()
            request.onsuccess = () => resolve()
            request.onerror = (event) => reject(event.target.error)
        });
    }

    async deleteMessage(info) { //delete a message
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], "readwrite")
            const objectStore = transaction.objectStore(this.storeName)
            const request = objectStore.delete(info.id)
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

//info: {id: "xxxx-xx", pid: "xxxx", n: "xx", text: "aaaaa". user: "xxx"}