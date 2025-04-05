document.addEventListener("DOMContentLoaded", () => {
    const reportButtons = document.querySelectorAll(".report-button");
    const modal = document.getElementById("reportModal");
    const overlay = document.getElementById("overlay");
    const closeButton = document.querySelector(".close");
    const reportTitle = modal.querySelector("h2");
    const reportForm = document.getElementById("reportForm");
    const reasonInput = document.getElementById("reportReason"); 
    let currentItem = null;

    const dbRequest = indexedDB.open("LostAndFoundDB", 1);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("reports")) {
            db.createObjectStore("reports", { keyPath: "id", autoIncrement: true });
        }
    };

    let db;
    dbRequest.onsuccess = (event) => {
        db = event.target.result;
    };

    dbRequest.onerror = (event) => {
        console.error("IndexedDB error:", event.target.errorCode);
    };

    // --- Open Report Modal ---
    reportButtons.forEach(button => {
        button.addEventListener("click", () => {
            currentItem = button.getAttribute("data-item");
            reportTitle.textContent = `Report ${currentItem}`;
            modal.style.display = "block";
            overlay.style.display = "block";
        });
    });

    // --- Close Modal ---
    const closeModal = () => {
        modal.style.display = "none";
        overlay.style.display = "none";
        reportForm.reset();
    };

    closeButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", closeModal);

    // --- Submit Report ---
    reportForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const reason = reasonInput.value.trim();

        if (db && currentItem && reason) {
            const tx = db.transaction("reports", "readwrite");
            const store = tx.objectStore("reports");
            const report = {
                item: currentItem,
                reason: reason,
                timestamp: new Date().toISOString()
            };
            store.add(report);

            tx.oncomplete = () => {
                alert("Report submitted.");
                closeModal();
            };

            tx.onerror = () => {
                console.error("Failed to submit report");
            };
        }
    });
});
