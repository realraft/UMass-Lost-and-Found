document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("postsContainer");
  
    // Fetch posts and reports from the server (make sure you're running a local server)
    fetch("../../Fake-Server/server.json")
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const posts = data.posts || []; // All posts
        const reports = data.reports || []; // All reports
  
        // Match posts with reports
        const reportedPosts = reports
          .flat()  // Flatten the array (since reports is an array of arrays)
          .map(report => {
            const post = posts.find(post => post.id === report.post_id); // Match report to post
            return post ? { ...post, report_text: report.report_text } : null; // Combine post details with report text
          })
          .filter(post => post !== null); // Exclude any unmatched reports
  
        // Render reported posts only
        renderReportedPosts(reportedPosts);
      })
      .catch(error => console.error("Error fetching data:", error));
  
    function renderReportedPosts(reportedPosts) {
      postsContainer.innerHTML = ""; // Clear container
  
      if (reportedPosts.length === 0) {
        postsContainer.innerHTML = "<p>No reported posts available.</p>";
        return;
      }
  
      reportedPosts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.description || "No description provided."}</p>
          <p><strong>Report:</strong> ${post.report_text}</p>
          <p><strong>Location:</strong> ${post.location || "Unknown"}</p>
          <p><strong>Date:</strong> ${post.date || "Unknown date"}</p>
          <button class="keep-button" data-id="${post.id}">Keep</button>
          <button class="delete-button" data-id="${post.id}">Delete</button>
        `;
        postsContainer.appendChild(postElement);
      });
  
      addActionHandlers(); // Attach button event handlers
    }
  
    function addActionHandlers() {
      const keepButtons = document.querySelectorAll(".keep-button");
      const deleteButtons = document.querySelectorAll(".delete-button");
  
      // Keep button functionality
      keepButtons.forEach(button => {
        button.addEventListener("click", () => {
          const postId = button.getAttribute("data-id");
          console.log(`Post with ID ${postId} kept.`);
          alert(`Post with ID ${postId} has been marked as kept.`);
          // Optional: Additional logic to handle "kept" posts
        });
      });
  
      // Delete button functionality
      deleteButtons.forEach(button => {
        button.addEventListener("click", () => {
          const postId = button.getAttribute("data-id");
          deletePost(postId);
        });
      });
    }
  
    function deletePost(postId) {
      const button = document.querySelector(`.delete-button[data-id="${postId}"]`);
      const postToDelete = button.closest(".post"); // Locate the closest parent `.post` container
  
      if (postToDelete) {
        postsContainer.removeChild(postToDelete); // Remove post element dynamically
        console.log(`Post with ID ${postId} deleted.`);
        alert(`Post with ID ${postId} has been deleted.`);
      } else {
        console.error(`Post with ID ${postId} not found.`);
      }
    }
  });