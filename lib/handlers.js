/*
 *Request Handlers
 */

// Dependencies
const { log } = require("console");
const _data = require("./data");
const helpers = require("./helpers");

// Define the handlers
const handlers = {};

// ping handler
handlers.ping = function (data, callback) {
  callback(200);
};

// Users handler
handlers.users = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// User - post
// Requierd data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone === "string" &&
    data.payload.phone.trim().length === 11
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement === "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the user don't already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreeent: true,
          };

          // Store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not create new user!" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the password" });
        }
      }
      // User already exist
      else
        callback(400, {
          Error: "A user with that phone number already exist.",
        });
    });
  } else {
    callback(400, { Error: "Missing required fileds" });
  }
};

// User - get
// Requiered data: phone
// Optional data: none
// @TODO only let authenticated users access only their own objects.
handlers._users.get = function (data, callback) {
  // Check if the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 11
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Lookup the use
    _data.read("users", phone, function (err, data) {
      if (!err && data) {
        // Remove the hashed password from the user object before returning it
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// User - put
// Required field: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// @TODO only let an authenticated user update their own objct
handlers._users.put = function (data, callback) {
  // Check got the required fields
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 11
      ? data.payload.phone.trim()
      : false;

  // Check for the optional fields
  const firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password === "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  // Check if the phone is valid
  if (phone) {
    // Check if field is provided for update
    if (firstName || lastName || password) {
      // Loookup user
      _data.read("users", phone, function (err, userData) {
        if (!err && userData) {
          // Update the fields necessary
          if (firstName) {
            userData.firstName = firstName;
          }
          if (lastName) {
            userData.lastName = lastName;
          }
          if (password) {
            userData.hashedPassword = helpers.hash(password);
          }

          // Store the new update
          _data.update("users", phone, userData, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.log(err);
              callback(500, { Error: "Could not update the user" });
            }
          });
        } else {
          callback(400, { Error: "The specified user does not exist" });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// User - delete
// Required field: phone
// @TODO Only let authenticated users delete their own object
// @TODO cleanup (delete) any associated data files for the user
handlers._users.delete = function (data, callback) {
  // Check that the phone number is valid
  const phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 11
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Lookup the use
    _data.read("users", phone, function (err, data) {
      if (!err && data) {
        _data.delete("users", phone, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Error deleting user" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Export module
module.exports = handlers;
