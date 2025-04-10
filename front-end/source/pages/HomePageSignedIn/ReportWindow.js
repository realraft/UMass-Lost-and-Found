document.addEventListener("DOMContentLoaded", () => {
    const reportButtons = document.querySelectorAll(".report-button");
    const modal = document.getElementById("reportModal");
    const overlay = document.getElementById("overlay");
    const closeButton = document.querySelector(".close");
    const reportTitle = modal.querySelector("h2");
    const reportForm = document.getElementById("reportForm");
    const reportReasonInput = document.getElementById("reportReason");

    modal.style.display = "none";
    overlay.style.display = "none";

    const request = indexedDB.open("LostAndFoundDB", 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("reports")) {
            db.createObjectStore("reports", { keyPath: "timestamp" });
        } 
    };

    request.onerror = function() {
        console.error("Error opening IndexedDB.");
    };

    reportForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const reportReason = reportReasonInput.value.trim();
        const itemName = reportTitle.textContent.replace("Report ", "");

        if (reportReason === "") {
            alert("Please provide a reason for reporting.");
            return;
        }

        const dbRequest = indexedDB.open("LostAndFoundDB", 1);

        dbRequest.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction("reports", "readwrite");
            const store = transaction.objectStore("reports");

            const report = {
                itemName: itemName,
                reason: reportReason,
                timestamp: new Date().toISOString()
            };

            const addRequest = store.add(report);

            addRequest.onsuccess = function() {
                console.log("Report saved successfully.");
             
                modal.style.display = "none";
                overlay.style.display = "none";
                reportReasonInput.value = ""; 
            };

            addRequest.onerror = function() {
                console.error("Error saving report to IndexedDB.");
            };
        };

        dbRequest.onerror = function() {
            console.error("Error accessing IndexedDB.");
        };
    });

    reportButtons.forEach(button => {
        button.addEventListener("click", () => {
            const itemName = button.getAttribute("data-item");
            reportTitle.textContent = `Report ${itemName}`;
            modal.style.display = "block";
            overlay.style.display = "block";
        });
    });

 
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        overlay.style.display = "none";
        reportReasonInput.value = ""; // Reset input
    });

    overlay.addEventListener("click", () => {
        modal.style.display = "none";
        overlay.style.display = "none";
        reportReasonInput.value = ""; 
    });
});