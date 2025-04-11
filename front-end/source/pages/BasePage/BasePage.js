export class BasePage {
    constructor() {
        this.cssloaded = false
    }

    render() {
        throw new Error('Method "render" must be implemented in derived classes')
    }

    loadCSS(pageName, cssName = pageName) {
        if (!this.cssloaded) {
            const link = document.createElement("link")
            link.rel = "stylesheet"
            link.href = `/front-end/source/pages/${pageName}/${cssName}.css`
            document.head.appendChild(link)
            this.cssloaded = true
        }
    }

    dispatchCustomEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        this.parent.dispatchEvent(event);
    }

    listenToEvent(eventName, callback) {
      this.parent.addEventListener(eventName, callback);
    }
}
