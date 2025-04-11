import { EventHub } from "./eventHub/EventHub.js";
import { Events } from "./eventHub/Events.js";
import { HomePageSignedOut } from "./pages/HomePageSignedOut/index.js";
import { HomePageSignedIn } from "./pages/HomePageSignedIn/index.js";
import { NavBar } from "./components/navbar/index.js";
import { PostItemPage } from "./pages/postItemPage/index.js";
//import { PostedItemPage } from "./pages/PostedItemPage/index.js";
import { MessagingPage } from "./pages/MessagingPage/index.js";

export default class App {
  constructor() {
    this._container = null; // Container for the component
    this._pageContainer = null; // Container for the page content
    this._pageComponents = {};
    this._currentPage = "home";
    this._hub = null; // EventHub instance for managing events
    this._navbar = null; // NavBar component instance
    this._navbarElement = null; // Navbar DOM element
    
    this._hub = EventHub.getEventHubInstance();
    this._hub.subscribe(Events.NavigateTo, (page) => this._navigateTo(page));
    this._pageComponents = {
      home: new HomePageSignedOut(),
      homeSignedIn: new HomePageSignedIn(),
      postItem: new PostItemPage(),
      //postedItem: new PostedItemPage(),
      messaging: new MessagingPage()
    };
    this._navbar = new NavBar();
  }

  // Render the AppController component and return the container
  render() {
    this._createContainer();
    this._setupContainerContent();

    // Initially render the main view
    this._renderCurrentPage();
    if (!this._container) {
      throw new Error("Container element not found");
    }
    return this._container;
  }
  
  // Creates the main container element
  _createContainer() {
    this._container = document.createElement("div");
    this._container.id = "app";
    this._container.classList.add("app");
  }

  // Sets up the HTML structure for the container
  _setupContainerContent() {
    if (!this._container) {
      throw new Error("Container element not found");
    }
    
    this._navbarElement = this._navbar.render();
    
    this._pageContainer = document.createElement("main");
    this._pageContainer.id = "page-container";
    this._container.appendChild(this._pageContainer);
  }

  // Handles navigation to different pages
  _navigateTo(page) {
    switch (page) {
      case "":
      case "/":
      case "/home":
      case "/HomePageSignedOut":
        this._currentPage = "home";
        break;
      case "/HomePageSignedIn":
        this._currentPage = "homeSignedIn";
        break;
      case "/PostItemPage":
        this._currentPage = "postItem";
        break;
      case "/PostedItemPage":
        this._currentPage = "postedItem";
        break;
      case "/MessagingPage":
        this._currentPage = "messaging";
        break;
      default:
        this._currentPage = "home";
    }
    this._renderCurrentPage();
    
    // Update the URL without reloading the page
    window.history.pushState({ page }, page, window.location.origin + page);
  }

  // Renders the current view based on the _currentPage state
  _renderCurrentPage() {
    if (!this._pageContainer) {
      throw new Error("Page container element not found");
    }
    this._pageContainer.innerHTML = "";
    const pageComponent = this._pageComponents[this._currentPage];
    if (!pageComponent) {
      throw new Error(`Page component not found for view: ${this._currentPage}`);
    }
    this._pageContainer.appendChild(pageComponent.render());
    
    // Update navbar visibility based on current page
    if (this._currentPage === "home") {
      // Remove navbar when on HomePageSignedOut
      if (this._navbarElement && this._navbarElement.parentNode === this._container) {
        this._container.removeChild(this._navbarElement);
      }
    } else {
      // Add navbar for all other pages if it's not already in the DOM
      if (this._navbarElement && !this._navbarElement.parentNode) {
        this._container.insertBefore(this._navbarElement, this._pageContainer);
      }
    }
  }
}