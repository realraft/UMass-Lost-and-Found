// import fs from "fs";

const FILE_PATH = "./source/Fake-Server/server.json";

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
async function render_posts() {
  const json_data = await fetch_server_data();

  // might need to change how we update this!!!!
  for (const post of json_data["posts"]) {
    const listings_container = document.querySelector("div.listing-container");

    const new_post = document.querySelector("div.listing").cloneNode(true);

    new_post.id = post["id"];

    new_post.querySelector("h3.title").innerHTML = post["title"]
      ? post["title"]
      : "Title: Not Supplied";
    new_post.querySelector("p.date-found").innerHTML = post["date"]
      ? "Date found: " + post["date"]
      : "Date: Not supplied";

    new_post.querySelector("p.location").innerHTML = post["location"]
      ? "Location: " + post["location"]
      : "Location: Not supplied";

    new_post.querySelector("p.category").innerHTML = post["category"]
      ? "Category: " + post["category"]
      : "Category: Not supplied";

    new_post.querySelector("p.poster").innerHTML = post["anon_listing"]
      ? "Poster: Anonymous"
      : "Poster:" + post["user"];

    new_post.querySelector("button.report-button").dataset.item = post["title"]; // need to fix functionality with report button ask nathan.

    listings_container.appendChild(new_post);
  }
}

render_posts();