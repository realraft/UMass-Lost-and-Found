import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class HomePageSignedIn extends BasePage {
  #container = null;
  #listingContainer = null;

  constructor() {
    super();
    this.loadCSS("pages/HomePageSignedIn", "HomePageSignedIn");
  }

  render() {
    // add signed-in-page class regardless of whether the container exists
    document.body.className = 'signed-in-page';
    
    if (this.#container) {
      return this.#container;
    }
    
    // Create a div container
    this.#container = document.createElement("div");
    this.#container.className = "page-container";
    
    // Create modal elements for reporting
    this.#createReportModal();
    
    // Setup container content synchronously
    this.#setupContainerContentSync();
    this.#attachEventListeners();

    this.#loadData();

    return this.#container;
  }

  #createReportModal() {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'report-overlay';
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'report-modal';
    
    // Create close button
    const close = document.createElement('span');
    close.className = 'close';
    close.innerHTML = '&times;';
    close.addEventListener('click', () => {
      this.#closeReportModal();
    });
    
    // Create modal title
    const title = document.createElement('h3');
    title.textContent = 'Report Listing';
    
    // Create item name element
    const itemName = document.createElement('p');
    itemName.id = 'report-item-name';
    
    // Create textarea for report reason
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Please describe why you are reporting this listing...';
    textarea.id = 'report-reason';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Report';
    submitButton.addEventListener('click', () => {
      this.#submitReport();
    });
    
    // Assemble modal
    modal.appendChild(close);
    modal.appendChild(title);
    modal.appendChild(itemName);
    modal.appendChild(textarea);
    modal.appendChild(submitButton);
        
    this.#container.appendChild(overlay);
    this.#container.appendChild(modal);
  }

  #openReportModal(itemTitle) {
    const overlay = document.getElementById('report-overlay');
    const modal = document.getElementById('report-modal');
    const itemElement = document.getElementById('report-item-name');
    const reasonTextarea = document.getElementById('report-reason');
    
    // Set the item name in the modal
    itemElement.textContent = `Item: ${itemTitle}`;
    
    // Clear any previous report text
    reasonTextarea.value = '';
    
    // Show modal and overlay
    if (overlay && modal) {
      overlay.style.display = 'block';
      modal.style.display = 'block';
    }
  }

  #closeReportModal() {
    const overlay = document.getElementById('report-overlay');
    const modal = document.getElementById('report-modal');
    
    if (overlay && modal) {
      overlay.style.display = 'none';
      modal.style.display = 'none';
    }
  }

  #submitReport() {
    const reasonElement = document.getElementById('report-reason');
    const itemElement = document.getElementById('report-item-name');
    
    if (reasonElement && itemElement) {
      const reason = reasonElement.value.trim();
      const item = itemElement.textContent.replace('Item: ', '');
      
      if (!reason) {
        alert('Please provide a reason for reporting this listing.');
        return;
      }
      
      // SEND TO SERVER HERE
      
      // Close the modal
      this.#closeReportModal();
    }
  }

  #setupContainerContentSync() {
    if (!this.#container) return;
    
    // Create left sidebar with filters
    const sidebar = document.createElement("div");
    sidebar.className = "sidebar";
    
    // Create sort-by section
    const sortBySection = document.createElement("div");
    sortBySection.className = "sort-by";
    
    const sortTitle = document.createElement("h3");
    sortTitle.textContent = "Sort By";
    
    const dateRadio = document.createElement("input");
    dateRadio.type = "radio";
    dateRadio.id = "date-posted";
    dateRadio.name = "sort";
    dateRadio.value = "date-posted";
    dateRadio.checked = true;
    
    const dateLabel = document.createElement("label");
    dateLabel.htmlFor = "date-posted";
    dateLabel.textContent = "Date Posted";
    
    const lineBreak = document.createElement("br");
    
    const relevanceRadio = document.createElement("input");
    relevanceRadio.type = "radio";
    relevanceRadio.id = "relevance";
    relevanceRadio.name = "sort";
    relevanceRadio.value = "relevance";
    
    const relevanceLabel = document.createElement("label");
    relevanceLabel.htmlFor = "relevance";
    relevanceLabel.textContent = "Relevance";
    
    sortBySection.appendChild(sortTitle);
    sortBySection.appendChild(dateRadio);
    sortBySection.appendChild(dateLabel);
    sortBySection.appendChild(lineBreak);
    sortBySection.appendChild(relevanceRadio);
    sortBySection.appendChild(relevanceLabel);
    
    // Create filters section
    const filtersSection = document.createElement("div");
    filtersSection.className = "filters";
    
    const filtersTitle = document.createElement("h3");
    filtersTitle.textContent = "Filters";
    
    // Create location filter group
    const locationFilterGroup = document.createElement("div");
    locationFilterGroup.className = "filter-group";
    
    const locationTitle = document.createElement("h4");
    locationTitle.className = "filter-section-title";
    locationTitle.textContent = "Location";
    
    const locationHeader = document.createElement("div");
    locationHeader.className = "filter-header";
    
    const locationToggle = document.createElement("button");
    locationToggle.className = "toggle-filter";
    locationToggle.id = "toggle-location-filters";
    locationToggle.textContent = "Toggle All";
    
    const locationFilters = document.createElement("div");
    locationFilters.className = "filter-options";
    locationFilters.id = "location-filters";
    
    locationHeader.appendChild(locationToggle);
    locationFilterGroup.appendChild(locationTitle);
    locationFilterGroup.appendChild(locationHeader);
    locationFilterGroup.appendChild(locationFilters);
    
    // Create tags filter group
    const tagFilterGroup = document.createElement("div");
    tagFilterGroup.className = "filter-group";
    
    const tagTitle = document.createElement("h4");
    tagTitle.className = "filter-section-title";
    tagTitle.textContent = "Tags";
    
    const tagHeader = document.createElement("div");
    tagHeader.className = "filter-header";
    
    const tagToggle = document.createElement("button");
    tagToggle.className = "toggle-filter";
    tagToggle.id = "toggle-tag-filters";
    tagToggle.textContent = "Toggle All";
    
    const tagFilters = document.createElement("div");
    tagFilters.className = "filter-options";
    tagFilters.id = "tag-filters";
    
    tagHeader.appendChild(tagToggle);
    tagFilterGroup.appendChild(tagTitle);
        tagFilterGroup.appendChild(tagHeader);
    tagFilterGroup.appendChild(tagFilters);
    
    // Add filter groups to filters section
    filtersSection.appendChild(filtersTitle);
    filtersSection.appendChild(locationFilterGroup);
    filtersSection.appendChild(tagFilterGroup);
    
    // Add sections to sidebar
    sidebar.appendChild(sortBySection);
    sidebar.appendChild(filtersSection);
    
    // Create main content area
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";
    
    // Create listings container
    this.#listingContainer = document.createElement("div");
    this.#listingContainer.className = "listing-container";
    
    // Add a loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    loadingIndicator.textContent = "Loading listings...";
    this.#listingContainer.appendChild(loadingIndicator);
    
    mainContent.appendChild(this.#listingContainer);
    
    // Add sidebar and main content to container
    this.#container.appendChild(sidebar);
    this.#container.appendChild(mainContent);
  }

  // New method to load data asynchronously after component is rendered
  async #loadData() {
    try {
      // Load and render listings
      await this.#renderListings();
      
      // Initialize filters after listings are loaded
      this.#initializeFilters();
      
      // Setup toggle buttons after filters are initialized
      this.#setupToggleButtons();
      
      // Initialize sorting functionality
      this.#initializeSorting();
      
      // Check for search query in URL
      this.#checkForSearchQuery();
      
      // Remove loading indicator if it exists
      const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
      if (loadingIndicator) {
        this.#listingContainer.removeChild(loadingIndicator);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Show error message
      this.#listingContainer.innerHTML = '<div class="error-message">Failed to load content. Please try again later.</div>';
    }
  }

  #attachEventListeners() {
    const hub = EventHub.getEventHubInstance();
    
    // Add listener for search events from navbar
    document.addEventListener('search-query', (e) => {
      this.#sortListingsByRelevance(e.detail.query);
    });

    // Add listener for new posts
    hub.subscribe(Events.NewPost, (newPost) => {
      this.#addNewPost(newPost);
    });
  }

  #initializeSorting() {
    // Add event listeners for sort radio buttons
    const dateRadio = document.getElementById('date-posted');
    const relevanceRadio = document.getElementById('relevance');
    
    if (dateRadio) {
      dateRadio.addEventListener('change', () => {
        if (dateRadio.checked) {
          this.#sortListingsByDate();
        }
      });
    }
    
    if (relevanceRadio) {
      relevanceRadio.addEventListener('change', () => {
        if (relevanceRadio.checked) {
          const searchBox = document.querySelector('.search-form input');
          const query = searchBox ? searchBox.value : '';
          if (query.trim()) {
            this.#sortListingsByRelevance(query);
          }
        }
      });
    }
    
    // Set date-posted as default and sort listings
    if (dateRadio) {
      dateRadio.checked = true;
      this.#sortListingsByDate();
    }
  }

  #checkForSearchQuery() {
    // Check if we have a search query in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
      // Set the relevance radio button
      const relevanceRadio = document.getElementById('relevance');
      if (relevanceRadio) {
        relevanceRadio.checked = true;
      }
      
      // Trigger search functionality
      this.#sortListingsByRelevance(searchQuery);
    }
  }

  #setupToggleButtons() {
    const locationToggle = document.getElementById('toggle-location-filters');
    const tagToggle = document.getElementById('toggle-tag-filters');
    
    if (locationToggle) {
      locationToggle.addEventListener('click', () => {
        this.#toggleFilters('location-filters');
      });
    }
    
    if (tagToggle) {
      tagToggle.addEventListener('click', () => {
        this.#toggleFilters('tag-filters');
      });
    }
  }

  #toggleFilters(filterId) {
    const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
    
    // Count how many checkboxes are checked
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    
    // If all or some are checked, uncheck all. Otherwise, check all.
    const shouldCheck = checkedCount === 0;
    
    // Apply the appropriate state to all checkboxes
    checkboxes.forEach(checkbox => {
      checkbox.checked = shouldCheck;
    });
    
    // Apply the filters with the new checkbox state
    this.#applyFilters();
    
    // Update button text based on new state
    const buttonText = shouldCheck ? "Deselect All" : "Select All";
    document.getElementById(`toggle-${filterId}`).textContent = buttonText;
  }

  async #initializeFilters() {
    try {
      // Fetch data from server.json
      const response = await fetch('/front-end/source/Fake-Server/server.json');
      const data = await response.json();
      const posts = data.posts;
      
      // Get unique locations and tags from server data
      const locations = new Set();
      const tags = new Set();
      
      posts.forEach(post => {
        // Extract location if it exists
        if (post.location) {
          locations.add(post.location);
        }
        
        // Extract tags if they exist
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (tag) tags.add(tag);
          });
        }
      });
      
      // Populate location filters
      this.#populateFilterOptions('location-filters', Array.from(locations));
      
      // Populate tag filters
      this.#populateFilterOptions('tag-filters', Array.from(tags));
      
      // Add event listener for filter changes
      const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
      filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.#applyFilters());
      });

      // Initialize toggle button text based on initial checkbox state
      this.#updateToggleButtonText('location-filters');
      this.#updateToggleButtonText('tag-filters');
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  }

  #updateToggleButtonText(filterId) {
    const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const allChecked = checkedCount === checkboxes.length;
    
    const buttonText = allChecked ? "Deselect All" : "Select All";
    document.getElementById(`toggle-${filterId}`).textContent = buttonText;
  }

  #populateFilterOptions(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    options.forEach(option => {
      const filterOption = document.createElement('div');
      filterOption.className = 'filter-option';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = option;
      checkbox.id = `${containerId}-${option.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.checked = true; // Default to checked
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = option;
      
      filterOption.appendChild(checkbox);
      filterOption.appendChild(label);
      container.appendChild(filterOption);
    });
  }

  #applyFilters() {
    const listings = document.querySelectorAll('.listing');
    
    // Get all location checkboxes and selected locations
    const locationCheckboxes = document.querySelectorAll('#location-filters .filter-option input[type="checkbox"]');
    const selectedLocations = Array.from(
      document.querySelectorAll('#location-filters .filter-option input:checked')
    ).map(input => input.value);
    
    // Get all tag checkboxes and selected tags
    const tagCheckboxes = document.querySelectorAll('#tag-filters .filter-option input[type="checkbox"]');
    const selectedTags = Array.from(
      document.querySelectorAll('#tag-filters .filter-option input:checked')
    ).map(input => input.value);
    
    // Filter listings
    listings.forEach(listing => {
      let showListing = true;
      
      // If we have location checkboxes but none are selected, hide all listings
      if (locationCheckboxes.length > 0 && selectedLocations.length === 0) {
        showListing = false;
      }
      // Otherwise check location filter normally
      else if (selectedLocations.length > 0) {
        const locationElement = listing.querySelector('.location');
        const listingLocation = locationElement ? locationElement.textContent.trim() : '';
        if (!selectedLocations.includes(listingLocation)) {
          showListing = false;
        }
      }
      
      // If we have tag checkboxes but none are selected, hide all listings
      if (tagCheckboxes.length > 0 && selectedTags.length === 0 && showListing) {
        showListing = false;
      }
      // Otherwise check tag filter normally
      else if (selectedTags.length > 0 && showListing) {
        const tagsElement = listing.querySelector('.tags');
        if (tagsElement) {
          const tagsText = tagsElement.textContent.trim();
          if (tagsText === "Not supplied") {
            showListing = false;
          } else {
            // Split the comma-separated tags and trim whitespace
            const listingTags = tagsText.split(',').map(tag => tag.trim());
            
            // Check if any of the listing's tags match any selected tags
            const hasMatchingTag = listingTags.some(tag => selectedTags.includes(tag));
            if (!hasMatchingTag) {
              showListing = false;
            }
          }
        } else {
          showListing = false;
        }
      }
      
      // Show or hide the listing
      if (showListing) {
        listing.classList.remove('hidden');
      } else {
        listing.classList.add('hidden');
      }
    });
    
    // Check if we need to show a "no results" message
    const visibleListings = document.querySelectorAll('.listing:not(.hidden)');
    const listingContainer = document.querySelector('.listing-container');
    const existingNoResults = listingContainer.querySelector('.no-results');
    
    if (visibleListings.length === 0) {
      if (!existingNoResults) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No items match your filters.';
        listingContainer.appendChild(noResults);
      }
    } else if (existingNoResults) {
      listingContainer.removeChild(existingNoResults);
    }
  }

  #sortListingsByDate() {
    const listingContainer = document.querySelector('.listing-container');
    const listings = Array.from(listingContainer.querySelectorAll('.listing:not(.hidden)'));
    
    // Remove any previous "no results" message
    const existingNoResults = listingContainer.querySelector('.no-results');
    if (existingNoResults) {
      listingContainer.removeChild(existingNoResults);
    }
    
    // Sort listings by date
    listings.sort((a, b) => {
      // Extract dates from the listings
      const dateA = new Date(a.querySelector('.date')?.textContent || 
                            a.getAttribute('data-date') || 0);
      const dateB = new Date(b.querySelector('.date')?.textContent ||
                            b.getAttribute('data-date') || 0);
      
      // Sort in descending order (newest first)
      return dateB - dateA;
    });
    
    // Reorder listings in the DOM
    listings.forEach(listing => {
      listingContainer.appendChild(listing);
    });
  }
    
  #sortListingsByRelevance(query) {
    // Normalize the query
    query = query.toLowerCase();
    
    // Get all current listings from the container
    const listingContainer = document.querySelector('.listing-container');
    const listings = listingContainer.querySelectorAll('.listing:not(.hidden)');
    
    // If no query, just maintain current filter state and return
    if (!query.trim()) {
      // Remove any previous "no results" message
      const existingNoResults = listingContainer.querySelector('.no-results');
      if (existingNoResults) {
        listingContainer.removeChild(existingNoResults);
      }
      return;
    }
    
    // Calculate relevance score for each listing
    const listingScores = [];
    
    listings.forEach(listing => {
      const titleElement = listing.querySelector('.title');
      const categoryElement = listing.querySelector('.category');
      const locationElement = listing.querySelector('.location');
      const descriptionElement = listing.querySelector('.description');
      
      const title = titleElement ? titleElement.textContent.toLowerCase() : '';
      const category = categoryElement ? categoryElement.textContent.toLowerCase() : '';
      const location = locationElement ? locationElement.textContent.toLowerCase() : '';
      const description = descriptionElement ? descriptionElement.textContent.toLowerCase() : '';
      
      // Simple relevance scoring (can be enhanced for better matching)
      let score = 0;
      
      if (title.includes(query)) score += 3;  // Title match is most important
      if (category.includes(query)) score += 2;
      if (location.includes(query)) score += 2;
      if (description.includes(query)) score += 1;
      
      listingScores.push({ listing, score });
    });
    
    // Sort listings by relevance score (highest first)
    listingScores.sort((a, b) => b.score - a.score);
    
    // Reorder listings based on score
    listingScores.forEach(item => {
      // Append each listing to move it to the end in sorted order
      listingContainer.appendChild(item.listing);
    });
    
    // Check if we need to show a "no results" message
    if (listings.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No items match your search and filters.';
      listingContainer.appendChild(noResults);
    }
  }
  
  async #renderListings() {
    try {
      const response = await fetch('/front-end/source/Fake-Server/server.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      
      const json_data = await response.json();
      
      if (this.#listingContainer) {
        const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
        this.#listingContainer.innerHTML = '';
        if (loadingIndicator) {
          this.#listingContainer.appendChild(loadingIndicator);
        }
      }
      
      for (const post of json_data.posts) {
        const new_post = document.createElement("div");
        new_post.classList.add("listing");
        new_post.id = post.id;

        // Make the listing clickable
        new_post.style.cursor = 'pointer';
        new_post.addEventListener('click', (e) => {
          // Don't trigger if clicking the report button
          if (e.target.classList.contains('report-button')) {
            return;
          }
          const hub = EventHub.getEventHubInstance();
          hub.publish(Events.ViewPost, post);
        });

        // Title
        const title_wrapper = document.createElement("h3");
        const title_value = document.createElement("span");
        title_value.classList.add("title");
        title_value.textContent = post.title || "Not Supplied";
        title_wrapper.appendChild(title_value);
        new_post.appendChild(title_wrapper);

        // Date
        const date_wrapper = document.createElement("p");
        const date_value = document.createElement("span");
        date_value.classList.add("date");
        date_value.textContent = post.date || "Not supplied";
        date_wrapper.textContent = "Date found: ";
        date_wrapper.appendChild(date_value);
        new_post.appendChild(date_wrapper);

        // Description
        const desc_wrapper = document.createElement("p");
        const desc_value = document.createElement("span");
        desc_value.classList.add("description");
        desc_value.textContent = post.description || "Not supplied";
        desc_wrapper.textContent = "Description: ";
        desc_wrapper.appendChild(desc_value);
        new_post.appendChild(desc_wrapper);

        // Tags
        const tags_wrapper = document.createElement("p");
        const tags_value = document.createElement("span");
        tags_value.classList.add("tags");
        tags_value.textContent = post.tags && post.tags.length > 0
          ? post.tags.join(", ")
          : "Not supplied";
        tags_wrapper.textContent = "Tags: ";
        tags_wrapper.appendChild(tags_value);
        new_post.appendChild(tags_wrapper);

        // Location
        const location_wrapper = document.createElement("p");
        const location_value = document.createElement("span");
        location_value.classList.add("location");
        location_value.textContent = post.location || "Not supplied";
        location_wrapper.textContent = "Location: ";
        location_wrapper.appendChild(location_value);
        new_post.appendChild(location_wrapper);

        // Report button
        const button_element = document.createElement("button");
        button_element.classList.add("report-button");
        button_element.innerHTML = "Report Listing";
        button_element.dataset.item = post.title;
        button_element.addEventListener('click', () => {
          this.#openReportModal(post.title);
        });
        new_post.appendChild(button_element);

        // Add listing to container
        if (this.#listingContainer) {
          this.#listingContainer.appendChild(new_post);
        }
      }
    } catch (error) {
      console.error("Error rendering listings:", error);
      
      // Show error message if listings can't be loaded
      if (this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="error-message">Failed to load listings. Please try again later.</div>';
      }
    }
  }

  #addNewPost(post) {
    if (!this.#listingContainer) return;

    const new_post = document.createElement("div");
    new_post.classList.add("listing");
    new_post.id = post.id;

    // Title
    const title_wrapper = document.createElement("h3");
    const title_value = document.createElement("span");
    title_value.classList.add("title");
    title_value.textContent = post.title || "Not Supplied";
    title_wrapper.appendChild(title_value);
    new_post.appendChild(title_wrapper);

    // Date
    const date_wrapper = document.createElement("p");
    const date_value = document.createElement("span");
    date_value.classList.add("date");
    date_value.textContent = post.date || "Not supplied";
    date_wrapper.textContent = "Date found: ";
    date_wrapper.appendChild(date_value);
    new_post.appendChild(date_wrapper);

    // Description
    const desc_wrapper = document.createElement("p");
    const desc_value = document.createElement("span");
    desc_value.classList.add("description");
    desc_value.textContent = post.description || "Not supplied";
    desc_wrapper.textContent = "Description: ";
    desc_wrapper.appendChild(desc_value);
    new_post.appendChild(desc_wrapper);

    // Tags
    const tags_wrapper = document.createElement("p");
    const tags_value = document.createElement("span");
    tags_value.classList.add("tags");
    tags_value.textContent = post.tags && post.tags.length > 0
      ? post.tags.join(", ")
      : "Not supplied";
    tags_wrapper.textContent = "Tags: ";
    tags_wrapper.appendChild(tags_value);
    new_post.appendChild(tags_wrapper);

    // Location
    const location_wrapper = document.createElement("p");
    const location_value = document.createElement("span");
    location_value.classList.add("location");
    location_value.textContent = post.location || "Not supplied";
    location_wrapper.textContent = "Location: ";
    location_wrapper.appendChild(location_value);
    new_post.appendChild(location_wrapper);

    // Report button
    const button_element = document.createElement("button");
    button_element.classList.add("report-button");
    button_element.innerHTML = "Report Listing";
    button_element.dataset.item = post.title;
    new_post.appendChild(button_element);

    // Add the new post at the beginning of the container
    if (this.#listingContainer.firstChild) {
      this.#listingContainer.insertBefore(new_post, this.#listingContainer.firstChild);
    } else {
      this.#listingContainer.appendChild(new_post);
    }

    // Update filters if the post has new tags or location
    if (post.tags && post.tags.length > 0) {
      const tagFilters = document.getElementById('tag-filters');
      if (tagFilters) {
        post.tags.forEach(tag => {
          // Check if this tag filter already exists
          const existingFilter = tagFilters.querySelector(`input[value="${tag}"]`);
          if (!existingFilter) {
            // Add new tag filter
            const filterOption = document.createElement('div');
            filterOption.className = 'filter-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.id = `tag-filters-${tag.toLowerCase().replace(/\s+/g, '-')}`;
            checkbox.checked = true;
            checkbox.addEventListener('change', () => this.#applyFilters());
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = tag;
            
            filterOption.appendChild(checkbox);
            filterOption.appendChild(label);
            tagFilters.appendChild(filterOption);
          }
        });
      }
    }

    if (post.location) {
      const locationFilters = document.getElementById('location-filters');
      if (locationFilters) {
        // Check if this location filter already exists
        const existingFilter = locationFilters.querySelector(`input[value="${post.location}"]`);
        if (!existingFilter) {
          // Add new location filter
          const filterOption = document.createElement('div');
          filterOption.className = 'filter-option';
          
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = post.location;
          checkbox.id = `location-filters-${post.location.toLowerCase().replace(/\s+/g, '-')}`;
          checkbox.checked = true;
          checkbox.addEventListener('change', () => this.#applyFilters());
          
          const label = document.createElement('label');
          label.htmlFor = checkbox.id;
          label.textContent = post.location;
          
          filterOption.appendChild(checkbox);
          filterOption.appendChild(label);
          locationFilters.appendChild(filterOption);
        }
      }
    }

    // Re-apply current filters and sorting
    this.#applyFilters();
    
    // If sorted by date, resort the listings
    const dateRadio = document.getElementById('date-posted');
    if (dateRadio && dateRadio.checked) {
      this.#sortListingsByDate();
    }
  }
}