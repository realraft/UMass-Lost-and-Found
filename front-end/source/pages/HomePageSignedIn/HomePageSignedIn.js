// IndexedDB setup
const dbName = "LostAndFoundReportsDB";
const storeName = "reports";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = (event) => reject("Error opening IndexedDB");
    request.onsuccess = (event) => resolve(event.target.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

async function addReport(report) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.add(report);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to add report");
  });
}

// Fetch and display posts from server.json
fetch("../../server.json")
  .then((response) => response.json())
  .then((data) => {
    const posts = data.posts;
    const postsContainer = document.getElementById("postsContainer");

    posts.forEach((post) => {
      const postEl = document.createElement("div");
      postEl.className = "post";

      postEl.innerHTML = `
        <h4>${post.title}</h4>
        <p><strong>Description:</strong> ${post.description || "N/A"}</p>
        <p><strong>Location:</strong> ${post.location}</p>
        <p><strong>Date:</strong> ${post.date}</p>
        <p><strong>Tags:</strong> ${post.tags.join(", ")}</p>
        <button class="reportBtn" data-post-id="${post.id}">Report Listing</button>
        <hr/>
      `;

      postsContainer.appendChild(postEl);
    });
  });

// === Modal Handling ===
let currentPostId = null;

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("reportBtn")) {
    currentPostId = parseInt(e.target.getAttribute("data-post-id"));
    document.getElementById("reportModal").style.display = "block";
  }
});

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("reportModal").style.display = "none";
  document.getElementById("reportText").value = "";
});

document.getElementById("submitReport").addEventListener("click", async () => {
  const reportText = document.getElementById("reportText").value.trim();

  if (reportText && currentPostId !== null) {
    try {
      await addReport({ post_id: currentPostId, report_text: reportText });

      alert("Report submitted!");
      document.getElementById("reportModal").style.display = "none";
      document.getElementById("reportText").value = "";
    } catch (err) {
      alert("Error submitting report: " + err);
    }
  } else {
    alert("Please enter a report before submitting.");
  }
});
