var express = require('express');
var app = express();

app.get('/', function(request, response) {
  response.writeHead(500, {'Content-Type': 'text/plain'});
  response.end('Hello World');
});

app.listen(9001, function() {
  console.log('Now listening on port 9001');
});
