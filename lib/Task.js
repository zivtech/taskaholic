var client = null;
var async = require('async');
var Task = function Task(description) {
  this.description = description;
  this.tags = [];
  this.id = null;
}
Task.client = null;
Task.listTasks = function(tags, done) {
  var self = this;
  // TODO: Implement tag filtering.
  Task.client.smembers('tasks', function(error, results) {
    if (error) return done(error);
    async.map(results, Task.load, done);
  });
}
Task.listTaskIds = function(arg1, arg2) {
  // TODO: Implement tag filtering.
  if (arguments.length == 1) {
    Task.client.smembers('tasks', arg1);
  }
}
Task.load = function(id, done) {
  var task = new Task();
  task.load(id, done);
}
Task.prototype.save = function(done) {
  self = this;
  Task.client.incr('task:id', function(error, id) {
    if (error) return done(error);
    self.id = id;
    var multi = Task.client.multi();
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
        done(error);
      }
    });
  })
}
Task.prototype.load = function(id, done) {
  var self = this;
  data = Task.client.hgetall('task:' + id, function(error, data) {
    if (data == null) {
      return done(new Error('Task id ' + id + ' not found.'));
    }
    if (error) {
      return done(error);
    }
    for (i in data) {
      self[i] = data[i];
    }
    if (typeof(self.tags) == 'string') {
      self.tags = self.tags.split(',');
    }
    else {
      self.tags = [];
    }
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
    var multi = Task.client.multi();
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
