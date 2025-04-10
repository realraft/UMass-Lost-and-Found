document.addEventListener('DOMContentLoaded', function () {
    const dbRequest = indexedDB.open("UMassLostAndFoundDB", 1);

    dbRequest.onsuccess = function (event) {
        const db = event.target.result;

        // Get both posts and reports
        Promise.all([
            getAllFromStore(db, "posts"),
            getAllFromStore(db, "reports")
        ])
        .then(([posts, reports]) => {
            renderReports(reports, posts);
        })
        .catch(error => {
            console.error("Error retrieving data from IndexedDB:", error);
        });
    };

    dbRequest.onerror = function (event) {
        console.error("Error opening IndexedDB in Admin:", event.target.errorCode);
    };

    function getAllFromStore(db, storeName) {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function (error) {
                reject(error);
            };
        });
    }

    function renderReports(reports, posts) {
        const container = document.getElementById("reportList");
        container.innerHTML = "";

        if (reports.length === 0) {
            container.innerHTML = "<p>No reports found.</p>";
            return;
        }

        reports.forEach(report => {
            const post = posts.find(p => p.id === report.post_id);
            const title = post ? post.title : "(Post not found)";

            const reportElement = document.createElement("div");
            reportElement.classList.add("report");

            reportElement.innerHTML = `
                <h4>Report for: <em>${title}</em></h4>
                <p>${report.report_text}</p>
                <small>${new Date(report.timestamp).toLocaleString()}</small>
                <hr />
            `;

            container.appendChild(reportElement);
        });
    }
});
