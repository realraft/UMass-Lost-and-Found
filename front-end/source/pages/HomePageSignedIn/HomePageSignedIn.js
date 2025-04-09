document.addEventListener('DOMContentLoaded', function() {
  // Check if we have a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');
  
  if (searchQuery) {
    // Set the relevance radio button
    const relevanceRadio = document.getElementById('relevance');
    if (relevanceRadio) {
      relevanceRadio.checked = true;
    }
    
    // Add a small delay to ensure the listings are loaded before filtering
    setTimeout(() => {
      // Trigger search functionality
      filterListingsByRelevance(searchQuery);
    }, 300);
  }
  
  // Listen for search events from navbar
  document.addEventListener('search-query', function(e) {
    filterListingsByRelevance(e.detail.query);
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
          filterListingsByRelevance(query);
        }
      }
    });
  }
});

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
  
function filterListingsByRelevance(query) {
    // Normalize the query
    query = query.toLowerCase();
    
    // Get all current listings from the container
    const listingContainer = document.querySelector('.listing-container');
    
    // First, make all listings visible if they were hidden by a previous filter
    const hiddenListings = document.querySelectorAll('.listing.hidden');
    hiddenListings.forEach(listing => {
      listing.classList.remove('hidden');
    });
    
    // Now get the full set of visible listings
    const listings = listingContainer.querySelectorAll('.listing');
    
    // If no query, just show all listings in original order and return
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
    
    // Remove any previous "no results" message
    const existingNoResults = listingContainer.querySelector('.no-results');
    if (existingNoResults) {
      listingContainer.removeChild(existingNoResults);
    }
    
    // Reorder listings based on score
    listingScores.forEach(item => {
      // Append each listing to move it to the end in sorted order
      listingContainer.appendChild(item.listing);
    });
}