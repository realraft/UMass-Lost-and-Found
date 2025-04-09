document.addEventListener('DOMContentLoaded', function() {
  // Don't add navbar to the HomePageSignedOut
  if (window.location.href.includes('HomePageSignedOut')) {
    return;
  }
  
  const pathPrefix = window.location.pathname.includes('/pages/') ? '../../' : '';

  // Fetch the navbar HTML
  fetch(`${pathPrefix}components/navbar/navbar.html`)
    .then(response => response.text())
    .then(data => {
      // Create a container for the navbar
      const navbarContainer = document.createElement('div');
      navbarContainer.innerHTML = data;
      
      // Insert the navbar at the beginning of the body
      document.body.prepend(navbarContainer);
      
      // Add the CSS file to the head
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${pathPrefix}components/navbar/navbar.css`;
      document.head.appendChild(link);
      
      // Add click event listener to dropdown button
      setupDropdown();
      
      // Add search functionality
      setupSearch(pathPrefix);
    })
    .catch(error => console.error('Error loading navbar:', error));
});

function setupDropdown() {
  const dropdownButton = document.querySelector('.dropdown-button');
  const dropdownContent = document.querySelector('.dropdown-content');
  
  if (dropdownButton && dropdownContent) {
    // Toggle dropdown when button is clicked
    dropdownButton.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownContent.classList.toggle('show');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
      if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
      }
    });
    
    // Prevent dropdown from closing when clicking inside it
    dropdownContent.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}

function setupSearch(pathPrefix) {
  const searchForm = document.querySelector('.search-form');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const searchInput = this.querySelector('input[type="search"]');
      const searchQuery = searchInput.value.trim();
      
      if (searchQuery) {
        // Check if we're already on the HomePageSignedIn
        if (window.location.href.includes('HomePageSignedIn')) {
          // We're on the home page, dispatch a custom event for filtering by relevance
          const relevanceRadio = document.getElementById('relevance');
          if (relevanceRadio) {
            relevanceRadio.checked = true;
            
            // Create and dispatch a custom event with the search query
            const searchEvent = new CustomEvent('search-query', {
              detail: { query: searchQuery }
            });
            document.dispatchEvent(searchEvent);
          }
        } else {
          // Redirect to the home page with the search query as a parameter
          window.location.href = `${pathPrefix}pages/HomePageSignedIn/HomePageSignedIn.html?search=${encodeURIComponent(searchQuery)}`;
        }
      }
    });
  }
}