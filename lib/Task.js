var client = null;
var async = require('async');

var Task = function Task(description, redisClient) {
  this.description = description;
  this.tags = [];
  this.id = null;
  client = redisClient;
}
Task.listTasks = function(tags, done) {
  var self = this;
  client.smembers('tasks', function(error, results) {
    var taskLoader = function(id, callback) {
      var task = new Task(null, client);
      task.load(id, function(error, item) {
        callback(error, item);
      });
    };
    async.map(results, taskLoader, done);
  });
}
Task.prototype.save = function(done) {
  self = this;
  client.incr('task:id', function(error, id) {
    self.id = id;
    var multi = client.multi();
    var selfJSON = {};
    for (i in self) {
      if (typeof(self[i]) !== 'function') {
        selfJSON[i] = self[i];
      }
    }
    selfJSON.tags = selfJSON.tags.join(',');
    multi.hmset('task:' + self.id, selfJSON);
    multi.sadd('tasks', self.id);
    for (i in self.tags) {
      multi.sadd('task:tag:' + self.tags[i], self.id);
    }
    multi.exec(function(error, results) {
      if (done) {
        done();
      }
    });
  })
}
Task.prototype.load = function(id, done) {
  var self = this;
  data = client.hgetall('task:' + id, function(error, data) {
    if (error) {
      done(error);
    }
    for (i in data) {
      self[i] = data[i];
    }
    self.tags = self.tags.split(',');
    self.id = Number(self.id);
    done(error, self);
  });
}
Task.prototype.addTag = function(tag) {
  this.tags.push(tag);
}
Task.prototype.delete = function(done) {
  var self = this;
  if (!self.id) {
    throw new Error('Tasks must have an id set to be deleted');
  }
  // Do a fresh load to ensure that we have all of the relevant data loaded.
  self.load(self.id, function(error) {
    if (error) {
      return done(error);
    }
    var multi = client.multi();
    var removedTags = [];
    for (i in self.tags) {
      var tag = self.tags[i];
      multi.srem('task:tag:' + tag, self.id);
      removedTags.push(tag);
    }
    multi.srem('tasks', self.id);
    multi.del('task:' + self.id);
    multi.exec(function(error) {
      done(error);
    });
  });
};
module.exports = Task;
