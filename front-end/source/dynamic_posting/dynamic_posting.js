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
async function render_posts() {
  const json_data = await fetch_server_data();

  // might need to change how we update this!!!!
  for (const post of json_data["posts"]) {
    const targetDiv = document.querySelector("div.posts-container");

    const new_post = document.querySelector("div.post").cloneNode(true);

    new_post.id = post["id"];

    
    // we need to change the ids of the stuff were generating for the boxes

    targetDiv.appendChild(new_post);

    // when we create a new div post we need to assign it a unique id thats in the server.
  }
}

render_posts();
