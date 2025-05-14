/*
 *primary file for API
 */

// Dependencies
const http = require("http");
const url = require("url");

// The server should respond to all request witha string
const server = http.createServer(function (req, res) {
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

  // Send the response
  res.end("Hello wolrd\n");

  // Log the request path
  console.log("Request received with these headers", headers);
});

// Start the server, have it listen on port 5000
server.listen(5000, function () {
  console.log("The server is listening on port 5000");
});
