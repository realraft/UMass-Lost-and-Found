import { BasePage } from "../../pages/BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class NavBar extends BasePage {
  #container = null;
  
  constructor() {
    super();
    const pathPrefix = window.location.pathname.includes('/pages/') ? '../../' : '';
    this.loadCSS(`${pathPrefix}components/navbar`, "navbar");
  }
  
  render() {
    // Don't add navbar to the HomePageSignedOut
    if (window.location.href.includes('HomePageSignedOut')) {
      return null;
    }
    
    if (this.#container) {
      return this.#container;
    }
    
    const pathPrefix = window.location.pathname.includes('/pages/') ? '../../' : '';

    // Create a container for the navbar
    this.#container = document.createElement('div');
    
    // Setup container content
    this.#setupContainerContent(pathPrefix);
    this.#attachEventListeners();
    
    return this.#container;
  }
  
  #setupContainerContent(pathPrefix) {
    if (!this.#container) return;
    
    this.#container.innerHTML = `
      <div class="navbar">
        <div class="navbar-brand">
          <a href="#" style="text-decoration: none; color: white;" class="home-link">
            <h1>UMass Lost and Found</h1>
          </a>
        </div>
        <div class="navbar-search">
          <form class="search-form" action="/search" method="get">
            <input type="search" name="q" placeholder="Search…" aria-label="Search" />
            <button type="submit">🔍</button>
          </form>
        </div>
        <div class="navbar-actions">
          <a href="#" class="nav-link">
            <button class="post-button">Post</button>
          </a>
          <div class="dropdown">
            <button class="dropdown-button">☰</button>
            <div class="dropdown-content">
              <a href="#" class="messaging-link">Messaging</a>
              <a href="#" class="disabled-link">Post Manager</a>
              <a href="#" class="disabled-link">Admin Page</a>
              <a href="#" class="logout-link">Log Out</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  #attachEventListeners() {
    // Setup dropdown functionality
    this.#setupDropdown();
    
    // Setup search functionality
    const pathPrefix = window.location.pathname.includes('/pages/') ? '../../' : '';
    this.#setupSearch(pathPrefix);

    this.#setupNav();
    
    // Get EventHub instance if needed for future use
    const hub = EventHub.getEventHubInstance();
  }
  
  #setupDropdown() {
    const dropdownButton = this.#container.querySelector('.dropdown-button');
    const dropdownContent = this.#container.querySelector('.dropdown-content');
    
    if (dropdownButton && dropdownContent) {
      // Toggle dropdown when button is clicked
      dropdownButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
      });
      
      // Close dropdown when clicking elsewhere
      document.addEventListener('click', function() {
        if (dropdownContent.classList.contains('show')) {
          dropdownContent.classList.remove('show');
        }
      });
      
      // Prevent dropdown from closing when clicking inside it
      dropdownContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }
  
  #setupSearch(pathPrefix) {
    const searchForm = this.#container.querySelector('.search-form');
    
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchInput = this.querySelector('input[type="search"]');
        const searchQuery = searchInput.value.trim();
        
        if (searchQuery) {
          // Check if we're already on the HomePageSignedIn
          if (window.location.href.includes('HomePageSignedIn')) {
            // We're on the home page, dispatch a custom event for filtering by relevance
            const relevanceRadio = document.getElementById('relevance');
            if (relevanceRadio) {
              relevanceRadio.checked = true;
              
              // Create and dispatch a custom event with the search query
              const searchEvent = new CustomEvent('search-query', {
                detail: { query: searchQuery }
              });
              document.dispatchEvent(searchEvent);
              
              // Clear the search input after searching
              searchInput.value = '';
            }
          } else {
            // Redirect to the home page with the search query as a parameter
            window.location.href = `${pathPrefix}pages/HomePageSignedIn/HomePageSignedIn.html?search=${encodeURIComponent(searchQuery)}`;
            // No need to clear input here as page will be redirected
          }
        }
      });
    }
  }

  #setupNav() {
    // Add event listeners if needed
    const hub = EventHub.getEventHubInstance();
    
    // Add click event to the home button
    const homeButton = this.#container.querySelector(".home-link");
    if (homeButton) {
      homeButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default navigation
        hub.publish(Events.NavigateTo, "/HomePageSignedOut");
      });
    }
    
    // Add click event to the post button
    const postButton = this.#container.querySelector(".post-button");
    if (postButton) {
      postButton.addEventListener("click", (event) => {
        event.preventDefault();
        hub.publish(Events.NavigateTo, "/PostItemPage");
      });
    }
    
    // Add click events to dropdown menu links
    const messagingLink = this.#container.querySelector(".messaging-link");
    if (messagingLink) {
      messagingLink.addEventListener("click", (event) => {
        event.preventDefault();
        hub.publish(Events.NavigateTo, "/MessagingPage");
      });
    }
    
    // Handle disabled links
    const disabledLinks = this.#container.querySelectorAll(".disabled-link");
    disabledLinks.forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        alert("This feature is not yet available.");
      });
    });
    
    // Add click event to the logout link
    const logoutLink = this.#container.querySelector(".logout-link");
    if (logoutLink) {
      logoutLink.addEventListener("click", (event) => {
        event.preventDefault();
        hub.publish(Events.NavigateTo, "/HomePageSignedOut");
      });
    }
  }
}