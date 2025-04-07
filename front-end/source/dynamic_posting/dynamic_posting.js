const { error } = require("console");
const fs = require("fs");

const FILE_PATH = "../Fake-Server/server.json";

/**
 * this function reads from  server.json and returns the json representation of the contents.
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
 * Given a json representation of a post, this function appends the new post data to server.json
 *
 * @param {JSON} new_post post data formatted in JSON
 * @returns {void}
 */
function append_new_post(new_post) {
  const jsonData = transverse_post_data();

  if (Array.isArray(jsonData.posts)) {
    jsonData.posts.push(newPost);
  } else {
    // If posts doesn't exist or isn't an array, initialize it
    jsonData.posts = [newPost];
  }

  const updatedJson = JSON.stringify(jsonData, null, 2);

  try {
    fs.writeFileSync(FILE_PATH, updatedJson, "utf-8");
  } catch (error) {
    console.log(`Error writing to file:${error}`);
  }
}

/**
 * Given a json representation of a post, this function deletes the post from  server.json
 *
 * @param {JSON} new_post post data formatted in JSON
 * @returns {void}
 */
function remove_post(post) {
  const jsonData = transverse_post_data();

  let index = jsonData.posts.indexOf(post);

  if (Array.isArray(jsonData.posts) && index !== -1) {
    jsonData.posts.splice(index, 1);
  } else {
    console.log("Posts array does not exist");
  }

  const updatedJson = JSON.stringify(jsonData, null, 2);

  try {
    fs.writeFileSync(FILE_PATH, updatedJson, "utf-8");
  } catch (error) {
    console.log(`Error writing to file:${error}`);
  }
}

/**
 * this function reads from server.json and dynamically generates posts to our posting page.
 * @returns {void}
 */
function generate_posts() {
  const json_data = fetch_server_data();
}
