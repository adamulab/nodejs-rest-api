/*
 *Helpers for various tasks
 */

// Dependencies
const crypto = require("crypto");
const config = require("./config");

// Container for all helpers
const helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    // Hash the string
    const hash = crypto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object in all cases without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

// Create a string of alphanumeric characters of a given length
helpers.createRandomString = function (strlength) {
  strlength = typeof strlength == "number" && strlength > 0 ? strlength : false;
  if (strlength) {
    // Define all the possible characters that could go into a string
    const possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    // start the final string
    let str = "";
    for (i = 1; i <= strlength; i++) {
      // Get a random character from the possible characters string
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      // Append the character to the final string
      str += randomCharacter;
    }

    // Return the final String
    return str;
  } else {
    return false;
  }
};

// Export module
module.exports = helpers;
