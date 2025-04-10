// Fetch data from the fake server
async function fetchData() {
    try {
      // Replace with the actual path to your JSON file
      const response = await fetch("server.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }
  
  // Filter and render reported posts
  async function displayReportedPosts() {
    const postsContainer = document.getElementById("postsContainer");
    const data = await fetchData();
  
    if (!data) {
      postsContainer.innerHTML = "<p>No posts reported found</p>";
      return;
    }
  
    const { posts, reports } = data;
  
    // Filter reported posts by checking if their IDs exist in the reports array
    const reportedPosts = posts.filter(post =>
      reports.some(report => report.post_id === post.id)
    );
  
    // Clear container before rendering
    postsContainer.innerHTML = "";
  
    // Render each reported post dynamically
    if (reportedPosts.length === 0) {
      postsContainer.innerHTML = "<p>No reported posts found.</p>";
      return;
    }
  
    reportedPosts.forEach(post => {
      // Find the report reason corresponding to the post ID
      const report = reports.find(report => report.post_id === post.id);
      const reportReason = report ? report.report_text : "No reason provided.";
  
      // Create the post element with report details
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
  
  // Open the modal for editing or deleting a post
  function openEditDeleteModal(postId) {
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("editDeleteModal");
  
    overlay.style.display = "block";
    modal.style.display = "block";
  
    // Set the modal title to show the post ID
    document.getElementById("editDeleteTitle").innerText = `Edit/Delete Post ID: ${postId}`;
  
    // Add event listeners for Save and Delete buttons
    document.getElementById("saveChangesButton").onclick = () => saveChanges(postId);
    document.getElementById("deleteReportButton").onclick = () => deletePost(postId);
  }
  
  // Save changes to a reported post
  function saveChanges(postId) {
    const editReason = document.getElementById("editReason").value;
  
    if (!editReason) {
      alert("Please provide a reason for editing.");
      return;
    }
  
    // Simulate saving changes (Replace with actual server-side logic)
    console.log(`Changes saved for Post ID ${postId}: ${editReason}`);
    closeModal();
  }
  
  // Delete a reported post
  function deletePost(postId) {
    // Simulate deleting the post (Replace with actual server-side logic)
    console.log(`Post ID ${postId} has been deleted.`);
    closeModal();
  
    // Optionally refresh the list of reported posts
    displayReportedPosts();
  }
  
  // Close the modal
  function closeModal() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("editDeleteModal").style.display = "none";
  }
  
  // Initialize the admin panel and populate reported posts
  document.addEventListener("DOMContentLoaded", displayReportedPosts);