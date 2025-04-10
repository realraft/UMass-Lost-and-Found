document.addEventListener("DOMContentLoaded", () => {
    const postsContainer = document.getElementById("postsContainer");

    // Dynamically generate posts (mocked for simplicity; replace with actual data fetch)
    fetch('./Fake-Server/server.json') // Adjust path as needed
        .then(response => response.json())
        .then(data => {
            const posts = data.posts;
            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.className = "post";
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.description || "No description provided."}</p>
                    <p>Category: ${post.category || "Uncategorized"}</p>
                    <p>Date: ${post.date || "Unknown date"}</p>
                    <button class="keep-button" data-id="${post.id}">Keep</button>
                    <button class="delete-button" data-id="${post.id}">Delete</button>
                `;
                postsContainer.appendChild(postElement);
            });
            addActionHandlers();
        });

    function addActionHandlers() {
        const keepButtons = document.querySelectorAll(".keep-button");
        const deleteButtons = document.querySelectorAll(".delete-button");

        // Keep button functionality
        keepButtons.forEach(button => {
            button.addEventListener("click", () => {
                const postId = button.getAttribute("data-id");
                console.log(`Post with ID ${postId} kept.`);
                // Optional functionality: mark post as reviewed
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
        const postToDelete = document.querySelector(`button[data-id="${postId}"]`).parentElement;
        postsContainer.removeChild(postToDelete); // Remove post element dynamically

        console.log(`Post with ID ${postId} deleted.`);
        // Optional: Remove from server or IndexedDB
    }
});
