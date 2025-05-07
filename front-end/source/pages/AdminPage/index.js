import { BasePage } from "../BasePage/BasePage.js";
import { EventHub } from "../../eventHub/EventHub.js";
import { Events } from "../../eventHub/Events.js";

export class AdminPage extends BasePage {
  #container = null;
  #listingContainer = null;
  #apiBaseUrl = 'http://localhost:3000/api';
  #selectedPost = null;

  constructor() {
    super();
    this.loadCSS("pages/AdminPage", "AdminPage");
  }

  render() {
    document.body.className = 'admin-page';
    
    if (this.#container) {
      setTimeout(() => this.#checkForSearchQuery(), 0);
      return this.#container;
    }
    
    this.#container = document.createElement("div");
    this.#container.className = "page-container";
    
    this.#createModal();
    this.#setupContainerContent();
    this.#attachEventListeners();
    this.#loadData();

    return this.#container;
  }

  // Helper function to create DOM elements with attributes
  #createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Apply attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Append children
    children.forEach(child => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (child !== null && child !== undefined) {
        element.appendChild(document.createTextNode(String(child)));
      }
    });
    
    return element;
  }

  #createModal() {
    const overlay = this.#createElement('div', { 
      className: 'overlay', 
      id: 'admin-overlay', 
      style: { display: 'none' } 
    });
    
    const modal = this.#createElement('div', { 
      className: 'modal', 
      id: 'admin-modal', 
      style: { display: 'none' } 
    });
    
    const close = this.#createElement('span', { 
      className: 'close', 
      innerHTML: '&times;', 
      onClick: () => this.#closeModal() 
    });
    
    const content = this.#createElement('div', { 
      className: 'modal-content', 
      id: 'admin-modal-content' 
    });
    
    modal.append(close, content);
    this.#container.append(overlay, modal);
  }

  #openModal(post) {
    this.#selectedPost = post;
    const elements = {
      overlay: document.getElementById('admin-overlay'),
      modal: document.getElementById('admin-modal'),
      content: document.getElementById('admin-modal-content')
    };
    
    if (!Object.values(elements).every(el => el)) return;
    
    elements.content.innerHTML = '';
    
    // Create modal content using our helper function
    const title = this.#createElement('h3', { 
      className: 'title', 
      textContent: post.title || "Not Supplied" 
    });

    const details = [
      { label: "Date Reported: ", text: new Date(post.reportedAt).toLocaleDateString(), className: 'date' },
      { label: "Description: ", text: post.description || "Not supplied", className: 'description' },
      { label: "Report Reason: ", text: post.reportReason || "Not supplied", className: 'reason' },
      { label: "Location: ", text: post.location || "Not supplied", className: 'location' },
      { label: "Status: ", text: post.reportStatus || "Pending", className: 'status' }
    ];

    const detailsElements = details.map(detail => {
      const span = this.#createElement('span', { 
        className: detail.className, 
        textContent: detail.text 
      });
      
      return this.#createElement('p', { textContent: detail.label }, [span]);
    });

    // Create comments section
    const commentsSection = this.#createCommentsSection(post);

    // Action buttons
    const actionButtons = this.#createActionButtons(post);

    elements.content.append(title, ...detailsElements, commentsSection, actionButtons);

    elements.overlay.style.display = 'block';
    elements.modal.style.display = 'block';

    this.#loadComments(post.id);
  }

  #createCommentsSection(post) {
    // Comments section
    const commentsSection = this.#createElement('div', { className: 'comments-section' });
    
    const commentsTitle = this.#createElement('h4', { textContent: 'Admin Comments' });
    
    const commentsList = this.#createElement('div', { 
      className: 'comments-list', 
      id: `comments-${post.id}` 
    });

    // Add comment form
    const commentForm = this.#createElement('div', { 
      className: 'comment-form', 
      style: { display: 'none' } 
    });

    const commentInput = this.#createElement('textarea', { 
      className: 'comment-input', 
      placeholder: 'Add an admin comment...' 
    });

    const addCommentBtn = this.#createElement('button', { 
      className: 'add-comment-button', 
      textContent: 'Add Comment', 
      onClick: () => {
        commentForm.style.display = 'block';
        addCommentBtn.style.display = 'none';
      }
    });

    // Create comment action buttons
    const saveCommentBtn = this.#createElement('button', { 
      className: 'save-comment-button', 
      textContent: 'Save Comment', 
      onClick: () => {
        this.#addComment(post.id, commentInput.value);
        commentForm.style.display = 'none';
        addCommentBtn.style.display = 'block';
      }
    });

    const cancelCommentBtn = this.#createElement('button', { 
      className: 'cancel-comment-button', 
      textContent: 'Cancel', 
      onClick: () => {
        commentForm.style.display = 'none';
        addCommentBtn.style.display = 'block';
        commentInput.value = '';
      }
    });

    const commentBtns = this.#createElement('div', { className: 'comment-buttons' }, [
      saveCommentBtn, cancelCommentBtn
    ]);

    commentForm.append(commentInput, commentBtns);
    commentsSection.append(commentsTitle, commentsList, addCommentBtn, commentForm);
    
    return commentsSection;
  }

  #createActionButtons(post) {
    const actionButtons = this.#createElement('div', { className: 'action-buttons' });

    const keepButton = this.#createElement('button', { 
      className: 'keep-button', 
      textContent: 'Keep Post', 
      onClick: () => this.#keepPost(post.id) 
    });

    const deleteButton = this.#createElement('button', { 
      className: 'delete-button', 
      textContent: 'Delete Post', 
      onClick: () => {
        if (confirm('Are you sure you want to delete this post?')) {
          this.#deletePost(post.id);
        }
      }
    });

    actionButtons.append(keepButton, deleteButton);
    return actionButtons;
  }

  #closeModal() {
    const overlay = document.getElementById('admin-overlay');
    const modal = document.getElementById('admin-modal');
    
    if (overlay && modal) {
      overlay.style.display = 'none';
      modal.style.display = 'none';
      this.#selectedPost = null;
    }
  }

  #setupContainerContent() {
    if (!this.#container) return;
    
    const sidebar = this.#createSidebar();
    
    const mainContent = this.#createElement('div', { className: 'main-content' });
    
    this.#listingContainer = this.#createElement('div', { className: 'listing-container' });
    
    const loadingIndicator = this.#createElement('div', { 
      className: 'loading-indicator',
      textContent: 'Loading reported items...'
    });
    
    this.#listingContainer.appendChild(loadingIndicator);
    mainContent.appendChild(this.#listingContainer);
    this.#container.append(sidebar, mainContent);
  }

  #createSidebar() {
    const sidebar = this.#createElement('div', { className: 'sidebar' });
    
    // Create sort-by section
    const sortBySection = this.#createSortBySection();
    
    // Create filters section
    const filtersSection = this.#createElement('div', { className: 'filters' });
    
    const filtersTitle = this.#createElement('h3', { textContent: 'Filters' });
    
    // Create filter groups
    const filterGroups = ['Status', 'Location', 'Report Reason'].map(title => {
      const id = title.toLowerCase().replace(/\s+/g, '-') + '-filters';
      return this.#createFilterGroup(title, id);
    });
    
    filtersSection.append(filtersTitle, ...filterGroups);
    sidebar.append(sortBySection, filtersSection);
    
    return sidebar;
  }

  #createSortBySection() {
    const sortBySection = this.#createElement('div', { className: 'sort-by' });
    const sortTitle = this.#createElement('h3', { textContent: 'Sort By' });
    
    // Create radio inputs for sorting
    const createRadio = (id, label, checked = false) => {
      const radio = this.#createElement('input', { 
        type: 'radio', 
        id, 
        name: 'sort', 
        value: id,
        checked 
      });
      
      const labelElement = this.#createElement('label', { 
        htmlFor: id, 
        textContent: label 
      });
      
      return [radio, labelElement];
    };
    
    const [dateRadio, dateLabel] = createRadio('date-posted', 'Date Posted', true);
    const [relevanceRadio, relevanceLabel] = createRadio('relevance', 'Relevance');
    
    sortBySection.append(
      sortTitle, 
      dateRadio, 
      dateLabel, 
      this.#createElement('br'), 
      relevanceRadio, 
      relevanceLabel
    );
    
    return sortBySection;
  }

  #createFilterGroup(title, filterId) {
    const filterGroup = this.#createElement('div', { className: 'filter-group' });
    
    const filterTitle = this.#createElement('h4', { 
      className: 'filter-section-title', 
      textContent: title 
    });
    
    const filterHeader = this.#createElement('div', { className: 'filter-header' });
    
    const toggleButton = this.#createElement('button', { 
      className: 'toggle-filter', 
      id: `toggle-${filterId}`, 
      textContent: 'Toggle' 
    });
    
    const filterOptions = this.#createElement('div', { 
      className: 'filter-options', 
      id: filterId 
    });
    
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
    
    // Subscribe to NewReport events
    hub.subscribe(Events.NewReport, () => {
      // Fetch updated reports and re-initialize filters
      this.#renderListings();
      this.#initializeFilters();
    });
  }

  #initializeSorting() {
    const sortingElements = {
      dateRadio: document.getElementById('date-posted'),
      relevanceRadio: document.getElementById('relevance')
    };
    
    sortingElements.dateRadio?.addEventListener('change', () => {
      if (sortingElements.dateRadio.checked) this.#sortListingsByDate();
    });
    
    sortingElements.relevanceRadio?.addEventListener('change', () => {
      if (sortingElements.relevanceRadio.checked) {
        const searchBox = document.querySelector('.search-form input');
        const query = searchBox?.value?.trim() || '';
        if (query) this.#sortListingsByRelevance(query);
      }
    });
    
    if (sortingElements.dateRadio) {
      sortingElements.dateRadio.checked = true;
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
    ['status-filters', 'location-filters', 'reason-filters'].forEach(filterId => {
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

  // Fetch data from API with error handling
  async #fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.#apiBaseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  }

  async #initializeFilters() {
    try {
      const responseData = await this.#fetchData('/admin/reports');
      const reports = responseData.data || [];
      
      const dataCollectors = {
        locations: new Set(),
        statuses: new Set(['pending', 'dismissed']),
        reasons: new Set()
      };
      
      reports.forEach(report => {
        if (report.location) dataCollectors.locations.add(report.location);
        if (report.status) dataCollectors.statuses.add(report.status);
        if (report.reportReason) dataCollectors.reasons.add(report.reportReason);
      });
      
      this.#populateFilterOptions('location-filters', Array.from(dataCollectors.locations));
      this.#populateFilterOptions('status-filters', Array.from(dataCollectors.statuses));
      this.#populateFilterOptions('reason-filters', Array.from(dataCollectors.reasons));
      
      document.querySelectorAll('.filter-option input[type="checkbox"]')
        .forEach(checkbox => checkbox.addEventListener('change', () => this.#applyFilters()));
    } catch (error) {
      console.error('Error initializing filters:', error);
    }
  }

  #populateFilterOptions(containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Clear existing options for refresh scenarios
    
    options.forEach(option => {
      const optionId = `${containerId}-${option.replace(/\s+/g, '-').toLowerCase()}`;
      
      const checkbox = this.#createElement('input', {
        type: 'checkbox',
        value: option,
        id: optionId,
        checked: true
      });
      
      const label = this.#createElement('label', {
        htmlFor: optionId,
        textContent: option
      });
      
      const filterOption = this.#createElement('div', 
        { className: 'filter-option' }, 
        [checkbox, label]
      );
      
      container.appendChild(filterOption);
    });
  }

  #applyFilters() {
    const listings = document.querySelectorAll('.listing');
    
    // Get selected filter values from DOM
    const getSelectedValues = selector => 
      Array.from(document.querySelectorAll(selector))
        .map(input => input.value);
    
    const filters = {
      locations: {
        values: getSelectedValues('#location-filters .filter-option input:checked'),
        active: document.querySelectorAll('#location-filters .filter-option input').length > 0,
        selector: '.location'
      },
      statuses: {
        values: getSelectedValues('#status-filters .filter-option input:checked'),
        active: document.querySelectorAll('#status-filters .filter-option input').length > 0,
        selector: '.status'
      },
      reasons: {
        values: getSelectedValues('#reason-filters .filter-option input:checked'),
        active: document.querySelectorAll('#reason-filters .filter-option input').length > 0,
        selector: '.reason'
      }
    };
    
    listings.forEach(listing => {
      let showListing = true;
      
      // Check each filter type
      Object.values(filters).forEach(filter => {
        if (!showListing || !filter.active || !filter.values.length) return;
        
        const textContent = listing.querySelector(filter.selector)?.textContent.trim() || '';
        if (!filter.values.includes(textContent)) {
          showListing = false;
        }
      });
      
      listing.classList.toggle('hidden', !showListing);
    });
    
    this.#updateNoResultsMessage();
  }

  #updateNoResultsMessage() {
    const listingContainer = this.#listingContainer;
    if (!listingContainer) return;
    
    const visibleListings = listingContainer.querySelectorAll('.listing:not(.hidden)');
    const existingNoResults = listingContainer.querySelector('.no-results');
    
    if (visibleListings.length === 0) {
      if (!existingNoResults) {
        listingContainer.appendChild(
          this.#createElement('div', {
            className: 'no-results',
            textContent: 'No items match your filters.'
          })
        );
      }
    } else if (existingNoResults) {
      existingNoResults.remove();
    }
  }

  #sortListingsByDate() {
    if (!this.#listingContainer) return;
    
    const listings = Array.from(this.#listingContainer.querySelectorAll('.listing:not(.hidden)'));
    this.#listingContainer.querySelector('.no-results')?.remove();
    
    listings.sort((a, b) => {
      const dateA = new Date(a.querySelector('.date')?.textContent || a.getAttribute('data-date') || 0);
      const dateB = new Date(b.querySelector('.date')?.textContent || b.getAttribute('data-date') || 0);
      return dateB - dateA;
    });
    
    listings.forEach(listing => this.#listingContainer.appendChild(listing));
  }

  #sortListingsByRelevance(query) {
    if (!query?.trim() || !this.#listingContainer) return;
    
    query = query.toLowerCase();
    
    const listings = this.#listingContainer.querySelectorAll('.listing:not(.hidden)');
    this.#listingContainer.querySelector('.no-results')?.remove();
    
    // Calculate relevance scores
    const contentSelectors = {
      title: { selector: '.title', weight: 3 },
      reason: { selector: '.reason', weight: 2 },
      location: { selector: '.location', weight: 2 },
      description: { selector: '.description', weight: 1 }
    };
    
    const listingScores = Array.from(listings).map(listing => {
      let score = 0;
      
      Object.values(contentSelectors).forEach(({ selector, weight }) => {
        const content = listing.querySelector(selector)?.textContent.toLowerCase() || '';
        if (content.includes(query)) score += weight;
      });
      
      return { listing, score };
    });
    
    // Sort and re-append listings
    listingScores
      .sort((a, b) => b.score - a.score)
      .forEach(item => this.#listingContainer.appendChild(item.listing));
    
    // Show message if no results
    if (listings.length === 0) {
      this.#listingContainer.appendChild(
        this.#createElement('div', {
          className: 'no-results',
          textContent: 'No items match your search and filters.'
        })
      );
    }
  }

  #createListingElement(post) {
    if (!this.#listingContainer) return null;
  
    const listing = this.#createElement('div', {
      className: 'listing',
      id: post.id,
      onClick: () => this.#openModal(post)
    });
  
    const elements = [
      { tag: 'h3', className: 'title', text: post.title || 'Not Supplied' },
      { tag: 'p', label: 'Date Reported: ', className: 'date', text: new Date(post.reportedAt).toLocaleDateString() },
      { tag: 'p', label: 'Description: ', className: 'description', text: post.description || 'Not supplied' },
      { tag: 'p', label: 'Report Reason: ', className: 'reason', text: post.reportReason || 'Not supplied' },
      { tag: 'p', label: 'Location: ', className: 'location', text: post.location || 'Not supplied' },
      { tag: 'p', label: 'Status: ', className: 'status', text: post.reportStatus || 'Pending' }
    ];
  
    elements.forEach(el => {
      if (el.tag === 'h3') {
        const wrapper = this.#createElement(el.tag);
        wrapper.appendChild(this.#createElement('span', { 
          className: el.className, 
          textContent: el.text 
        }));
        listing.appendChild(wrapper);
      } else {
        const span = this.#createElement('span', { 
          className: el.className, 
          textContent: el.text 
        });
        const wrapper = this.#createElement(el.tag, { textContent: el.label }, [span]);
        listing.appendChild(wrapper);
      }
    });
  
    // Insert at the beginning for newest first
    if (this.#listingContainer.firstChild) {
      this.#listingContainer.insertBefore(listing, this.#listingContainer.firstChild);
    } else {
      this.#listingContainer.appendChild(listing);
    }
    
    return listing;
  }

  #createSpan(className, text) {
    return this.#createElement('span', { className, textContent: text });
  }

  async #performAction(actionType, postId, endpoint, successMsg, errorMsg) {
    try {
      const method = actionType === 'delete' ? 'DELETE' : 'PUT';
      const url = `${this.#apiBaseUrl}${endpoint}/${postId}${actionType === 'keep' ? '/keep' : ''}`;
      
      console.log(`AdminPage: Attempting to ${actionType} post with ID: ${postId}`);
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${actionType} post`);
      }
      
      // Remove post from UI
      const listingElement = document.getElementById(postId);
      if (listingElement) {
        listingElement.remove();
      }

      // Check if container is now empty
      if (this.#listingContainer && this.#listingContainer.querySelectorAll('.listing').length === 0) {
        this.#listingContainer.innerHTML = 
          `<div class="no-posts-message">No reported posts to review.</div>`;
      }

      // For delete actions, broadcast the event
      if (actionType === 'delete') {
        setTimeout(() => {
          const eventData = { 
            action: 'deleted',
            postId,
            timestamp: Date.now()
          };
          
          console.log('Broadcasting deletion event with data:', eventData);
          EventHub.getEventHubInstance().publish(Events.PostUpdated, eventData);
        }, 50);
      }

      alert(successMsg);
      this.#closeModal();
    } catch (error) {
      console.error(`Error ${actionType}ing post:`, error);
      alert(`${errorMsg} ${error.message}`);
    }
  }

  async #keepPost(postId) {
    return this.#performAction(
      'keep', 
      postId, 
      '/admin/reports', 
      'Post has been kept and removed from reports.',
      'Failed to keep post. Please try again:'
    );
  }

  async #deletePost(postId) {
    return this.#performAction(
      'delete', 
      postId, 
      '/posts', 
      'Post has been deleted successfully.',
      'Failed to delete post. Please try again:'
    );
  }

  async #loadComments(postId) {
    try {
      const responseData = await this.#fetchData(`/admin/comments/${postId}`);
      const comments = responseData.data.comments || [];

      const commentsList = document.getElementById(`comments-${postId}`);
      const addCommentBtn = document.querySelector('.add-comment-button');
      
      if (!commentsList) return;
      
      commentsList.innerHTML = '';
      
      if (comments.length === 0) {
        commentsList.appendChild(this.#createElement('p', {
          className: 'no-comments',
          textContent: 'No comments yet'
        }));
        
        if (addCommentBtn) addCommentBtn.style.display = 'block';
      } else {
        comments.forEach(comment => {
          commentsList.appendChild(this.#createCommentElement(comment));
        });
        
        if (addCommentBtn) addCommentBtn.style.display = 'none';
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }

  #createCommentElement(comment) {
    const commentElement = this.#createElement('div', {
      className: 'comment',
      id: `comment-${comment.id}`
    });

    const commentText = this.#createElement('p', {
      className: 'comment-text',
      textContent: comment.comment
    });

    const commentDate = this.#createElement('span', {
      className: 'comment-date',
      textContent: new Date(comment.createdAt).toLocaleString()
    });

    const editButton = this.#createElement('button', {
      className: 'edit-comment-button',
      textContent: 'Edit',
      onClick: () => this.#editComment(comment)
    });

    commentElement.append(commentText, commentDate, editButton);
    return commentElement;
  }

  async #addComment(postId, commentText) {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const admin_id = localStorage.getItem('userId') || '1';
      
      await this.#fetchData(`/admin/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: commentText, admin_id })
      });

      // Reset the UI
      const commentInput = document.querySelector('.comment-input');
      if (commentInput) commentInput.value = '';

      await this.#loadComments(postId);
      
      // Update button visibility
      const commentForm = document.querySelector('.comment-form');
      const addCommentBtn = document.querySelector('.add-comment-button');
      
      if (commentForm) commentForm.style.display = 'none';
      if (addCommentBtn) addCommentBtn.style.display = 'block';
    } catch (error) {
      console.error("Error adding comment:", error);
      alert('Failed to add comment. Please try again.');
    }
  }

  #editComment(comment) {
    const commentElement = document.getElementById(`comment-${comment.id}`);
    if (!commentElement) return;

    const commentText = commentElement.querySelector('.comment-text');
    const currentText = commentText.textContent;
    const editButton = commentElement.querySelector('.edit-comment-button');

    // Create edit form elements
    const input = this.#createElement('textarea', {
      className: 'edit-comment-input',
      value: currentText
    });

    const saveButton = this.#createElement('button', {
      className: 'save-comment-button',
      textContent: 'Save Comment'
    });

    const cancelButton = this.#createElement('button', {
      className: 'cancel-comment-button',
      textContent: 'Cancel',
      onClick: () => {
        input.replaceWith(commentText);
        editActions.remove();
        editButton.style.display = 'block';
      }
    });

    const editActions = this.#createElement('div', {
      className: 'comment-buttons'
    }, [saveButton, cancelButton]);

    // Replace text with input and hide edit button
    commentText.replaceWith(input);
    editButton.style.display = 'none';
    commentElement.appendChild(editActions);

    // Setup save handler
    saveButton.addEventListener('click', async () => {
      const newText = input.value.trim();
      if (!newText) {
        alert('Comment cannot be empty');
        return;
      }

      try {
        await this.#fetchData(`/admin/comments/${comment.post_id}/${comment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment: newText })
        });

        // Update UI
        commentText.textContent = newText;
        input.replaceWith(commentText);
        editActions.remove();
        editButton.style.display = 'block';
      } catch (error) {
        console.error("Error updating comment:", error);
        alert('Failed to update comment. Please try again.');
      }
    });
  }

  async #renderListings() {
    try {
      const responseData = await this.#fetchData('/admin/reports');
      const reportedPosts = responseData.data || [];
      
      if (this.#listingContainer) {
        const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
        this.#listingContainer.innerHTML = '';
        
        if (loadingIndicator) {
          this.#listingContainer.appendChild(loadingIndicator);
        }
      }
      
      reportedPosts.forEach(post => this.#createListingElement(post));

      if (reportedPosts.length === 0 && this.#listingContainer) {
        this.#listingContainer.innerHTML = 
          '<div class="no-posts-message">No reported posts to review.</div>';
      }
    } catch (error) {
      console.error("Error rendering listings:", error);
      if (this.#listingContainer) {
        this.#listingContainer.innerHTML = 
          '<div class="error-message">Failed to load listings. Please try again later.</div>';
      }
    }
  }
}