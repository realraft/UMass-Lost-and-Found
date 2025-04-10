document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const reportModal = document.getElementById("reportModal");
  const reportTitle = document.getElementById("reportTitle");
  const submitReportButton = document.getElementById("submitReport");
  const reportReasonInput = document.getElementById("reportReason");
  const closeModalButton = document.getElementById("closeModal");
  let currentPostId = null;

  // Function to open the report modal
  function openReportModal(postId, postTitle) {
    currentPostId = postId;
    overlay.style.display = "block";
    reportModal.style.display = "block";
    reportTitle.textContent = `Report Listing: ${postTitle}`;
  }

  // Function to close the report modal
  function closeReportModal() {
    overlay.style.display = "none";
    reportModal.style.display = "none";
    reportReasonInput.value = ""; // Clear the input field
    currentPostId = null; // Reset the current post ID
  }

  // Add event listener to dynamically open the modal when a "Report" button is clicked
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("report-button")) {
      const postId = event.target.getAttribute("data-post-id");
      const postTitle = event.target.getAttribute("data-post-title");
      openReportModal(postId, postTitle);
    }
  });

  // Add event listener to handle report submission
  submitReportButton.addEventListener("click", function () {
    const reportReason = reportReasonInput.value.trim();
    if (!reportReason) {
      alert("Please provide a reason for reporting.");
      return;
    }

    // Save the report locally using IndexedDB
    const dbRequest = indexedDB.open("LostAndFoundDB", 1);

    dbRequest.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("reports")) {
        db.createObjectStore("reports", { keyPath: "id", autoIncrement: true });
      }
    };

    dbRequest.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction("reports", "readwrite");
      const store = transaction.objectStore("reports");

      // Create a new report object
      const newReport = {
        post_id: currentPostId,
        reason: reportReason,
        timestamp: new Date().toISOString(),
      };

      // Save the report to IndexedDB
      const addRequest = store.add(newReport);
      addRequest.onsuccess = function () {
        alert("Your report has been submitted successfully.");
        closeReportModal(); // Close the modal after successful submission
      };

      addRequest.onerror = function () {
        console.error("Error saving report to IndexedDB.");
        alert("Failed to submit report.");
      };
    };

    dbRequest.onerror = function () {
      console.error("Error accessing IndexedDB.");
      alert("Failed to submit report due to database error.");
    };
  });

  // Add event listener to close the modal on overlay or close button click
  overlay.addEventListener("click", closeReportModal);
  closeModalButton.addEventListener("click", closeReportModal);
});
