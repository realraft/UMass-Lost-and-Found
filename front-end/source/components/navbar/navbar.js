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
    })
    .catch(error => console.error('Error loading navbar:', error));
});