import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class AdminPage extends BasePage {
  #container = null;
  #listingContainer = null;

  constructor() {
    super();
    this.loadCSS("pages/AdminPage", "AdminPage");
  }

  render() {
    document.body.className = 'admin-link';
  
    if (this.#container) {
      setTimeout(() => this.#checkForSearchQuery(), 0);
      return this.#container;
    }
  
    this.#container = document.createElement("div");
    this.#container.className = "page-container";
  
    this.#createAdminModal();
    this.#setupContainerContent();
    this.#attachEventListeners();
    this.#loadData();
  
    this.#loadCommentsFromIndexedDB();
  
    return this.#container;
  }

  #createAdminModal() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'report-overlay';
  
    const modal = document.createElement('div');
    modal.className = 'modal';
  
    // Add a close button (X) to the modal
    const closeButton = document.createElement('button');
    closeButton.className = 'close';
    closeButton.textContent = '×'; // Unicode for the "X" symbol
    closeButton.addEventListener('click', () => this.#closeAdminModal());
    modal.appendChild(closeButton);
  
    overlay.appendChild(modal);
  
    // Add event listener to the overlay to close the modal when clicked
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.#closeAdminModal();
      }
    });
  
    document.body.appendChild(overlay);
  }

  #openAdminModal(postTitle) {
    fetch('/front-end/source/Fake-Server/server.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(async (data) => {
        const post = data.posts.find(p => p.title === postTitle);
  
        const overlay = document.getElementById('report-overlay');
        const modal = overlay.querySelector('.modal');
  
        modal.innerHTML = ''; // Clear any existing content
  
        // Add the close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => this.#closeAdminModal());
        modal.appendChild(closeButton);
  
        // Add post details
        const postDetails = document.createElement('div');
        postDetails.className = 'post-details';
        postDetails.innerHTML = `
          <h3>${post.title}</h3>
          <p><strong>Description:</strong> ${post.description || 'Not supplied'}</p>
        `;
        modal.appendChild(postDetails);
  
        // Add notes section
        const notesSection = document.createElement('div');
        notesSection.className = 'notes-section';
  
        const notesTitle = document.createElement('h4');
        notesTitle.textContent = 'Notes';
        notesSection.appendChild(notesTitle);
  
        const notesDisplay = document.createElement('p');
        notesDisplay.className = 'notes-display';
        notesSection.appendChild(notesDisplay);
  
        const notesTextBox = document.createElement('textarea');
        notesTextBox.className = 'notes-textbox';
        notesTextBox.style.display = 'none';
        notesSection.appendChild(notesTextBox);
  
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'notes-buttons';
  
        // Create the Comment button
        const commentButton = document.createElement('button');
        commentButton.textContent = 'Comment';
        commentButton.addEventListener('click', () => {
          notesTextBox.style.display = 'block';
          commentButton.style.display = 'none'; // Hide the Comment button
          saveButton.style.display = 'inline-block'; // Show Save button
          editButton.style.display = 'inline-block'; // Show Edit button
          cancelButton.style.display = 'inline-block'; // Show Cancel button
          notesTextBox.value = notesDisplay.textContent || '';
          notesTextBox.focus();
        });
  
        // Create the Save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.display = 'none'; // Initially hidden
        saveButton.addEventListener('click', async () => {
          const note = notesTextBox.value.trim();
          if (note) {
            await this.#saveNoteToIndexedDB(post.id, note);
            notesDisplay.textContent = note;
            notesTextBox.style.display = 'none';
            commentButton.style.display = 'inline-block'; // Show Comment button
            saveButton.style.display = 'none'; // Hide Save button
            editButton.style.display = 'none'; // Hide Edit button
            cancelButton.style.display = 'none'; // Hide Cancel button
  
            // Update the corresponding post element on the main page
            const postElement = document.getElementById(`post-${post.id}`);
            if (postElement) {
              let commentElement = postElement.querySelector('.post-comment');
              if (!commentElement) {
                commentElement = document.createElement('p');
                commentElement.className = 'post-comment';
                postElement.appendChild(commentElement);
              }
              commentElement.textContent = `Comment: ${note}`;
            }
          }
        });
  
        // Create the Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.display = 'none'; // Initially hidden
        editButton.addEventListener('click', () => {
          notesTextBox.style.display = 'block';
          notesTextBox.value = notesDisplay.textContent || '';
          notesTextBox.focus();
        });
  
        // Create the Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.display = 'none'; // Initially hidden
        cancelButton.addEventListener('click', () => {
          notesTextBox.style.display = 'none';
          commentButton.style.display = 'inline-block'; // Show Comment button
          saveButton.style.display = 'none'; // Hide Save button
          editButton.style.display = 'none'; // Hide Edit button
          cancelButton.style.display = 'none'; // Hide Cancel button
        });
  
        // Create the Exit button
        const exitButton = document.createElement('button');
        exitButton.textContent = 'Exit';
        exitButton.addEventListener('click', () => {
          this.#closeAdminModal(); // Close the modal
        });
  
        // Create the Keep button
        const keepButton = document.createElement('button');
        keepButton.textContent = 'Keep';
        keepButton.className = 'keep-button';
        keepButton.addEventListener('click', () => {
          this.#keepPost(post.id); 
          this.#closeAdminModal(); 
        });
  
        // Create the Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => {
          this.#deletePost(post.id); 
        });
  
        // Append buttons to the container
        buttonContainer.append(
          commentButton,
          saveButton,
          editButton,
          cancelButton,
          exitButton,
          keepButton,
          deleteButton
        );
        notesSection.appendChild(buttonContainer);
  
        // Load the saved note from IndexedDB
        const savedNote = await this.#getNoteFromIndexedDB(post.id);
        if (savedNote) {
          notesDisplay.textContent = savedNote.note;
  
          // Update the corresponding post element on the main page
          const postElement = document.getElementById(post.id);
          if (postElement) {
            let commentElement = postElement.querySelector('.post-comment');
            if (!commentElement) {
              commentElement = document.createElement('p');
              commentElement.className = 'post-comment';
              postElement.appendChild(commentElement);
            }
            commentElement.textContent = `Comment: ${savedNote.note}`;
          }
        } else {
          notesDisplay.textContent = 'No notes available.';
        }
  
        modal.appendChild(notesSection);
  
        // Show the modal
        overlay.style.display = 'block';
        modal.style.display = 'block';
      })
      .catch(error => {
        console.error('Error fetching post or report data:', error);
      });
  }

  #closeAdminModal() {
    const overlay = document.getElementById('report-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  //PARTIALLY COMPLETE. WILL BE USED IN A MILESTONE USING BACKEND
  #keepPost(postId) {
    // Remove the post from the Administration Page
    const postElement = document.getElementById(postId);
    if (postElement) {
      postElement.remove();
    }
  
    // Display a confirmation message
    alert(`Post with ID ${postId} has been kept and removed from the Administration Page.`);
  }
  #deletePost(postId) {
    // Fetch the current data from server.json
    fetch('/front-end/source/Fake-Server/server.json')
      .then(response => response.json())
      .then(data => {
        // Remove the post and its associated report
        const updatedPosts = data.posts.filter(post => post.id !== postId);
        const updatedReports = data.reports.filter(report => report.post_id !== postId);
  
        // Simulate saving the updated data back to the server
        console.log('Updated posts:', updatedPosts);
        console.log('Updated reports:', updatedReports);
  
        alert(`Post with ID ${postId} has been deleted.`);
  
        // Remove the post from the Administration Page
        const postElement = document.getElementById(postId);
        if (postElement) {
          postElement.remove();
        }
      })
      .catch(error => {
        console.error('Error deleting post:', error);
      });
  
    // Close the modal
    this.#closeAdminModal();
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
    
    const sortBySection = this.#createSortBySection();
    
    const filtersSection = document.createElement("div");
    filtersSection.className = "filters";
    
    const filtersTitle = document.createElement("h3");
    filtersTitle.textContent = "Filters";
    
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
      const response = await fetch('/front-end/source/Fake-Server/server.json');
      const data = await response.json();
      const posts = data.posts;
      
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
      const response = await fetch('/front-end/source/Fake-Server/server.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      
      const json_data = await response.json();
      const posts = json_data.posts;
      const reports = json_data.reports;
  
      // Associate reports with posts
      const postsWithReports = posts.map(post => {
        post.reports = reports.filter(report => report.post_id === post.id);
        return post;
      });
  
      if (this.#listingContainer) {
        const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
        this.#listingContainer.innerHTML = '';
        if (loadingIndicator) {
          this.#listingContainer.appendChild(loadingIndicator);
        }
      }
  
      postsWithReports.forEach(post => this.#createListingElement(post));
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
  
    // Add event listener to the listing itself
    listing.addEventListener('click', (e) => {
      if (!e.target.classList.contains('view-button')) {
        EventHub.getEventHubInstance().publish(Events.ViewPost, post);
      }
    });
  
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
  
    // Create the "View Item" button
    const viewButton = document.createElement("button");
    viewButton.classList.add("view-button");
    viewButton.textContent = "View Item";
  
    // Add event listener to the button to open the modal
    viewButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent the event from propagating to the parent element
      e.preventDefault(); // Prevent any default behavior
      this.#openAdminModal(post.title); // Open the modal window
    });
  
    listing.appendChild(viewButton);
  
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

  //FEATURE TO BE FULLY IMPLEMENTED IN FUTURE MILESTONE WITH BACKEND
  async #saveNoteToIndexedDB(postId, note) {
    const db = await this.#openNotesDatabase();
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    store.put({ postId, note });
    return transaction.complete;
  }
  
  async #getNoteFromIndexedDB(postId) {
    const db = await this.#openNotesDatabase();
    const transaction = db.transaction('notes', 'readonly');
    const store = transaction.objectStore('notes');
    return store.get(postId);
  }
  
  async #openNotesDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AdminPageNotesDB', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'postId' });
        }
      };
  
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
  
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }
  async #loadCommentsFromIndexedDB() {
    const db = await this.#openNotesDatabase();
    const transaction = db.transaction('notes', 'readonly');
    const store = transaction.objectStore('notes');
    const allNotes = await store.getAll();
  
    allNotes.forEach(note => {
      const postElement = document.getElementById(`post-${note.postId}`);
      if (postElement) {
        let commentElement = postElement.querySelector('.post-comment');
        if (!commentElement) {
          commentElement = document.createElement('p');
          commentElement.className = 'post-comment';
          postElement.appendChild(commentElement);
        }
        commentElement.textContent = `Comment: ${note.note}`;
      }
    });
  }
}