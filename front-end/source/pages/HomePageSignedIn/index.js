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
    this.#setupContainerContent();
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
    const elements = {
      overlay: document.getElementById('report-overlay'),
      modal: document.getElementById('report-modal'),
      item: document.getElementById('report-item-name'),
      reason: document.getElementById('report-reason')
    };
    
    if (Object.values(elements).every(el => el)) {
      elements.item.textContent = `Item: ${itemTitle}`;
      elements.reason.value = '';
      elements.overlay.style.display = 'block';
      elements.modal.style.display = 'block';
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
      const itemTitle = itemElement.textContent.replace('Item: ', '');
      
      if (!reason) {
        alert('Please provide a reason for reporting this listing.');
        return;
      }

      // Find the post by title
      const postElement = Array.from(this.#listingContainer.querySelectorAll('.listing'))
        .find(listing => listing.querySelector('.title')?.textContent === itemTitle);

      if (!postElement) {
        alert('Could not find the post to report.');
        return;
      }

      const post_id = postElement.id;
      const reported_by = localStorage.getItem('userId') || '101';

      // Send report to server
      fetch('http://localhost:3000/api/admin/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          post_id,
          reason,
          reported_by
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Publish the NewReport event with the report data
          EventHub.getEventHubInstance().publish(Events.NewReport, data.data);
          alert('Post reported successfully');
        } else {
          throw new Error(data.message || 'Failed to report post');
        }
      })
      .catch(error => {
        console.error('Error reporting post:', error);
        alert('Failed to report post. Please try again later.');
      });
      
      this.#closeReportModal();
    }
  }

  #setupContainerContent() {
    if (!this.#container) return;
    
    const sidebar = this.#createSidebar();
    
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";
    
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
    const sortBySection = this.#createSortBySection();
    
    // Create filters section
    const filtersSection = document.createElement("div");
    filtersSection.className = "filters";
    
    const filtersTitle = document.createElement("h3");
    filtersTitle.textContent = "Filters";
    
    // Create filter groups
    const locationFilterGroup = this.#createFilterGroup("Location", "location-filters");
    const tagFilterGroup = this.#createFilterGroup("Tags", "tag-filters");
    
    filtersSection.append(filtersTitle, locationFilterGroup, tagFilterGroup);
    sidebar.append(sortBySection, filtersSection);
    
    return sidebar;
  }

  #createSortBySection() {
    const sortBySection = document.createElement("div");
    sortBySection.className = "sort-by";
    
    const sortTitle = document.createElement("h3");
    sortTitle.textContent = "Sort By";
    
    // Helper function to create radio buttons
    const createRadio = (id, label, checked = false) => {
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = id;
      radio.name = "sort";
      radio.value = id;
      radio.checked = checked;
      
      const labelElement = document.createElement("label");
      labelElement.htmlFor = id;
      labelElement.textContent = label;
      
      return [radio, labelElement];
    };
    
    const [dateRadio, dateLabel] = createRadio("date-posted", "Date Posted", true);
    const lineBreak = document.createElement("br");
    const [relevanceRadio, relevanceLabel] = createRadio("relevance", "Relevance");
    
    sortBySection.append(sortTitle, dateRadio, dateLabel, lineBreak, relevanceRadio, relevanceLabel);
    return sortBySection;
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
      
      const loadingIndicator = this.#listingContainer?.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="error-message">Failed to load content. Please try again later.</div>';
      }
    }
  }

  #attachEventListeners() {
    const hub = EventHub.getEventHubInstance();
    document.addEventListener('search-query', (e) => this.#sortListingsByRelevance(e.detail.query));
    hub.subscribe(Events.NewPost, (newPost) => this.#addNewPost(newPost));
    
    // Subscribe to post update events to refresh listings when a post is edited
    hub.subscribe(Events.PostUpdated, () => {
      // Refresh the listings when a post is updated
      this.#renderListings();
    });
  }

  #initializeSorting() {
    const dateRadio = document.getElementById('date-posted');
    const relevanceRadio = document.getElementById('relevance');
    
    dateRadio?.addEventListener('change', () => {
      if (dateRadio.checked) this.#sortListingsByDate();
    });
    
    relevanceRadio?.addEventListener('change', () => {
      if (relevanceRadio.checked) {
        const searchBox = document.querySelector('.search-form input');
        const query = searchBox?.value?.trim() || '';
        if (query) this.#sortListingsByRelevance(query);
      }
    });
    
    if (dateRadio) {
      dateRadio.checked = true;
      this.#sortListingsByDate();
    }
  }

  #checkForSearchQuery() {
    const searchQuery = new URLSearchParams(window.location.search).get('search');
    if (searchQuery) {
      const relevanceRadio = document.getElementById('relevance');
      if (relevanceRadio) relevanceRadio.checked = true;
      this.#sortListingsByRelevance(searchQuery);
    }
  }

  #setupToggleButtons() {
    ['location-filters', 'tag-filters'].forEach(filterId => {
      const toggleBtn = document.getElementById(`toggle-${filterId}`);
      toggleBtn?.addEventListener('click', () => this.#toggleFilters(filterId));
    });
  }

  #toggleFilters(filterId) {
    const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
    const shouldCheck = Array.from(checkboxes).filter(checkbox => checkbox.checked).length === 0;
    checkboxes.forEach(checkbox => checkbox.checked = shouldCheck);
    this.#applyFilters();
  }

  async #initializeFilters() {
    try {
      const response = await fetch('http://localhost:3000/api/posts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter data: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const posts = responseData.data || []; // Access the data property from the response
      
      const locations = new Set();
      const tags = new Set();
      
      posts.forEach(post => {
        if (post.location) locations.add(post.location);
        
        if (post.tags?.length) {
          post.tags.forEach(tag => tag && tags.add(tag));
        }
      });
      
      this.#populateFilterOptions('location-filters', Array.from(locations));
      this.#populateFilterOptions('tag-filters', Array.from(tags));
      
      document.querySelectorAll('.filter-option input[type="checkbox"]')
        .forEach(checkbox => checkbox.addEventListener('change', () => this.#applyFilters()));
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
    
    // Helper function to get selected values
    const getSelectedValues = (selector) => Array.from(
      document.querySelectorAll(selector)
    ).map(input => input.value);
    
    const selectedLocations = getSelectedValues('#location-filters .filter-option input:checked');
    const selectedTags = getSelectedValues('#tag-filters .filter-option input:checked');
    
    const locationFilterActive = document.querySelectorAll('#location-filters .filter-option input').length > 0;
    const tagFilterActive = document.querySelectorAll('#tag-filters .filter-option input').length > 0;
    
    listings.forEach(listing => {
      let showListing = true;
      
      // Location filter
      if (locationFilterActive && selectedLocations.length === 0) {
        showListing = false;
      } else if (selectedLocations.length > 0) {
        const locationText = listing.querySelector('.location')?.textContent.trim() || '';
        if (!selectedLocations.includes(locationText)) {
          showListing = false;
        }
      }
      
      // Tag filter
      if (showListing && tagFilterActive && selectedTags.length === 0) {
        showListing = false;
      } else if (showListing && selectedTags.length > 0) {
        const tagsText = listing.querySelector('.tags')?.textContent.trim() || '';
        if (tagsText === "Not supplied") {
          showListing = false;
        } else {
          const listingTags = tagsText.split(',').map(tag => tag.trim());
          if (!listingTags.some(tag => selectedTags.includes(tag))) {
            showListing = false;
          }
        }
      }
      
      listing.classList.toggle('hidden', !showListing);
    });
    
    this.#updateNoResultsMessage();
  }

  #updateNoResultsMessage() {
    const listingContainer = document.querySelector('.listing-container');
    if (!listingContainer) return;
    
    const visibleListings = listingContainer.querySelectorAll('.listing:not(.hidden)');
    const existingNoResults = listingContainer.querySelector('.no-results');
    
    if (visibleListings.length === 0) {
      if (!existingNoResults) {
        listingContainer.appendChild(this.#createMessageElement('No items match your filters.', 'no-results'));
      }
    } else if (existingNoResults) {
      existingNoResults.remove();
    }
  }

  #createMessageElement(message, className) {
    const element = document.createElement('div');
    element.className = className;
    element.textContent = message;
    return element;
  }

  #sortListingsByDate() {
    const listingContainer = document.querySelector('.listing-container');
    if (!listingContainer) return;
    
    const listings = Array.from(listingContainer.querySelectorAll('.listing:not(.hidden)'));
    listingContainer.querySelector('.no-results')?.remove();
    
    listings.sort((a, b) => {
      const dateA = new Date(a.querySelector('.date')?.textContent || a.getAttribute('data-date') || 0);
      const dateB = new Date(b.querySelector('.date')?.textContent || b.getAttribute('data-date') || 0);
      return dateB - dateA;
    });
    
    listings.forEach(listing => listingContainer.appendChild(listing));
  }
    
  #sortListingsByRelevance(query) {
    if (!query?.trim()) return;
    
    query = query.toLowerCase();
    const listingContainer = document.querySelector('.listing-container');
    if (!listingContainer) return;
    
    const listings = listingContainer.querySelectorAll('.listing:not(.hidden)');
    listingContainer.querySelector('.no-results')?.remove();
    
    const listingScores = Array.from(listings).map(listing => {
      const title = listing.querySelector('.title')?.textContent.toLowerCase() || '';
      const category = listing.querySelector('.category')?.textContent.toLowerCase() || '';
      const location = listing.querySelector('.location')?.textContent.toLowerCase() || '';
      const description = listing.querySelector('.description')?.textContent.toLowerCase() || '';
      
      let score = 0;
      if (title.includes(query)) score += 3;
      if (category.includes(query)) score += 2;
      if (location.includes(query)) score += 2;
      if (description.includes(query)) score += 1;
      
      return { listing, score };
    });
    
    listingScores
      .sort((a, b) => b.score - a.score)
      .forEach(item => listingContainer.appendChild(item.listing));
    
    if (listings.length === 0) {
      listingContainer.appendChild(
        this.#createMessageElement('No items match your search and filters.', 'no-results')
      );
    }
  }
  
  async #renderListings() {
    try {
      const response = await fetch('http://localhost:3000/api/posts');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const posts = responseData.data || []; // Access the data property from the response
      
      if (this.#listingContainer) {
        const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
        this.#listingContainer.innerHTML = '';
        if (loadingIndicator) {
          this.#listingContainer.appendChild(loadingIndicator);
        }
      }
      
      posts.forEach(post => this.#createListingElement(post));

      // If no posts are found
      if (posts.length === 0 && this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="no-posts-message">No posts found.</div>';
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
    if (dateRadio?.checked) {
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

    // Add image if available
    if (post.image) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "image-container";
      const img = document.createElement("img");
      img.src = post.image;
      img.alt = post.title || "Posted item";
      imageContainer.appendChild(img);
      listing.appendChild(imageContainer);
    }

    const elements = [
      { tag: "h3", className: "title", text: post.title || "Not Supplied" },
      { tag: "p", label: "Date found: ", className: "date", text: post.date || "Not supplied" },
      { tag: "p", label: "Description: ", className: "description", text: post.description || "Not supplied" },
      { tag: "p", label: "Tags: ", className: "tags", 
        text: post.tags?.length > 0 ? post.tags.join(", ") : "Not supplied" },
      { tag: "p", label: "Location: ", className: "location", text: post.location || "Not supplied" }
    ];
    
    elements.forEach(el => {
      const wrapper = document.createElement(el.tag);
      if (el.tag === "h3") {
        wrapper.appendChild(this.#createSpan(el.className, el.text));
      } else {
        wrapper.textContent = el.label;
        wrapper.appendChild(this.#createSpan(el.className, el.text));
      }
      listing.appendChild(wrapper);
    });
    
    const reportBtn = document.createElement("button");
    reportBtn.classList.add("report-button");
    reportBtn.textContent = "Report Listing";
    reportBtn.addEventListener('click', () => this.#openReportModal(post.title));
    listing.appendChild(reportBtn);
    
    if (addToBeginning && this.#listingContainer.firstChild) {
      this.#listingContainer.insertBefore(listing, this.#listingContainer.firstChild);
    } else {
      this.#listingContainer.appendChild(listing);
    }
    
    return listing;
  }

  #createSpan(className, text) {
    const span = document.createElement("span");
    span.classList.add(className);
    span.textContent = text;
    return span;
  }

  #updateFiltersForNewPost(post) {
    if (post.tags?.length > 0) {
      this.#updateFilterOptions(document.getElementById('tag-filters'), post.tags);
    }

    if (post.location) {
      this.#updateFilterOptions(document.getElementById('location-filters'), [post.location]);
    }
  }

  #updateFilterOptions(container, newValues) {
    if (!container) return;
    
    newValues.forEach(value => {
      const existingFilter = container.querySelector(`input[value="${value}"]`);
      if (!existingFilter) {
        const filterId = container.id;
        const filterOption = document.createElement('div');
        filterOption.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.id = `${filterId}-${value.replace(/\s+/g, '-').toLowerCase()}`;
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