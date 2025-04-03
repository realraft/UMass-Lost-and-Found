document.addEventListener("DOMContentLoaded", () => {
    const reportButtons = document.querySelectorAll(".report-button");
    const modal = document.getElementById("reportModal");
    const overlay = document.getElementById("overlay");
    const closeButton = document.querySelector(".close");
    const reportTitle = modal.querySelector("h2");

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
    });

    overlay.addEventListener("click", () => {
        modal.style.display = "none";
        overlay.style.display = "none";
    });
});