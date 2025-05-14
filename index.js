/*
 *primary file for API
 */

// Dependencies
const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

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

  //   Get the payloads, if there is any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });
  req.on("end", function () {
    buffer += decoder.end();

    //
    // Send the response
    res.end("Hello wolrd\n");

    // Log the request path
    console.log("Request received with this payload: ", buffer);
  });
});

// Start the server, have it listen on port 5000
server.listen(5000, function () {
  console.log("The server is listening on port 5000");
});
