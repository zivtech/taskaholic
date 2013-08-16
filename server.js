var express = require('express');
var app = express();
var Task = require('./lib/Task');
var _ = require('underscore');
var redis = require('redis');

Task.client = redis.createClient();

app.get('/', function(request, response) {
  response.writeHead(500, {'Content-Type': 'text/plain'});
  response.end('Hello World');
});

app.get('/api/task', function(request, response) {
  Task.listTaskIds(function(error, ids) {
    if (error) {
      response.writeHead(500);
      response.send({error: 'helpful text'});
      return response.end();
    }
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(ids));
  });
});

app.put('/api/task', function(request, response) {
  response.writeHead(201, {'Content-type': 'application/json'});
  // response.end('foo');
  console.log(request);
  response.end(JSON.stringify(request));
});

app.listen(9001, function() {
  console.log('Now listening on port 9001');
});
