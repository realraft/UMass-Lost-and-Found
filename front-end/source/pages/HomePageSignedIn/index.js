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
    document.body.className = 'signed-in-page';
    
    if (this.#container) {
      setTimeout(() => this.#checkForSearchQuery(), 0);
      return this.#container;
    }
    
    this.#container = document.createElement("div");
    this.#container.className = "page-container";
    
    this.#createReportModal();
    this.#setupContainerContentSync();
    this.#attachEventListeners();
    this.#loadData();

    return this.#container;
  }

  #createReportModal() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'report-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'report-modal';
    
    const close = document.createElement('span');
    close.className = 'close';
    close.innerHTML = '&times;';
    close.addEventListener('click', () => this.#closeReportModal());
    
    const title = document.createElement('h3');
    title.textContent = 'Report Listing';
    
    const itemName = document.createElement('p');
    itemName.id = 'report-item-name';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Please describe why you are reporting this listing...';
    textarea.id = 'report-reason';
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Report';
    submitButton.addEventListener('click', () => this.#submitReport());
    
    modal.append(close, title, itemName, textarea, submitButton);
    this.#container.append(overlay, modal);
  }

  #openReportModal(itemTitle) {
    const overlay = document.getElementById('report-overlay');
    const modal = document.getElementById('report-modal');
    const itemElement = document.getElementById('report-item-name');
    const reasonTextarea = document.getElementById('report-reason');
    
    if (overlay && modal && itemElement && reasonTextarea) {
      itemElement.textContent = `Item: ${itemTitle}`;
      reasonTextarea.value = '';
      
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
      this.#closeReportModal();
    }
  }

  #setupContainerContentSync() {
    if (!this.#container) return;
    
    // Create sidebar with filters and sorting
    const sidebar = this.#createSidebar();
    
    // Create main content area
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";
    
    // Create listings container
    this.#listingContainer = document.createElement("div");
    this.#listingContainer.className = "listing-container";
    
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    loadingIndicator.textContent = "Loading listings...";
    this.#listingContainer.appendChild(loadingIndicator);
    
    mainContent.appendChild(this.#listingContainer);
    this.#container.append(sidebar, mainContent);
  }

  #createSidebar() {
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
    
    sortBySection.append(sortTitle, dateRadio, dateLabel, lineBreak, relevanceRadio, relevanceLabel);
    
    // Create filters section
    const filtersSection = document.createElement("div");
    filtersSection.className = "filters";
    
    const filtersTitle = document.createElement("h3");
    filtersTitle.textContent = "Filters";
    
    // Create filter groups
    const locationFilterGroup = this.#createFilterGroup("Location", "location-filters");
    const tagFilterGroup = this.#createFilterGroup("Tags", "tag-filters");
    
    // Add filter groups to filters section
    filtersSection.append(filtersTitle, locationFilterGroup, tagFilterGroup);
    
    // Add sections to sidebar
    sidebar.append(sortBySection, filtersSection);
    return sidebar;
  }

  #createFilterGroup(title, filterId) {
    const filterGroup = document.createElement("div");
    filterGroup.className = "filter-group";
    
    const filterTitle = document.createElement("h4");
    filterTitle.className = "filter-section-title";
    filterTitle.textContent = title;
    
    const filterHeader = document.createElement("div");
    filterHeader.className = "filter-header";
    
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-filter";
    toggleButton.id = `toggle-${filterId}`;
    toggleButton.textContent = "Toggle";
    
    const filterOptions = document.createElement("div");
    filterOptions.className = "filter-options";
    filterOptions.id = filterId;
    
    filterHeader.appendChild(toggleButton);
    filterGroup.append(filterTitle, filterHeader, filterOptions);
    
    return filterGroup;
  }

  async #loadData() {
    try {
      await this.#renderListings();
      await this.#initializeFilters();
      this.#setupToggleButtons();
      this.#initializeSorting();
      this.#checkForSearchQuery();
      
      const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
      if (loadingIndicator) {
        this.#listingContainer.removeChild(loadingIndicator);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      this.#listingContainer.innerHTML = '<div class="error-message">Failed to load content. Please try again later.</div>';
    }
  }

  #attachEventListeners() {
    const hub = EventHub.getEventHubInstance();
    
    document.addEventListener('search-query', (e) => {
      this.#sortListingsByRelevance(e.detail.query);
    });

    hub.subscribe(Events.NewPost, (newPost) => {
      this.#addNewPost(newPost);
    });
  }

  #initializeSorting() {
    const dateRadio = document.getElementById('date-posted');
    const relevanceRadio = document.getElementById('relevance');
    
    if (dateRadio) {
      dateRadio.addEventListener('change', () => {
        if (dateRadio.checked) this.#sortListingsByDate();
      });
    }
    
    if (relevanceRadio) {
      relevanceRadio.addEventListener('change', () => {
        if (relevanceRadio.checked) {
          const searchBox = document.querySelector('.search-form input');
          const query = searchBox ? searchBox.value : '';
          if (query.trim()) this.#sortListingsByRelevance(query);
        }
      });
    }
    
    if (dateRadio) {
      dateRadio.checked = true;
      this.#sortListingsByDate();
    }
  }

  #checkForSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
      const relevanceRadio = document.getElementById('relevance');
      if (relevanceRadio) relevanceRadio.checked = true;
      
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
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const shouldCheck = checkedCount === 0;
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = shouldCheck;
    });
    
    this.#applyFilters();
  }

  async #initializeFilters() {
    try {
      const response = await fetch('/front-end/source/Fake-Server/server.json');
      const data = await response.json();
      const posts = data.posts;
      
      const locations = new Set();
      const tags = new Set();
      
      posts.forEach(post => {
        if (post.location) locations.add(post.location);
        
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (tag) tags.add(tag);
          });
        }
      });
      
      this.#populateFilterOptions('location-filters', Array.from(locations));
      this.#populateFilterOptions('tag-filters', Array.from(tags));
      
      const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
      filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.#applyFilters());
      });
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
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
      checkbox.checked = true;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = option;
      
      filterOption.append(checkbox, label);
      container.appendChild(filterOption);
    });
  }

  #applyFilters() {
    const listings = document.querySelectorAll('.listing');
    const locationCheckboxes = document.querySelectorAll('#location-filters .filter-option input[type="checkbox"]');
    const selectedLocations = Array.from(
      document.querySelectorAll('#location-filters .filter-option input:checked')
    ).map(input => input.value);
    
    const tagCheckboxes = document.querySelectorAll('#tag-filters .filter-option input[type="checkbox"]');
    const selectedTags = Array.from(
      document.querySelectorAll('#tag-filters .filter-option input:checked')
    ).map(input => input.value);
    
    listings.forEach(listing => {
      let showListing = true;
      
      // Location filter
      if (locationCheckboxes.length > 0 && selectedLocations.length === 0) {
        showListing = false;
      } else if (selectedLocations.length > 0) {
        const locationElement = listing.querySelector('.location');
        const listingLocation = locationElement ? locationElement.textContent.trim() : '';
        if (!selectedLocations.includes(listingLocation)) {
          showListing = false;
        }
      }
      
      // Tag filter
      if (tagCheckboxes.length > 0 && selectedTags.length === 0 && showListing) {
        showListing = false;
      } else if (selectedTags.length > 0 && showListing) {
        const tagsElement = listing.querySelector('.tags');
        if (tagsElement) {
          const tagsText = tagsElement.textContent.trim();
          if (tagsText === "Not supplied") {
            showListing = false;
          } else {
            const listingTags = tagsText.split(',').map(tag => tag.trim());
            const hasMatchingTag = listingTags.some(tag => selectedTags.includes(tag));
            if (!hasMatchingTag) {
              showListing = false;
            }
          }
        } else {
          showListing = false;
        }
      }
      
      listing.classList.toggle('hidden', !showListing);
    });
    
    this.#updateNoResultsMessage();
  }

  #updateNoResultsMessage() {
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
    
    const existingNoResults = listingContainer.querySelector('.no-results');
    if (existingNoResults) {
      listingContainer.removeChild(existingNoResults);
    }
    
    listings.sort((a, b) => {
      const dateA = new Date(a.querySelector('.date')?.textContent || 
                            a.getAttribute('data-date') || 0);
      const dateB = new Date(b.querySelector('.date')?.textContent ||
                            b.getAttribute('data-date') || 0);
      
      return dateB - dateA;
    });
    
    listings.forEach(listing => listingContainer.appendChild(listing));
  }
    
  #sortListingsByRelevance(query) {
    query = query.toLowerCase();
    
    const listingContainer = document.querySelector('.listing-container');
    const listings = listingContainer.querySelectorAll('.listing:not(.hidden)');
    
    if (!query.trim()) {
      const existingNoResults = listingContainer.querySelector('.no-results');
      if (existingNoResults) {
        listingContainer.removeChild(existingNoResults);
      }
      return;
    }
    
    const listingScores = [];
    
    listings.forEach(listing => {
      const title = listing.querySelector('.title')?.textContent.toLowerCase() || '';
      const category = listing.querySelector('.category')?.textContent.toLowerCase() || '';
      const location = listing.querySelector('.location')?.textContent.toLowerCase() || '';
      const description = listing.querySelector('.description')?.textContent.toLowerCase() || '';
      
      let score = 0;
      if (title.includes(query)) score += 3;
      if (category.includes(query)) score += 2;
      if (location.includes(query)) score += 2;
      if (description.includes(query)) score += 1;
      
      listingScores.push({ listing, score });
    });
    
    listingScores.sort((a, b) => b.score - a.score);
    
    listingScores.forEach(item => {
      listingContainer.appendChild(item.listing);
    });
    
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
        this.#createListingElement(post);
      }
    } catch (error) {
      console.error("Error rendering listings:", error);
      
      if (this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="error-message">Failed to load listings. Please try again later.</div>';
      }
    }
  }

  #addNewPost(post) {
    if (!this.#listingContainer) return;

    this.#createListingElement(post, true);
    this.#updateFiltersForNewPost(post);
    this.#applyFilters();
    
    const dateRadio = document.getElementById('date-posted');
    if (dateRadio && dateRadio.checked) {
      this.#sortListingsByDate();
    }
  }

  #createListingElement(post, addToBeginning = false) {
    if (!this.#listingContainer) return;
    
    const listing = document.createElement("div");
    listing.classList.add("listing");
    listing.id = post.id;
    listing.style.cursor = 'pointer';
    
    listing.addEventListener('click', (e) => {
      if (!e.target.classList.contains('report-button')) {
        EventHub.getEventHubInstance().publish(Events.ViewPost, post);
      }
    });

    // Create listing content
    const elements = [
      { tag: "h3", className: "title", text: post.title || "Not Supplied" },
      { tag: "p", label: "Date found: ", className: "date", text: post.date || "Not supplied" },
      { tag: "p", label: "Description: ", className: "description", text: post.description || "Not supplied" },
      { tag: "p", label: "Tags: ", className: "tags", 
        text: post.tags && post.tags.length > 0 ? post.tags.join(", ") : "Not supplied" },
      { tag: "p", label: "Location: ", className: "location", text: post.location || "Not supplied" }
    ];
    
    // Add content elements to listing
    elements.forEach(el => {
      const wrapper = document.createElement(el.tag);
      if (el.tag === "h3") {
        const value = document.createElement("span");
        value.classList.add(el.className);
        value.textContent = el.text;
        wrapper.appendChild(value);
      } else {
        wrapper.textContent = el.label;
        const value = document.createElement("span");
        value.classList.add(el.className);
        value.textContent = el.text;
        wrapper.appendChild(value);
      }
      listing.appendChild(wrapper);
    });
    
    // Add report button
    const reportBtn = document.createElement("button");
    reportBtn.classList.add("report-button");
    reportBtn.textContent = "Report Listing";
    reportBtn.dataset.item = post.title;
    reportBtn.addEventListener('click', () => this.#openReportModal(post.title));
    listing.appendChild(reportBtn);
    
    // Add to container
    if (addToBeginning && this.#listingContainer.firstChild) {
      this.#listingContainer.insertBefore(listing, this.#listingContainer.firstChild);
    } else {
      this.#listingContainer.appendChild(listing);
    }
    
    return listing;
  }

  #updateFiltersForNewPost(post) {
    // Update tag filters if needed
    if (post.tags && post.tags.length > 0) {
      const tagFilters = document.getElementById('tag-filters');
      this.#updateFilterOptions(tagFilters, post.tags);
    }

    // Update location filters if needed
    if (post.location) {
      const locationFilters = document.getElementById('location-filters');
      this.#updateFilterOptions(locationFilters, [post.location]);
    }
  }

  #updateFilterOptions(container, newValues) {
    if (!container) return;
    
    newValues.forEach(value => {
      // Check if filter already exists
      const existingFilter = container.querySelector(`input[value="${value}"]`);
      if (!existingFilter) {
        const filterId = container.id;
        
        const filterOption = document.createElement('div');
        filterOption.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.id = `${filterId}-${value.toLowerCase().replace(/\s+/g, '-')}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', () => this.#applyFilters());
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = value;
        
        filterOption.append(checkbox, label);
        container.appendChild(filterOption);
      }
    });
  }
}