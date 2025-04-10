// Open a connection to IndexedDB
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("LostAndFoundDB", 1);

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Ensure necessary stores exist
      if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("reports")) {
        db.createObjectStore("reports", { keyPath: "id" });
      }
    };

    dbRequest.onsuccess = (event) => {
      resolve(event.target.result);
    };

    dbRequest.onerror = (event) => {
      reject("Error opening IndexedDB:", event.target.error);
    };
  });
}

// Fetch reports and posts from IndexedDB
async function fetchReportsAndPosts(db) {
  const reportsTransaction = db.transaction("reports", "readonly");
  const postsTransaction = db.transaction("posts", "readonly");

  const reportsStore = reportsTransaction.objectStore("reports");
  const postsStore = postsTransaction.objectStore("posts");

  const reportsPromise = new Promise((resolve, reject) => {
    const request = reportsStore.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });

  const postsPromise = new Promise((resolve, reject) => {
    const request = postsStore.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });

  return Promise.all([reportsPromise, postsPromise]);
}

// Display reported posts on the Administrator page
async function displayReportedPosts() {
  const postsContainer = document.getElementById("postsContainer");
  const db = await openIndexedDB();

  try {
    const [reports, posts] = await fetchReportsAndPosts(db);

    // Filter posts with reports
    const reportedPosts = posts.filter(post =>
      reports.some(report => report.post_id === post.id)
    );

    // Clear container before rendering
    postsContainer.innerHTML = "";

    if (reportedPosts.length === 0) {
      postsContainer.innerHTML = "<p>No reported posts found.</p>";
      return;
    }

    // Render each reported post with its associated report
    reportedPosts.forEach(post => {
      const report = reports.find(r => r.post_id === post.id);
      const reportReason = report ? report.reason : "No reason provided.";

      const postElement = document.createElement("div");
      postElement.className = "post";
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.description || "No description available."}</p>
        <p><strong>Location:</strong> ${post.location}</p>
        <p><strong>Report Reason:</strong> ${reportReason}</p>
        <button onclick="openEditDeleteModal(${post.id})">Edit/Delete</button>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    postsContainer.innerHTML = "<p>Error loading reported posts.</p>";
    console.error("Error fetching reported posts:", error);
  }
}

// Open the edit/delete modal
function openEditDeleteModal(postId) {
  const overlay = document.getElementById("overlay");
  const modal = document.getElementById("editDeleteModal");

  overlay.style.display = "block";
  modal.style.display = "block";

  // Set the modal title with the post ID
  document.getElementById("editDeleteTitle").innerText = `Edit/Delete Post ID: ${postId}`;

  // Set the Save and Delete actions
  document.getElementById("saveChangesButton").onclick = () => saveChanges(postId);
  document.getElementById("deleteReportButton").onclick = () => deletePost(postId);
}

// Save changes to a reported post
function saveChanges(postId) {
  const editReason = document.getElementById("editReason").value;

  if (!editReason.trim()) {
    alert("Please provide a reason for editing.");
    return;
  }

  // Simulate saving changes
  console.log(`Changes saved for Post ID ${postId}: ${editReason}`);
  closeModal();
}

// Delete a reported post
function deletePost(postId) {
  // Simulate deleting the post
  console.log(`Post ID ${postId} has been deleted.`);
  closeModal();

  // Refresh the list of reported posts
  displayReportedPosts();
}

// Close the modal
function closeModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("editDeleteModal").style.display = "none";
}

// Initialize the Administrator page
document.addEventListener("DOMContentLoaded", displayReportedPosts);