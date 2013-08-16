var express = require('express');
var app = express();
var Task = require('./lib/Task');
var redis = require('redis');

Task.client = redis.createClient();

app.get('/', function(request, response) {
  response.writeHead(500, {'Content-Type': 'text/plain'});
  response.end('Hello World');
});

app.get('/api/task', function(request, response) {
  Task.listTaskIds(function(error, ids) {
    if (error) {
      response.writeHead(500, {'Content-Type': 'text/application-json'});
      response.end(JSON.stringify({'error': 'something went wrong'}));
      return;
    }
    response.writeHead(200, {'Content-Type': 'text/application-json'});
    response.end(JSON.stringify(ids));
  });
});

app.get("/api/task/:id(\\d+)", function(request, response) {
  var task = new Task();
  task.load(request.params.id, function(error) {
    if (error) {
      response.writeHead(404);
      response.end('not found');
      return;
    }
    response.writeHead(200, {'Content-Type': 'text/application-json'});
    response.end(JSON.stringify(task));
  })
});

app.put('/api/task', express.bodyParser(), function(request, response) {
  var task = new Task(request.body.description);
  task.save(function(error) {
    response.writeHead(200, {'Content-Type': 'text/application-json'});
    response.end(JSON.stringify(task));
  });
});

app.delete('/api/task/:id(\\d+)', function(request, response) {
  var task = new Task();
  task.load(request.params.id, function(error) {
    task.delete(function(error) {
      if (error) {
        response.writeHead(503);
        response.end('not found');
        return;
      }
      else {
        response.writeHead(200, {'Content-Type': 'text/application-json'});
        response.end(JSON.stringify(task));
      }
    })
  });
});

app.listen(9001, function() {
  console.log('Now listening on port 9001');
});
