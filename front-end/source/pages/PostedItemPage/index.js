import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class PostedItemPage extends BasePage {
    #container = null;
    #currentPost = null;

    constructor() {
        super();
        this.loadCSS("pages/PostedItemPage", "PostedItemPage");
    }

    updatePost(postData) {
        this.#currentPost = postData;
        if (this.#container) {
            this.#updateContent();
        }
    }

    render() {
        if (this.#container) {
            return this.#container;
        }

        this.#container = document.createElement("div");
        this.#container.className = "posted-item-page";
        
        // Create initial structure
        this.#updateContent();
        
        return this.#container;
    }

    #updateContent() {
        if (!this.#container) return;

        // Clear existing content
        this.#container.innerHTML = '';

        if (!this.#currentPost) {
            this.#container.innerHTML = '<div class="posted-item-page error-message">No item data available</div>';
            return;
        }

        // Create the post content container
        const postContent = document.createElement('div');
        postContent.className = 'post-content';

        // Title
        const title = document.createElement('h1');
        title.className = 'post-title';
        title.textContent = this.#currentPost.title || 'Untitled Item';
        postContent.appendChild(title);

        // Image container (if images are available)
        if (this.#currentPost.images && this.#currentPost.images.length > 0) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            
            this.#currentPost.images.forEach(imageSrc => {
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = this.#currentPost.title;
                imageContainer.appendChild(img);
            });
            
            postContent.appendChild(imageContainer);
        }

        // Details container
        const details = document.createElement('div');
        details.className = 'post-details';

        // Date Found
        const dateFound = document.createElement('p');
        dateFound.innerHTML = '<strong>Date Found:</strong> ' + 
            (this.#currentPost.date || 'Not specified');
        details.appendChild(dateFound);

        // Location
        const location = document.createElement('p');
        location.innerHTML = '<strong>Location:</strong> ' + 
            (this.#currentPost.location || 'Not specified');
        details.appendChild(location);

        // Description
        const description = document.createElement('div');
        description.className = 'post-details-section';
        const descriptionTitle = document.createElement('h3');
        descriptionTitle.textContent = 'Description';
        description.appendChild(descriptionTitle);
        
        const descriptionText = document.createElement('p');
        descriptionText.className = 'description-text';
        descriptionText.textContent = this.#currentPost.description || 'No description available';
        description.appendChild(descriptionText);
        details.appendChild(description);

        // Tags
        if (this.#currentPost.tags && this.#currentPost.tags.length > 0) {
            const tags = document.createElement('div');
            tags.className = 'tags';
            tags.innerHTML = '<h3>Tags</h3>';
            
            const tagList = document.createElement('div');
            tagList.className = 'tag-list';
            this.#currentPost.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                tagList.appendChild(tagElement);
            });
            
            tags.appendChild(tagList);
            details.appendChild(tags);
        }

        // Contact button
        const contactButton = document.createElement('button');
        contactButton.className = 'contact-button';
        contactButton.textContent = 'Contact Finder';
        contactButton.addEventListener('click', () => {
            const hub = EventHub.getEventHubInstance();
            hub.publish(Events.NavigateTo, '/MessagingPage');
        });
        details.appendChild(contactButton);

        postContent.appendChild(details);
        this.#container.appendChild(postContent);
    }
}

