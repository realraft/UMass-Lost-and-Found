import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class HomePageSignedOut extends BasePage {
  #container = null;

  constructor() {
    super();
    this.loadCSS("pages/HomePageSignedOut", "HomePageSignedOut");
  }

  render() {
    // Apply signed-out-page class directly to the body element
    document.body.className = 'signed-out-page';
    
    if (this.#container) {
      return this.#container;
    }

    // Create a div container
    this.#container = document.createElement("div");
    this.#container.className = "homepage-container";
    
    this.#setupContainerContent();
    this.#attachEventListeners();

    return this.#container;
  }

  #setupContainerContent() {
    if (!this.#container) return;
    
    // Create header
    const header = document.createElement("div");
    header.className = "header";
    header.textContent = "UMass Lost and Found";
    
    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";
    
    const image = document.createElement("img");
    image.src = "/front-end/public/umass.png";
    image.alt = "Lost and Found Items";
    imageContainer.appendChild(image);
    
    // Create description
    const description = document.createElement("div");
    description.className = "description";
    description.textContent = "Report and find lost belongings. Made for UMass and UMass students only.";
    
    // Create sign-in button
    const signInButton = document.createElement("a");
    signInButton.className = "sign-in-button";
    signInButton.href = "../HomePageSignedIn/HomePageSignedIn.html";
    signInButton.textContent = "Sign In";
    
    // Add all elements to container
    this.#container.appendChild(header);
    this.#container.appendChild(imageContainer);
    this.#container.appendChild(description);
    this.#container.appendChild(signInButton);
  }

  #attachEventListeners() {
    // Add event listeners if needed
    const hub = EventHub.getEventHubInstance();
    
    // Add click event to the sign-in button
    const signInButton = this.#container.querySelector(".sign-in-button");
    if (signInButton) {
      signInButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default navigation
        // Use general NavigateTo event with the target path to HomePageSignedIn
        hub.publish(Events.NavigateTo, "/HomePageSignedIn");
      });
    }
  }
}