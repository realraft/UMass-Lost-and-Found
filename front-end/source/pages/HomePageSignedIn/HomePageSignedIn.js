document.addEventListener("DOMContentLoaded", function () {
  // Check if we have a search query in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");

  setTimeout(() => {
    // Trigger search functionality
    initializeFilters();
    setupToggleButtons();

    // Set date-posted as default and sort listings
    const dateRadio = document.getElementById("date-posted"); 
    if (dateRadio) {
      dateRadio.checked = true;
      sortListingsByDate();
    } 
  }, 300);

  if (searchQuery) {
    // Set the relevance radio button
    const relevanceRadio = document.getElementById("relevance");
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
  document.addEventListener("search-query", function (e) {
    sortListingsByRelevance(e.detail.query);
  });

  // Add event listeners for sort radio buttons
  const dateRadio = document.getElementById("date-posted");
  const relevanceRadio = document.getElementById("relevance");

  if (dateRadio) {
    dateRadio.addEventListener("change", function () {
      if (this.checked) {
        sortListingsByDate();
      }
    });
  }

  if (relevanceRadio) {
    relevanceRadio.addEventListener("change", function () {
      if (this.checked) {
        const searchBox = document.querySelector(".search-box input");
        const query = searchBox ? searchBox.value : "";
        if (query.trim()) {
          sortListingsByRelevance(query);
        }
      }
    });
  }

  // Open a connection to IndexedDB
  const dbRequest = indexedDB.open("LostAndFoundDB", 1);

  dbRequest.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create an object store for reports if it doesn't already exist
    if (!db.objectStoreNames.contains("reports")) {
      db.createObjectStore("reports", { keyPath: "id" });
    }
  };

  dbRequest.onsuccess = (event) => {
    const db = event.target.result;

    // Add functionality for the report modal
    const overlay = document.getElementById("overlay");
    const reportModal = document.getElementById("reportModal");
    const reportTitle = document.getElementById("reportTitle");
    const submitReportButton = document.getElementById("submitReport");
    const reportReasonInput = document.querySelector("#reportModal textarea");

    // Report modal logic
    function openReportModal() {
      overlay.style.display = "block";
      reportModal.style.display = "block";

      // Always set modal title to "Report Item"
      reportTitle.textContent = "Report Item";
    }

    function closeReportModal() {
      overlay.style.display = "none";
      reportModal.style.display = "none";
      reportReasonInput.value = ""; // Clear the textarea
    }

    overlay.addEventListener("click", closeReportModal);
    document.querySelector(".close").addEventListener("click", closeReportModal);

    submitReportButton.addEventListener("click", function () {
      const reportReason = reportReasonInput.value.trim();

      if (!reportReason) {
        alert("Please provide a reason for reporting.");
        return;
      }

      const report = {
        id: Date.now().toString(), // Unique ID
        reason: reportReason, // User-provided reason
        timestamp: new Date().toISOString(), // Date and time of the report
      };

      saveReportToIndexedDB(report, db);
      closeReportModal();
      alert("Thank you! Your report has been submitted.");
      console.log("Report submitted:", report);
    });

    function saveReportToIndexedDB(report, db) {
      const transaction = db.transaction("reports", "readwrite");
      const store = transaction.objectStore("reports");

      store.add(report);

      transaction.oncomplete = () => {
        console.log("Report saved successfully in IndexedDB:", report);
      };

      transaction.onerror = (event) => {
        console.error("Error saving report to IndexedDB:", event.target.error);
      };
    }

    // Update dynamic listings and add report functionality
    const listingContainer = document.querySelector(".listing-container");
    function attachReportFunctionality() {
      const listings = listingContainer.querySelectorAll(".listing");
      listings.forEach((listing) => {
        const reportButton = listing.querySelector(".report-button");

        reportButton.addEventListener("click", () => {
          openReportModal();
        });
      });
    }

    attachReportFunctionality();
  };

  dbRequest.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
  };
});

function redirectToAdmin() {
  // Redirect to the Administrator page
  window.location.href = "Administrator.html";
}