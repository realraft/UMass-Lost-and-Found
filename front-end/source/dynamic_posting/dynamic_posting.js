import fs from "fs";

const FILE_PATH = "../Fake-Server/server.json";

/**
 * this function reads from server.json and returns a javascript object of the contents.
 *
 * @returns {JSON}
 */
function fetch_server_data() {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf8");
    const jsonData = JSON.parse(data);
    return jsonData;
  } catch (err) {
    console.error("Error reading File:", err);
  }
}

/**
 * Given an object representation of a post, this function appends the new post data to server.json
 *
 * @param {Object} new_post
 * @returns {void}
 */
function append_post(new_post) {
  const jsonData = fetch_server_data();

  if (Array.isArray(jsonData.posts)) {
    jsonData.posts.push(new_post);
  } else {
    // If posts doesn't exist or isn't an array, initialize it
    jsonData.posts = [new_post];
  }

  const updatedJson = JSON.stringify(jsonData, null, 2);

  try {
    fs.writeFileSync(FILE_PATH, updatedJson, "utf-8");
  } catch (error) {
    console.log(`Error writing to file:${error}`);
  }
}

/**
 * given the array from the post array in server.json, and the id of the post to remove.
 * This function returns the post object to remove, null if it does not exist.
 *
 * @param {Array} arr
 * @param {number} id
 * @returns {Object | undefined}
 */
function find_post_with_id(arr, id) {
  for (const element of arr) {
    if (element["id"] && element["id"] === id) {
      return element;
    }
  }

  return undefined;
}

/**
 * Removes post with given id if it exists, and returns the post that was removed, null otherwise.
 *
 * @param {number} post_id
 * @returns {Object | undefined}
 */
function remove_post(post_id) {
  const jsonData = fetch_server_data();

  const post_to_remove = find_post_with_id(jsonData.posts, post_id);

  if (post_to_remove === undefined) {
    return undefined; //post is not in the server;
  }

  if (Array.isArray(jsonData.posts)) {
    jsonData.posts = jsonData.posts.filter(
      (element) => element !== post_to_remove
    );

    const updatedJson = JSON.stringify(jsonData, null, 2);

    try {
      fs.writeFileSync(FILE_PATH, updatedJson, "utf-8");
      return post_to_remove;
    } catch (error) {
      console.log(`Error writing to file:${error}`);
    }
  }
}

/**
 * this function reads from server.json and dynamically generates posts to our posting page.
 * @returns {void}
 */
function render_posts() {
  const json_data = fetch_server_data();
}

