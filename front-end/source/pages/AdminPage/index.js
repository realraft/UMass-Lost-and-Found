document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("postsContainer");

  // Fetch posts from server.json
  const response = await fetch("../../server.json");
  const data = await response.json();
  const posts = data.posts;

  // Get all reports from IndexedDB
  const reports = data.reports;

  // Create a mapping of post_id to associated reports
  const reportMap = {};
  reports.forEach((report) => {
    if (!reportMap[report.post_id]) {
      reportMap[report.post_id] = [];
    }
    reportMap[report.post_id].push(report.report_text);
  });

  // Render each post along with its associated reports
  posts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    const associatedReports = reportMap[post.id] || [];

    // Construct the HTML for the post
    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.description || "No description."}</p>
      <p><strong>Location:</strong> ${post.location}</p>
      <p><strong>Date:</strong> ${post.date}</p>
      <p><strong>Anonymous:</strong> ${post.anon ? "Yes" : "No"}</p>
      <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
      <p><strong>User ID:</strong> ${post.user_id}</p>
      ${
        associatedReports.length > 0
          ? `<div class="reports">
              <strong>Reports:</strong>
              <ul>${associatedReports.map((r) => `<li>${r}</li>`).join("")}</ul>
             </div>`
          : `<p><em>No reports.</em></p>`
      }
    `;

    // Create and add the "View" button
    const viewButton = document.createElement("button");
    viewButton.className = "view-button";
    viewButton.innerHTML = "View"; // Set the button text to "View"
    viewButton.addEventListener("click", function () {
      // Action when the "View" button is clicked
      alert(`Viewing: ${post.title}`); // Example: display an alert with the post title, replace with desired functionality
    });

    // Append the "View" button to the postDiv
    postDiv.appendChild(viewButton);

    // Append the post to the posts container
    postsContainer.appendChild(postDiv);
  });
});
