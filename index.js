/*
 *primary file for API
 */

// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./lib/config");
const fs = require("fs");
const handlers = require("./lib/handlers");
const helpers = require("./lib/helpers");

// Instantiating the HTTPServer
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// Start the HTTP server, have it listen on port 5000
httpServer.listen(config.httpPort, function () {
  console.log("The server is listening on port: " + config.httpPort);
});

// Instantianting the HTTPS Server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
  console.log("The HTTPs Server is listening on port: " + config.httpsPort);
});

// All the server logic for both the http and https server
const unifiedServer = function (req, res) {
  // Get the url and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  //   Get the query string as an object
  const queryStringObject = parsedUrl.query;

  //   Get the HTTP methods
  const method = req.method.toLocaleLowerCase();

  //   Get the headers as an object
  const headers = req.headers;

  //   Get the payloads, if there is any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();

    //Choose the handler this request should go to. If not found, use the notFound handler
    const chosenHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Construct the data object to send to the handler
    const data = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      //   Use the payload called back by the handler, or default to empty object
      payload = typeof payload == "object" ? payload : {};

      //   Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response", statusCode, payloadString);
    });
  });
};

// Define a request router
const router = {
  ping: handlers.ping,
  users: handlers.users,
};
