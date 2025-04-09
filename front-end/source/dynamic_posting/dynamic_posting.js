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
    const listings_container = document.querySelector("div.listing-container");

    const new_post = document.createElement("div");
    new_post.classList.add("listing");

    new_post.id = post["id"];

    const h3_element = document.createElement("h3");
    h3_element.classList.add("title");
    h3_element.innerHTML = post["title"]
      ? post["title"]
      : "Title: Not Supplied";
    new_post.appendChild(h3_element);

    const p_element = document.createElement("p");
    p_element.classList.add("date");
    p_element.innerHTML = post["date"]
      ? "Date found: " + post["date"]
      : "Date: Not supplied";
    new_post.appendChild(p_element);

    const p_element2 = document.createElement("p");
    p_element2.classList.add("description");

    p_element2.innerHTML = post["description"]
      ? "Description: " + post["description"]
      : "Description: Not supplied";
    new_post.appendChild(p_element2);

    const p_element3 = document.createElement("p");
    p_element3.classList.add("tags");
    p_element3.innerHTML = post["tags"] && post["tags"].length > 0
      ? "Tags: " + post["tags"].join(", ")
      : "Tags: Not supplied";
    new_post.appendChild(p_element3);

    const p_element4 = document.createElement("p");
    p_element4.classList.add("location");
    p_element4.innerHTML = post["location"] && post["location"] !== ""
      ? "Location: " + post["location"]
      : "Location: Not supplied";
    new_post.appendChild(p_element4);

    const button_element = document.createElement("button");
    button_element.classList.add("report-button");

    button_element.innerHTML = "Report Listing";
    button_element.dataset.item = post["title"]; // need to fix functionality with report button ask nathan.
    button_element.addEventListener("click", function () {
      alert("Reporting: " + button_element.dataset.item);
    });

    new_post.appendChild(button_element);

    listings_container.appendChild(new_post);
  }
}

render_posts();
