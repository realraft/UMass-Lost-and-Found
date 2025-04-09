document.addEventListener('DOMContentLoaded', function() {
  // Check if we have a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  setTimeout(() => {
    // Trigger search functionality
    initializeFilters();
    setupToggleButtons();

    // Set date-posted as default and sort listings
    const dateRadio = document.getElementById('date-posted');
    if (dateRadio) {
      dateRadio.checked = true;
      sortListingsByDate();
    }
  }, 300);

  if (searchQuery) {
    // Set the relevance radio button
    const relevanceRadio = document.getElementById('relevance');
    if (relevanceRadio) {
      relevanceRadio.checked = true;
    }
    
    // Add a small delay to ensure the listings are loaded before filtering
    setTimeout(() => {
      // Trigger search functionality
      sortListingsByRelevance(searchQuery);
    }, 300);
  }
  
  // Listen for search events from navbar
  document.addEventListener('search-query', function(e) {
    sortListingsByRelevance(e.detail.query);
  });

  // Add event listeners for sort radio buttons
  const dateRadio = document.getElementById('date-posted');
  const relevanceRadio = document.getElementById('relevance');
  
  if (dateRadio) {
    dateRadio.addEventListener('change', function() {
      if (this.checked) {
        sortListingsByDate();
      }
    });
  }
  
  if (relevanceRadio) {
    relevanceRadio.addEventListener('change', function() {
      if (this.checked) {
        const searchBox = document.querySelector('.search-box input');
        const query = searchBox ? searchBox.value : '';
        if (query.trim()) {
          sortListingsByRelevance(query);
        }
      }
    });
  }
});

// Function to set up toggle filter buttons
function setupToggleButtons() {
  document.getElementById('toggle-location-filters').addEventListener('click', function() {
    toggleFilters('location-filters');
  });
  
  document.getElementById('toggle-tag-filters').addEventListener('click', function() {
    toggleFilters('tag-filters');
  });
}

// Function to toggle all filters in a specific section
function toggleFilters(filterId) {
  const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
  
  // Count how many checkboxes are checked
  const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  
  // If all or some are checked, uncheck all. Otherwise, check all.
  const shouldCheck = checkedCount === 0; // If none are checked, we should check all
  
  // Apply the appropriate state to all checkboxes
  checkboxes.forEach(checkbox => {
    checkbox.checked = shouldCheck;
  });
  
  // Apply the filters with the new checkbox state
  applyFilters();
  
  // Update button text based on new state
  const buttonText = shouldCheck ? "Deselect All" : "Select All";
  document.getElementById(`toggle-${filterId}`).textContent = buttonText;
}

// Function to initialize filters
async function initializeFilters() {
  try {
    // Fetch data from server.json
    const response = await fetch('../../Fake-Server/server.json');
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
    populateFilterOptions('location-filters', Array.from(locations));
    
    // Populate tag filters
    populateFilterOptions('tag-filters', Array.from(tags));
    
    // Add event listener for filter changes
    const filterCheckboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', applyFilters);
    });

    // Initialize toggle button text based on initial checkbox state
    updateToggleButtonText('location-filters');
    updateToggleButtonText('tag-filters');
  } catch (error) {
    console.error('Error fetching filter data:', error);
  }
}

// Function to update toggle button text based on checkbox state
function updateToggleButtonText(filterId) {
  const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
  const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  const allChecked = checkedCount === checkboxes.length;
  
  const buttonText = allChecked ? "Deselect All" : "Select All";
  document.getElementById(`toggle-${filterId}`).textContent = buttonText;
}

// Function to populate filter options
function populateFilterOptions(containerId, options) {
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

function applyFilters() {
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

// Function to sort listings by date
function sortListingsByDate() {
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
    // We're assuming each listing has a date element or data attribute
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
  
function sortListingsByRelevance(query) {
  // Normalize the query
  query = query.toLowerCase();
  
  // Get all current listings from the container
  const listingContainer = document.querySelector('.listing-container');

  // CHANGE: Instead of making all hidden listings visible, only work with visible listings
  // to maintain applied filters
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