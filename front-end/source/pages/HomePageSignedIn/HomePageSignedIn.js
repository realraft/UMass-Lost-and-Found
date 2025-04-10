document.addEventListener('DOMContentLoaded', function () {
  // Check if we have a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  setTimeout(() => {
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
    const relevanceRadio = document.getElementById('relevance');
    if (relevanceRadio) {
      relevanceRadio.checked = true;
    }

    setTimeout(() => {
      sortListingsByRelevance(searchQuery);
    }, 300);
  }

  document.addEventListener('search-query', function (e) {
    sortListingsByRelevance(e.detail.query);
  });

  const dateRadio = document.getElementById('date-posted');
  const relevanceRadio = document.getElementById('relevance');

  if (dateRadio) {
    dateRadio.addEventListener('change', function () {
      if (this.checked) {
        sortListingsByDate();
      }
    });
  }

  if (relevanceRadio) {
    relevanceRadio.addEventListener('change', function () {
      const searchBox = document.querySelector('.search-box input');
      const query = searchBox ? searchBox.value : '';
      if (query.trim()) {
        sortListingsByRelevance(query);
      }
    });
  }

  // Add the report button event listener once the page is loaded
  document.querySelector('.listing-container').addEventListener('click', function (event) {
    if (event.target.classList.contains('report-button')) {
      const itemId = event.target.getAttribute('data-item-id');
      openModal(itemId); // Open modal for the specific item
    }
  });
});

// Function to open the modal for reporting
function openModal(itemId) {
  const modal = document.getElementById('reportModal');
  const overlay = document.getElementById('overlay');
  const closeButton = document.getElementById('closeModal');

  const reportTitle = document.getElementById('reportTitle');
  reportTitle.textContent = `Report Item ${itemId}`;

  modal.classList.add('open');
  overlay.classList.add('open');

  closeButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

function closeModal() {
  const modal = document.getElementById('reportModal');
  const overlay = document.getElementById('overlay');
  modal.classList.remove('open');
  overlay.classList.remove('open');
}

// Function to set up toggle filter buttons
function setupToggleButtons() {
  document.getElementById('toggle-location-filters').addEventListener('click', function () {
    toggleFilters('location-filters');
  });

  document.getElementById('toggle-tag-filters').addEventListener('click', function () {
    toggleFilters('tag-filters');
  });
}

// Function to toggle filters
function toggleFilters(filterId) {
  const checkboxes = document.querySelectorAll(`#${filterId} input[type="checkbox"]`);
  const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
  const shouldCheck = checkedCount === 0;

  checkboxes.forEach(checkbox => {
    checkbox.checked = shouldCheck;
  });

  applyFilters();

  const buttonText = shouldCheck ? "Deselect All" : "Select All";
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

// Function to initialize filters
async function initializeFilters() {
  try {
    const response = await fetch('../../Fake-Server/server.json');
    const data = await response.json();
    const posts = data.posts;

    const locations = new Set();
    const tags = new Set();

    posts.forEach(post => {
      if (post.location) locations.add(post.location);
      if (post.tags) post.tags.forEach(tag => tags.add(tag));
    });

    populateFilterOptions('location-filters', Array.from(locations));
    populateFilterOptions('tag-filters', Array.from(tags));

    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', applyFilters);
    });

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

// Function to apply filters
function applyFilters() {
  const listings = document.querySelectorAll('.listing');

  const selectedLocations = Array.from(
    document.querySelectorAll('#location-filters .filter-option input:checked')
  ).map(input => input.value);

  const selectedTags = Array.from(
    document.querySelectorAll('#tag-filters .filter-option input:checked')
  ).map(input => input.value);

  listings.forEach(listing => {
    let showListing = true;

    const locationElement = listing.querySelector('.location');
    const listingLocation = locationElement ? locationElement.textContent.trim() : '';
    if (selectedLocations.length > 0 && !selectedLocations.includes(listingLocation)) {
      showListing = false;
    }

    const tagsElement = listing.querySelector('.tags');
    if (tagsElement) {
      const listingTags = tagsElement.textContent.split(',').map(tag => tag.trim());
      if (selectedTags.length > 0 && !listingTags.some(tag => selectedTags.includes(tag))) {
        showListing = false;
      }
    }

    if (showListing) {
      listing.classList.remove('hidden');
    } else {
      listing.classList.add('hidden');
    }
  });
}

// Function to sort listings by date
function sortListingsByDate() {
  const listings = Array.from(document.querySelectorAll('.listing')).filter(
    listing => !listing.classList.contains('hidden')
  );
  listings.sort((a, b) => {
    const dateA = new Date(a.querySelector('.date-posted').textContent);
    const dateB = new Date(b.querySelector('.date-posted').textContent);
    return dateB - dateA;
  });

  const container = document.querySelector('.listing-container');
  listings.forEach(listing => container.appendChild(listing));
}

// Function to sort listings by relevance
function sortListingsByRelevance(query) {
  const listings = Array.from(document.querySelectorAll('.listing')).filter(
    listing => !listing.classList.contains('hidden')
  );
  listings.sort((a, b) => {
    const relevanceA = a.querySelector('.title').textContent.toLowerCase().includes(query.toLowerCase())
      ? 1
      : 0;
    const relevanceB = b.querySelector('.title').textContent.toLowerCase().includes(query.toLowerCase())
      ? 1
      : 0;
    return relevanceB - relevanceA;
  });

  const container = document.querySelector('.listing-container');
  listings.forEach(listing => container.appendChild(listing));
}