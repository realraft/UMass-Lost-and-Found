// Fetch both posts and reports from server.json at the same time
async function fetchServerData() {
    try {
      const response = await fetch("server.json");
      const data = await response.json();
      return data; // returns both posts and reports in one object
    } catch (error) {
      console.error("Error fetching server data:", error);
      return null;
    }
  }
  
  // Display posts and reports on the Administrator page
  async function displayReportedPosts() {
    const postsContainer = document.getElementById("postsContainer");
  
    // Show a loading state while fetching data
    postsContainer.innerHTML = "<p>Loading posts...</p>";
  
    const data = await fetchServerData();
  
    if (!data) {
      postsContainer.innerHTML = "<p>Error loading posts or reports.</p>";
      return;
    }
  
    const posts = data.posts || [];
    const reports = data.reports[0] || [];  // Get the reports from the first array (there's just one)
  
    // Create a map of posts and add their reports if available
    const postsWithReports = posts.map(post => {
      const report = reports.find(report => report.post_id === post.id);
      return { ...post, report: report || null };
    });
  
    // Clear the container before rendering new content
    postsContainer.innerHTML = "";
  
    if (postsWithReports.length === 0) {
      postsContainer.innerHTML = "<p>No reported posts found.</p>";
      return;
    }
  
    // Render each post along with its associated report (if any)
    postsWithReports.forEach(post => {
      const reportReason = post.report ? post.report.report_text : "No report submitted.";
  
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
  