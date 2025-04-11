import { navbar } from "@/components/navbar";
import { Events, EventHub } from "@/lib/eventhub";

export default class App {
  constructor() {
    this._container = null; // Container for the component
    this._pageContainer = null; // Container for the page content
    this._pageComponents = {};
    this._currentPage = "home";
    this._hub = null; // EventHub instance for managing events
    
    this._hub = EventHub.getInstance();
    this._hub.subscribe(Events.NavigateTo, (page) => this._navigateTo(page));
    this._pageComponents = {
      home: new TaskListPage(),
      login: new LoginPage(),
    };
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
    
    const navbar = new Navbar();
    this._container.appendChild(navbar.render());
    
    this._pageContainer = document.createElement("main");
    this._pageContainer.id = "page-container";
    this._container.appendChild(this._pageContainer);
  }

  // Toggles the view between main and simple
  _navigateTo(page) {
    switch (page) {
      case "":
      case "/":
      case "/home":
        this._currentPage = "home";
        break;
      case "/login":
        this._currentPage = "login";
        break;
      default:
        this._currentPage = "404";
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
  }
}