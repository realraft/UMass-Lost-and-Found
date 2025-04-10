import { initDB, getAllReports } from "../indexedDB.js";

document.addEventListener("DOMContentLoaded", async () => {
  const postsContainer = document.getElementById("postsContainer");

  // Initialize IndexedDB
  await initDB();

  // Fetch posts from server.json
  const response = await fetch("../../server.json");
  const data = await response.json();
  const posts = data.posts;

  // Get all reports from IndexedDB
  const reports = await getAllReports();

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

    postDiv.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.description || "No description."}</p>
      <p><strong>Location:</strong> ${post.location}</p>
      <p><strong>Date:</strong> ${post.date}</p>
      ${
        associatedReports.length > 0
          ? `<div class="reports">
              <strong>Reports:</strong>
              <ul>${associatedReports.map((r) => `<li>${r}</li>`).join("")}</ul>
             </div>`
          : `<p><em>No reports.</em></p>`
      }
    `;

    postsContainer.appendChild(postDiv);
  });
});