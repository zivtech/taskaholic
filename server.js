var express = require('express');
var app = express();
var Task = require('./lib/Task');
var redis = require('redis');
var fs = require('fs');
var path = require('path');

Task.client = redis.createClient();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
require('express-plates').init(app);

app.get('/', function(request, response) {
  response.render('index');
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

app.post('/api/task', express.bodyParser(), function(request, response) {
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
        if (error.message == 'Tasks must have an id set to be deleted') {
          response.writeHead(404);
          response.end('That task does not exist');
          return;
        }
        response.writeHead(503);
        response.end('An error occured');
        return;
      }
      else {
        response.writeHead(200, {'Content-Type': 'text/application-json'});
        response.end(JSON.stringify(task));
      }
    })
  });
});

app.get('/js/backbone.js', function(request, response) {
  response.writeHead(200, {'Content-Type': 'application/javascript'});
  var stream = fs.createReadStream('./node_modules/backbone/backbone-min.js');
  stream.pipe(response);
});
app.get('/js/backbone-min.map', function(request, response) {
  response.writeHead(200, {'Content-Type': 'application/javascript'});
  var stream = fs.createReadStream('./node_modules/backbone/backbone-min.map');
  stream.pipe(response);
});

app.get('/js/underscore.js', function(request, response) {
  response.writeHead(200, {'Content-Type': 'application/javascript'});
  var stream = fs.createReadStream('./node_modules/underscore/underscore.js');
  stream.pipe(response);
});

app.listen(9001, function() {
  console.log('Now listening on port 9001');
});




















