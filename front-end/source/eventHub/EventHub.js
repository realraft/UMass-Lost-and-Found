export class EventHub { //handle info sharing between components
    constructor() {
        this.events = {};
    }

    subscribe(event, observer) { //add observer
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(observer);
    }

    unsubscribe(event, observer) { //remove an observer
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(e => e !== observer);
        }
    }

    publish(event, info) { //publish info
        if (!this.events[event]) {return;}
        this.events[event].forEach(observer => {observer(info)});
    }

    static i = null;

    static getEventHubInstance() {
        if (!EventHub.i) {
            EventHub.i =  new EventHub();
        }
        return EventHub.i;
    }
}