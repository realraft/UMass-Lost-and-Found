import { EventHub } from "../eventHub/EventHub.js";
import { Events } from "../eventHub/Events.js";

// import fs from "fs";

const FILE_PATH = "../../Fake-Server/server.json";

/**
 * this function reads from server.json and returns a javascript object of the contents.
 *
 * @returns {object}
 */
async function fetch_server_data() {
  try {
    // Make the GET request for the JSON file. Adjust the path if needed.
    const response = await fetch(FILE_PATH);

    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON content from the response
    const data = await response.json();

    // Do something with the data (for instance, log it to the console)
    console.log("Data fetched", data);

    return data;
  } catch (error) {
    console.error("Error fetching JSON file:", error);
  }
}

/**
 * this function reads from server.json and dynamically generates posts to our posting page.
 * @returns {void}
 */
// ...existing code...

async function render_posts() {
  const json_data = await fetch_server_data();

  // might need to change how we update this!!!!
  for (const post of json_data["posts"]) {
    const listings_container = document.querySelector("div.listing-container");

    const new_post = document.createElement("div");
    new_post.classList.add("listing");
    new_post.id = post["id"];

    // Title
    const title_wrapper = document.createElement("h3");
    const title_value = document.createElement("span");
    title_value.classList.add("title");
    title_value.textContent = post["title"] || "Not Supplied";
    title_wrapper.appendChild(title_value);
    new_post.appendChild(title_wrapper);

    // Date
    const date_wrapper = document.createElement("p");
    const date_value = document.createElement("span");
    date_value.classList.add("date");
    date_value.textContent = post["date"] || "Not supplied";
    date_wrapper.textContent = "Date found: ";
    date_wrapper.appendChild(date_value);
    new_post.appendChild(date_wrapper);

    // Description
    const desc_wrapper = document.createElement("p");
    const desc_value = document.createElement("span");
    desc_value.classList.add("description");
    desc_value.textContent = post["description"] || "Not supplied";
    desc_wrapper.textContent = "Description: ";
    desc_wrapper.appendChild(desc_value);
    new_post.appendChild(desc_wrapper);

    // Tags
    const tags_wrapper = document.createElement("p");
    const tags_value = document.createElement("span");
    tags_value.classList.add("tags");
    tags_value.textContent = post["tags"] && post["tags"].length > 0
      ? post["tags"].join(", ")
      : "Not supplied";
    tags_wrapper.textContent = "Tags: ";
    tags_wrapper.appendChild(tags_value);
    new_post.appendChild(tags_wrapper);

    // Location
    const location_wrapper = document.createElement("p");
    const location_value = document.createElement("span");
    location_value.classList.add("location");
    location_value.textContent = post["location"] || "Not supplied";
    location_wrapper.textContent = "Location: ";
    location_wrapper.appendChild(location_value);
    new_post.appendChild(location_wrapper);

    // Report button
    const button_element = document.createElement("button");
    button_element.classList.add("report-button");
    button_element.innerHTML = "Report Listing";
    button_element.dataset.item = post["title"];
    button_element.addEventListener("click", function () {
      alert("Reporting: " + button_element.dataset.item);
    });
    new_post.appendChild(button_element);

    listings_container.appendChild(new_post);
  }
}

// Add test function for creating a new post
function testAddNewPost() {
  const hub = EventHub.getEventHubInstance();
  const newPost = {
    id: Date.now().toString(), // Generate a unique ID
    title: "Test Post",
    description: "This is a test post to verify real-time updates",
    date: new Date().toISOString().split('T')[0],
    location: "Library",
    tags: ["Test", "Electronics"],
  };
  
  hub.publish(Events.NewPost, newPost);
}

// Add a test button to the page
const testButton = document.createElement("button");
testButton.textContent = "Add Test Post";
testButton.style.position = "fixed";
testButton.style.bottom = "20px";
testButton.style.right = "20px";
testButton.style.zIndex = "1000";
testButton.addEventListener("click", testAddNewPost);
document.body.appendChild(testButton);

render_posts();
