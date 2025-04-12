import { EventHub } from "../eventHub/EventHub.js"

export class Service {
    constructor() {
        this.addSubscriptions()
    }

    addSubscriptions() {
        throw new Error("Subclass hasn't implemented this method")
    }

    subscribe(event, observer) {
        EventHub.getEventHubInstance().subscribe(event, observer)
    }

    publish(event, info) {
        EventHub.getEventHubInstance().publish(event, info)
    }
}