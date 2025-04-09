document.addEventListener("DOMContentLoaded", () => {
    const getRequest = indexedDB.open("LostAndFoundDB", 1);

    getRequest.onsuccess = (event) => {
        const getDatabase = event.target.result;

        const sortOptions = document.querySelectorAll('input[name="sort"]');

        // Initial fetch and render with the default sort order
        fetchAndRenderReports(getDatabase, "newest");

        // Listen for changes in sorting options
        sortOptions.forEach(option => {
            option.addEventListener("change", () => {
                const sortOrder = document.querySelector('input[name="sort"]:checked').value;
                fetchAndRenderReports(getDatabase, sortOrder);
            });
        });
    };

    function fetchAndRenderReports(getDatabase, sortOrder) {
        const transaction = getDatabase.transaction("reports", "readonly");
        const storeReports = transaction.objectStore("reports");

        storeReports.getAll().onsuccess = (event) => {
            let reports = event.target.result;

            // Sort reports based on the chosen order
            reports = reports.sort((a, b) => {
                if (sortOrder === "newest") {
                    return new Date(b.timestamp) - new Date(a.timestamp);
                } else {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                }
            });

            const adminReportsContainer = document.getElementById("adminReports");
            adminReportsContainer.innerHTML = ""; // Clear container

            // Render each report and make it clickable
            reports.forEach(report => {
                const currPost = document.createElement("div");
                currPost.className = "currPost";
                currPost.innerHTML = `
                    <h3>${report.itemName}</h3>
                    <p>${report.reason || "No note provided."}</p>
                    <p>${new Date(report.timestamp).toLocaleString()}</p>
                `;
                currPost.onclick = () => openModal(report); // Open modal on click
                adminReportsContainer.appendChild(currPost);
            });
        };
    }

    function openModal(report) {
        // Populate modal with report details
        document.getElementById("modalTitle").textContent = report.itemName;
        document.getElementById("modalReason").textContent = `Reason for report: ${report.reason || "No note provided."}`;
        document.getElementById("modalTimestamp").textContent = `Date reported: ${new Date(report.timestamp).toLocaleString()}`;

        // Display modal and overlay
        document.getElementById("postOverlay").style.display = "block";
        document.getElementById("postModal").style.display = "block";
    }

    function closeModal() {
        // Hide modal and overlay
        document.getElementById("postOverlay").style.display = "none"; 
        document.getElementById("postModal").style.display = "none";
    } 

    function handleDelete() {
        // Logic to delete post
        alert("Post has been deleted.");
        closeModal();
    }

    function handleKeep() {
        // Logic to keep post
        alert("Post has been retained.");
        closeModal();
    }
});