var redis = require('redis');

var client = redis.createClient();

var Task = function Task(description) {
  this.description = description;
  this.tags = [];
  this.id = null;
}
Task.prototype.save = function(done) {
  self = this;
  client.incr('task:id', function(error, id) {
    self.id = id;
    var multi = client.multi();
    multi.hmset('task:' + self.id, self);
    for (i in self.tags) {
      multi.sadd('tasks', self.id);
      multi.sadd('task:tag:' + self.tags[i], self.id);
    }
    multi.exec(function(error, results) {
      console.log('Task #' + self.id + ' "' + self.description + '" saved.');
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
      multi.srem('tasks:tag:' + tag, self.id);
      removedTags.push(tag);
    }
    multi.srem('task', self.id);
    multi.del('task:' + self.id);
    multi.exec(function(error) {
      done(error);
    });
  });
};

var item  = new Task('I have things to do');
item.addTag('sports');
item.addTag('news');
item.save(function() {
  console.log('This item was SAVED yo!');
  var item2 = new Task();
  item2.load(item.id, function(error) {
    if (error) {
      console.log(error);
    }
    console.log(item2);
    item2.delete(function(error) {
      if (error) {
        console.log(error);
      }
      console.log('item was deleted');
    });
  });
});
