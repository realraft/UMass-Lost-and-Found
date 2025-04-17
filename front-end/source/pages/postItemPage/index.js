import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class PostItemPage extends BasePage {
  #container = null;

  constructor() {
    super();
    this.loadCSS("pages/PostItemPage", "PostItemPage");
  }

  render() {
    if (this.#container) {
      return this.#container;
    }

    // Create a container for the page
    this.#container = document.createElement("div");
    this.#container.className = "post-item-page";

    this.#setupMainContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupMainContent() {
    const main = document.createElement("main");
    
    const postsContainer = document.createElement("div");
    postsContainer.className = "posts-container";
    
    // Create the post element
    const post = document.createElement("div");
    post.className = "post";
    post.id = "1";
    
    // Left content
    const leftContent = document.createElement("div");
    leftContent.className = "left-content-container";
    
    // Image container
    const imgContainer = document.createElement("div");
    imgContainer.className = "post-img-container";
    const img = document.createElement("img");
    img.src = "placeholder.jpg";
    imgContainer.appendChild(img);
    
    // Post options container
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "post-options-container";
    
    // Date options
    const dateOptionsContainer = document.createElement("div");
    dateOptionsContainer.className = "date-options-container";
    
    const dateFoundOption = document.createElement("div");
    dateFoundOption.className = "date-found-option";
    const dateFoundText = document.createElement("p");
    dateFoundText.textContent = "Date Found:";
    dateFoundOption.appendChild(dateFoundText);
    
    const datePicker = document.createElement("div");
    datePicker.className = "date-picker";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "date-input";
    const calendarBtn = document.createElement("button");
    calendarBtn.type = "button";
    calendarBtn.className = "calendar-btn";
    calendarBtn.setAttribute("aria-label", "Open calendar");
    calendarBtn.textContent = "📅";
    datePicker.appendChild(dateInput);
    datePicker.appendChild(calendarBtn);
    
    dateOptionsContainer.appendChild(dateFoundOption);
    dateOptionsContainer.appendChild(datePicker);
    
    // Anonymous options
    const anonymousOptionsContainer = document.createElement("div");
    anonymousOptionsContainer.className = "anonymous-options-container";
    
    const anonymousText = document.createElement("div");
    anonymousText.className = "anonymous-text";
    const anonymousTextP = document.createElement("p");
    anonymousTextP.textContent = "Anonymous Listing?";
    anonymousText.appendChild(anonymousTextP);
    
    const anonymousButton = document.createElement("div");
    anonymousButton.className = "anonymous-button";
    
    anonymousOptionsContainer.appendChild(anonymousText);
    anonymousOptionsContainer.appendChild(anonymousButton);
    
    optionsContainer.appendChild(dateOptionsContainer);
    optionsContainer.appendChild(anonymousOptionsContainer);
    
    leftContent.appendChild(imgContainer);
    leftContent.appendChild(optionsContainer);
    
    // Right content
    const rightContent = document.createElement("div");
    rightContent.className = "right-content-container";
    
    // Description box
    const descContainer = document.createElement("div");
    descContainer.className = "description-box-input-container";
    const descriptionLabel = document.createElement("label");
    descriptionLabel.setAttribute("for", "description");
    descriptionLabel.className = "sr-only";
    const descriptionBox = document.createElement("textarea");
    descriptionBox.id = "description";
    descriptionBox.className = "description-box";
    descriptionBox.placeholder = "Description...";
    descContainer.appendChild(descriptionLabel);
    descContainer.appendChild(descriptionBox);
    
    // Tag input
    const tagContainer = document.createElement("div");
    tagContainer.className = "tag-input-container";
    const tagIcon = document.createElement("span");
    tagIcon.className = "tag-icon";
    tagIcon.textContent = "🏷️";
    const tagInput = document.createElement("input");
    tagInput.type = "text";
    tagInput.className = "tag-input";
    tagInput.placeholder = "Tag(s)";
    tagInput.setAttribute("aria-label", "Add tags");
    tagContainer.appendChild(tagIcon);
    tagContainer.appendChild(tagInput);
    
    // GPS map container
    const gpsContainer = document.createElement("div");
    gpsContainer.className = "GPS-map-container";
    const gpsImg = document.createElement("img");
    gpsImg.src = "Googlemapsplaceholder.png";
    gpsImg.alt = "google-maps-placeholder";
    gpsContainer.appendChild(gpsImg);
    
    rightContent.appendChild(descContainer);
    rightContent.appendChild(tagContainer);
    rightContent.appendChild(gpsContainer);
    
    // Append left and right content to post
    post.appendChild(leftContent);
    post.appendChild(rightContent);
    
    // Append post to posts container
    postsContainer.appendChild(post);
    
    // Append posts container to main
    main.appendChild(postsContainer);
    
    // Append main to container
    this.#container.appendChild(main);
  }

  #attachEventListeners() {
    const hub = EventHub.getEventHubInstance();
    
    // Post button functionality
    const postButton = this.#container.querySelector(".post-button");
    if (postButton) {
      postButton.addEventListener("click", () => {
        // Handle post submission logic
        const description = this.#container.querySelector("#description").value;
        const dateFound = this.#container.querySelector(".date-input").value;
        const tags = this.#container.querySelector(".tag-input").value.split(',').map(tag => tag.trim());
        const anon = this.#container.querySelector(".anonymous-button").checked;
        
        // Create the new post object
        const newPost = {
          id: Date.now().toString(),
          title: description.split('\n')[0] || 'Untitled Post', // Use first line as title
          description: description,
          date: dateFound,
          anon: anon,
          tags: tags.filter(tag => tag.length > 0),
          location: "Not supplied" // You can add location input if needed
        };
        
        // Publish the new post event
        hub.publish(Events.NewPost, newPost);
        
        // Navigate back to home page
        hub.publish(Events.NavigateTo, "/HomePageSignedIn");
      });
    }
    
    // Header title navigation to home
    const headerText = this.#container.querySelector("#header-text");
    if (headerText) {
      headerText.addEventListener("click", () => {
        hub.publish(Events.NavigateTo, "/HomePageSignedIn");
      });
    }
  }
}