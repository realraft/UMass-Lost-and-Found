document.addEventListener("DOMContentLoaded", () => {
    const dbRequest = indexedDB.open("LostAndFoundDB", 1);

    dbRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("posts")) {
            db.createObjectStore("posts", { keyPath: "id" });
        }
    };

    dbRequest.onsuccess = (event) => {
        const db = event.target.result;

        // Fetch posts from server and store in IndexedDB
        fetchPostsAndStore(db);
 
        // Render posts from IndexedDB after fetching
        renderPostsFromIndexedDB(db);
    };

    function fetchPostsAndStore(db) {
        fetch('http://localhost:3000/posts') // Adjust path based on server.json location
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }
                return response.json();
            })
            .then(posts => {
                const transaction = db.transaction("posts", "readwrite");
                const store = transaction.objectStore("posts");
                posts.forEach(post => store.put(post));

                transaction.oncomplete = () => {
                    console.log("Posts fetched and stored in IndexedDB.");
                    renderPostsFromIndexedDB(db); // Re-render after fetch
                };
            })
            .catch(error => {
                console.error("Error fetching posts:", error);
            });
    }

    function renderPostsFromIndexedDB(db) {
        const transaction = db.transaction("posts", "readonly");
        const store = transaction.objectStore("posts");

        store.getAll().onsuccess = (event) => {
            const posts = event.target.result;

            // Clear existing posts and render dynamically
            const postsContainer = document.getElementById("homePagePosts");
            postsContainer.innerHTML = "";
            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.className = "post";
                postElement.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.description || "No description provided."}</p>
                    <p>Category: ${post.category || "Uncategorized"}</p>
                    <p>Date: ${post.date || "Unknown date"}</p>
                `;
                postsContainer.appendChild(postElement);
            });
        };
    }
});