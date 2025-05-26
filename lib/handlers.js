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

// ================ User Handler starts ======================
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

// ================ User Handler ends ======================

// ================ Tokens Handler starts ======================
// Tokens handler
handlers.tokens = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._tokens = {};

// Tokens - post
handlers._tokens.post = function (data, callback) {
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

  if (phone && password) {
    // Lookup user who matches the phone number
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        // Hash the password and compare it to the password stored in the user data
        const hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // Create a new token with a random name and set expiration date 1 hour into the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          // Store the token
          _data.create("tokens", tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create token" });
            }
          });
        } else {
          callback(400, {
            Error:
              "Password did not match the specified user's stored password",
          });
        }
      } else {
        callback(400, { Error: "Could not find the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Tokens - Get
// Required data = id
// Optional Data = none
handlers._tokens.get = function (data, callback) {
  // Check if the phone number is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the use
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { Error: "That token does not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields or token is incomplete" });
  }
};

// Tokens - Update
// Required Data = id, extend
// Optional Data = none
handlers._tokens.put = function (data, callback) {
  const id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  const extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;

  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure token hasn't expired
        if (tokenData.expires > Date.now()) {
          // Extend token by an hour from now
          tokenData.expires = Date.now() + 100 * 60 * 60;

          // Store the new token update
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200, tokenData);
            } else {
              callback(500, {
                Error: "Could not update the token expiration time",
              });
            }
          });
        } else {
          callback(400, {
            Error: "Token has expired, and can not be extended",
          });
        }
      } else {
        callback(404, { Error: "Specified token does not exist" });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) if field(s) are invalid",
    });
  }
};

// Tokens - Delete
handlers._tokens.delete = function (data, callback) {
  // Check that the phone number is valid
  const id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the tokens
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Error deleting token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
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
