import { BasePage } from "../../pages/BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class NavBar extends BasePage {
  #container = null;
  
  constructor() {
    super();
    const pathPrefix = this.getPathPrefix();
    this.loadCSS(`${pathPrefix}components/navbar`, "navbar");
  }
  
  getPathPrefix() {
    return window.location.pathname.includes('/pages/') ? '../../' : '';
  }
  
  render() {
    if (window.location.href.includes('HomePageSignedOut')) {
      return null;
    }
    
    if (this.#container) {
      return this.#container;
    }
    
    this.#container = document.createElement('div');
    this.#setupContainerContent();
    this.#attachEventListeners();
    
    return this.#container;
  }
  
  #setupContainerContent() {
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
            <input type="search" name="search" placeholder="Search…" aria-label="Search" />
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
              <a href="#" class="post-manager-link">Post Manager</a>
              <a href="#" class="admin-link">Admin Page</a>
              <a href="#" class="logout-link">Log Out</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  #attachEventListeners() {
    this.#setupDropdown();
    this.#setupSearch();
    this.#setupNav();
  }
  
  #setupDropdown() {
    const dropdownButton = this.#container.querySelector('.dropdown-button');
    const dropdownContent = this.#container.querySelector('.dropdown-content');
    
    if (dropdownButton && dropdownContent) {
      dropdownButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
      });
      
      document.addEventListener('click', function() {
        if (dropdownContent.classList.contains('show')) {
          dropdownContent.classList.remove('show');
        }
      });
      
      dropdownContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }
  
  #setupSearch() {
    const searchForm = this.#container.querySelector('.search-form');
    const hub = EventHub.getEventHubInstance();
    
    if (searchForm) {
      searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const searchInput = this.querySelector('input[type="search"]');
        const searchQuery = searchInput.value.trim();
        
        if (searchQuery) {
          hub.publish(Events.NavigateTo, `/HomePageSignedIn?search=${encodeURIComponent(searchQuery)}`);
          searchInput.value = '';
        }
      });
    }
  }

  #setupNav() {
    const hub = EventHub.getEventHubInstance();
    
    // Set up navigation links
    const navLinks = [
      { selector: '.home-link', path: '/HomePageSignedIn' },
      { selector: '.post-button', path: '/PostItemPage' },
      { selector: '.messaging-link', path: '/MessagingPage' },
      { selector: '.post-manager-link', path: '/PostManagerPage' },
      { selector: '.admin-link', path: '/AdminPage' },
      { selector: '.logout-link', path: '/HomePageSignedOut' }
    ];
    
    navLinks.forEach(link => {
      const element = this.#container.querySelector(link.selector);
      if (element) {
        element.addEventListener('click', (event) => {
          event.preventDefault();
          hub.publish(Events.NavigateTo, link.path);
        });
      }
    });
    
    // Handle disabled links
    this.#container.querySelectorAll('.disabled-link').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        alert('This feature is not yet available.');
      });
    });
  }
}