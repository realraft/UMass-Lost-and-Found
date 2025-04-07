const fs = require("fs");

const FILE_PATH = "../Fake-Server/server.json";

/**
 * this function reads from the fake_server.json and returns the json representation of the contents.
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
 * @param {JSON} input_post_data post data formatted in JSON
 * @returns {void}
 */
function append_server_data(input_post_data) {
  const jsonData = transverse_post_data();

  jsonData.newSection = input_post_data;

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
