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

  #createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'admin-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'admin-modal';
    
    const close = document.createElement('span');
    close.className = 'close';
    close.innerHTML = '&times;';
    close.addEventListener('click', () => this.#closeModal());
    
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.id = 'admin-modal-content';
    
    modal.append(close, content);
    this.#container.append(overlay, modal);
  }

  #openModal(report) {
    const elements = {
      overlay: document.getElementById('admin-overlay'),
      modal: document.getElementById('admin-modal'),
      content: document.getElementById('admin-modal-content')
    };
    
    if (Object.values(elements).every(el => el)) {
      elements.content.innerHTML = '';
      
      // Create modal content
      const title = document.createElement('h3');
      title.className = 'title';
      title.textContent = report.title || "Not Supplied";

      const details = [
        { label: "Date Reported: ", text: new Date(report.createdAt).toLocaleDateString(), className: 'date' },
        { label: "Description: ", text: report.description || "Not supplied", className: 'description' },
        { label: "Report Reason: ", text: report.reason || "Not supplied", className: 'reason' },
        { label: "Location: ", text: report.location || "Not supplied", className: 'location' },
        { label: "Status: ", text: report.status || "Pending", className: 'status' }
      ];

      const detailsElements = details.map(detail => {
        const wrapper = document.createElement('p');
        wrapper.textContent = detail.label;
        const span = this.#createSpan(detail.className, detail.text);
        wrapper.appendChild(span);
        return wrapper;
      });

      // Comments section
      const commentsSection = document.createElement("div");
      commentsSection.className = "comments-section";
      
      const commentsTitle = document.createElement("h4");
      commentsTitle.textContent = "Admin Comments";
      commentsSection.appendChild(commentsTitle);

      const commentsList = document.createElement("div");
      commentsList.className = "comments-list";
      commentsList.id = `comments-${report.id}`;

      // Add comment form
      const commentForm = document.createElement("div");
      commentForm.className = "comment-form";
      commentForm.style.display = 'none';

      const commentInput = document.createElement("textarea");
      commentInput.className = "comment-input";
      commentInput.placeholder = "Add an admin comment...";

      const saveCommentBtn = document.createElement("button");
      saveCommentBtn.className = "save-comment-button";
      saveCommentBtn.textContent = "Save Comment";
      saveCommentBtn.addEventListener('click', () => {
        this.#addComment(report.id, commentInput.value);
        commentForm.style.display = 'none';
        addCommentBtn.style.display = 'block';
      });

      const cancelCommentBtn = document.createElement("button");
      cancelCommentBtn.className = "cancel-comment-button";
      cancelCommentBtn.textContent = "Cancel";
      cancelCommentBtn.addEventListener('click', () => {
        commentForm.style.display = 'none';
        addCommentBtn.style.display = 'block';
        commentInput.value = '';
      });

      const commentBtns = document.createElement("div");
      commentBtns.className = "comment-buttons";
      commentBtns.append(saveCommentBtn, cancelCommentBtn);

      commentForm.append(commentInput, commentBtns);

      const addCommentBtn = document.createElement("button");
      addCommentBtn.className = "add-comment-button";
      addCommentBtn.textContent = "Add Comment";
      addCommentBtn.addEventListener('click', () => {
        commentForm.style.display = 'block';
        addCommentBtn.style.display = 'none';
      });

      commentsSection.append(commentsList, addCommentBtn, commentForm);

      // Action buttons
      const actionButtons = document.createElement("div");
      actionButtons.className = "action-buttons";

      const keepButton = document.createElement("button");
      keepButton.textContent = "Keep Post";
      keepButton.className = "keep-button";
      keepButton.addEventListener('click', () => this.#keepPost(report.id));

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete Post";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this post?')) {
          this.#deletePost(report.id);
        }
      });

      actionButtons.append(keepButton, deleteButton);

      elements.content.append(
        title,
        ...detailsElements,
        commentsSection,
        actionButtons
      );

      elements.overlay.style.display = 'block';
      elements.modal.style.display = 'block';

      this.#loadComments(report.id);
    }
  }

  #closeModal() {
    const overlay = document.getElementById('admin-overlay');
    const modal = document.getElementById('admin-modal');
    
    if (overlay && modal) {
      overlay.style.display = 'none';
      modal.style.display = 'none';
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
    loadingIndicator.textContent = "Loading reported items...";
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
    const statusFilter = this.#createFilterGroup("Status", "status-filters");
    const locationFilter = this.#createFilterGroup("Location", "location-filters");
    const reasonFilter = this.#createFilterGroup("Report Reason", "reason-filters");
    
    filtersSection.append(filtersTitle, statusFilter, locationFilter, reasonFilter);
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

  async #initializeFilters() {
    try {
      const response = await fetch('http://localhost:3000/api/admin/reports');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch filter data: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const reports = responseData.data || [];
      
      const locations = new Set();
      const statuses = new Set(['pending', 'dismissed']);
      const reasons = new Set();
      
      reports.forEach(report => {
        if (report.location) locations.add(report.location);
        if (report.status) statuses.add(report.status);
        if (report.reason) reasons.add(report.reason);
      });
      
      this.#populateFilterOptions('location-filters', Array.from(locations));
      this.#populateFilterOptions('status-filters', Array.from(statuses));
      this.#populateFilterOptions('reason-filters', Array.from(reasons));
      
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
    
    const getSelectedValues = (selector) => Array.from(
      document.querySelectorAll(selector)
    ).map(input => input.value);
    
    const selectedLocations = getSelectedValues('#location-filters .filter-option input:checked');
    const selectedStatuses = getSelectedValues('#status-filters .filter-option input:checked');
    const selectedReasons = getSelectedValues('#reason-filters .filter-option input:checked');
    
    const locationFilterActive = document.querySelectorAll('#location-filters .filter-option input').length > 0;
    const statusFilterActive = document.querySelectorAll('#status-filters .filter-option input').length > 0;
    const reasonFilterActive = document.querySelectorAll('#reason-filters .filter-option input').length > 0;
    
    listings.forEach(listing => {
      let showListing = true;
      
      // Location filter
      if (locationFilterActive && selectedLocations.length > 0) {
        const locationText = listing.querySelector('.location')?.textContent.trim() || '';
        if (!selectedLocations.includes(locationText)) {
          showListing = false;
        }
      }
      
      // Status filter
      if (showListing && statusFilterActive && selectedStatuses.length > 0) {
        const statusText = listing.querySelector('.status')?.textContent.trim() || '';
        if (!selectedStatuses.includes(statusText)) {
          showListing = false;
        }
      }
      
      // Reason filter
      if (showListing && reasonFilterActive && selectedReasons.length > 0) {
        const reasonText = listing.querySelector('.reason')?.textContent.trim() || '';
        if (!selectedReasons.includes(reasonText)) {
          showListing = false;
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
      const reason = listing.querySelector('.reason')?.textContent.toLowerCase() || '';
      const location = listing.querySelector('.location')?.textContent.toLowerCase() || '';
      const description = listing.querySelector('.description')?.textContent.toLowerCase() || '';
      
      let score = 0;
      if (title.includes(query)) score += 3;
      if (reason.includes(query)) score += 2;
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

  #createListingElement(report) {
    if (!this.#listingContainer) return;
  
    const listing = document.createElement("div");
    listing.classList.add("listing");
    listing.id = report.id;
    listing.addEventListener('click', () => this.#openModal(report));
  
    const elements = [
      { tag: "h3", className: "title", text: report.title || "Not Supplied" },
      { tag: "p", label: "Date Reported: ", className: "date", text: new Date(report.createdAt).toLocaleDateString() },
      { tag: "p", label: "Description: ", className: "description", text: report.description || "Not supplied" },
      { tag: "p", label: "Report Reason: ", className: "reason", text: report.reason || "Not supplied" },
      { tag: "p", label: "Location: ", className: "location", text: report.location || "Not supplied" },
      { tag: "p", label: "Status: ", className: "status", text: report.status || "Pending" }
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
  
    this.#listingContainer.appendChild(listing);
    return listing;
  }

  #createSpan(className, text) {
    const span = document.createElement("span");
    span.classList.add(className);
    span.textContent = text;
    return span;
  }

  async #keepPost(reportId) {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/reports/${reportId}/keep`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to keep post: ${response.status} ${response.statusText}`);
      }

      const listingElement = document.getElementById(reportId);
      if (listingElement) {
        listingElement.remove();
      }

      if (this.#listingContainer && this.#listingContainer.children.length === 0) {
        this.#listingContainer.innerHTML = '<div class="no-posts-message">No reported posts to review.</div>';
      }

      alert('Post has been kept and removed from reports.');
      this.#closeModal();
    } catch (error) {
      console.error("Error keeping post:", error);
      alert('Failed to keep post. Please try again.');
    }
  }

  async #deletePost(reportId) {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.status} ${response.statusText}`);
      }

      const listingElement = document.getElementById(reportId);
      if (listingElement) {
        listingElement.remove();
      }

      if (this.#listingContainer && this.#listingContainer.children.length === 0) {
        this.#listingContainer.innerHTML = '<div class="no-posts-message">No reported posts to review.</div>';
      }

      alert('Post has been deleted successfully.');
      this.#closeModal();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert('Failed to delete post. Please try again.');
    }
  }

  async #loadComments(postId) {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/comments/${postId}`);
      if (!response.ok) {
        throw new Error(`Failed to load comments: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      const comments = responseData.data.comments || [];

      const commentsList = document.getElementById(`comments-${postId}`);
      const addCommentBtn = document.querySelector('.add-comment-button');
      
      if (commentsList) {
        commentsList.innerHTML = '';
        
        if (comments.length === 0) {
          const noComments = document.createElement("p");
          noComments.className = "no-comments";
          noComments.textContent = "No comments yet";
          commentsList.appendChild(noComments);
          if (addCommentBtn) {
            addCommentBtn.style.display = 'block';
          }
        } else {
          comments.forEach(comment => {
            const commentElement = this.#createCommentElement(comment);
            commentsList.appendChild(commentElement);
          });
          if (addCommentBtn) {
            addCommentBtn.style.display = 'none';
          }
        }
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  }

  #createCommentElement(comment) {
    const commentElement = document.createElement("div");
    commentElement.className = "comment";
    commentElement.id = `comment-${comment.id}`;

    const commentText = document.createElement("p");
    commentText.className = "comment-text";
    commentText.textContent = comment.comment;

    const commentDate = document.createElement("span");
    commentDate.className = "comment-date";
    commentDate.textContent = new Date(comment.createdAt).toLocaleString();

    const editButton = document.createElement("button");
    editButton.className = "edit-comment-button";
    editButton.textContent = "Edit";
    editButton.addEventListener('click', () => this.#editComment(comment));

    commentElement.append(commentText, commentDate, editButton);
    return commentElement;
  }

  async #addComment(postId, commentText) {
    if (!commentText.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: commentText })
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
      }

      // Refresh comments list
      this.#loadComments(postId);

      // Clear input
      const commentInput = document.querySelector(`#${postId} .comment-input`);
      if (commentInput) {
        commentInput.value = '';
      }
      
      alert('Comment added successfully.');
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

    const input = document.createElement("textarea");
    input.className = "edit-comment-input";
    input.value = currentText;

    const saveButton = document.createElement("button");
    saveButton.className = "save-comment-button";
    saveButton.textContent = "Save Comment";

    const cancelButton = document.createElement("button");
    cancelButton.className = "cancel-comment-button";
    cancelButton.textContent = "Cancel";

    const editActions = document.createElement("div");
    editActions.className = "comment-buttons";
    editActions.append(saveButton, cancelButton);

    // Replace text with input and hide edit button
    commentText.replaceWith(input);
    const editButton = commentElement.querySelector('.edit-comment-button');
    editButton.style.display = 'none';
    commentElement.appendChild(editActions);

    cancelButton.addEventListener('click', () => {
      input.replaceWith(commentText);
      editActions.remove();
      editButton.style.display = 'block';
    });

    saveButton.addEventListener('click', async () => {
      const newText = input.value.trim();
      if (!newText) {
        alert('Comment cannot be empty');
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/admin/comments/${comment.post_id}/${comment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ comment: newText })
        });

        if (!response.ok) {
          throw new Error(`Failed to update comment: ${response.status} ${response.statusText}`);
        }

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
      const response = await fetch('http://localhost:3000/api/admin/reports');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const reports = responseData.data || [];
      
      if (this.#listingContainer) {
        const loadingIndicator = this.#listingContainer.querySelector('.loading-indicator');
        this.#listingContainer.innerHTML = '';
        if (loadingIndicator) {
          this.#listingContainer.appendChild(loadingIndicator);
        }
      }
      
      reports.forEach(report => this.#createListingElement(report));

      if (reports.length === 0 && this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="no-posts-message">No reported posts to review.</div>';
      }
    } catch (error) {
      console.error("Error rendering listings:", error);
      if (this.#listingContainer) {
        this.#listingContainer.innerHTML = '<div class="error-message">Failed to load listings. Please try again later.</div>';
      }
    }
  }
}