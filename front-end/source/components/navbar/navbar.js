document.addEventListener('DOMContentLoaded', function() {
  // Don't add navbar to the HomePageSignedOut
  if (window.location.href.includes('HomePageSignedOut')) {
    return;
  }
  
  const pathPrefix = window.location.pathname.includes('/pages/') ? '../../' : '';

  // Create a container for the navbar and add the HTML directly
  const navbarContainer = document.createElement('div');
  navbarContainer.innerHTML = `
    <div class="navbar">
      <div class="navbar-brand">
        <a href="${pathPrefix}pages/HomePageSignedIn/HomePageSignedIn.html" style="text-decoration: none; color: white;">
          <h1>UMass Lost and Found</h1>
        </a>
      </div>
      <div class="navbar-search">
        <form class="search-form" action="/search" method="get">
          <input type="search" name="q" placeholder="Search…" aria-label="Search" />
          <button type="submit">🔍</button>
        </form>
      </div>
      <div class="navbar-actions">
        <a href="${pathPrefix}pages/postItemPage/post_item_page.html" class="nav-link">
          <button class="post-button">Post</button>
        </a>
        <div class="dropdown">
          <button class="dropdown-button">☰</button>
          <div class="dropdown-content">
            <a href="${pathPrefix}pages/MessagingPage/MessagingPage.html">Messaging</a>
            <a href="#" class="disabled-link">Post Manager</a>
            <a href="#" class="disabled-link">Admin Page</a>
            <a href="${pathPrefix}pages/HomePageSignedOut/HomePageSignedOut.html">Log Out</a>
          </div>
        </div>
      </div>
    </div>
  `;
      
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
            
            // Clear the search input after searching
            searchInput.value = '';
          }
        } else {
          // Redirect to the home page with the search query as a parameter
          window.location.href = `${pathPrefix}pages/HomePageSignedIn/HomePageSignedIn.html?search=${encodeURIComponent(searchQuery)}`;
          // No need to clear input here as page will be redirected
        }
      }
    });
  }
}