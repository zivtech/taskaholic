var redis = require('redis');
var client = redis.createClient();

var Task = require('./lib/Task');


var item  = new Task('I have things to do', client);
item.addTag('sports');
item.addTag('news');
item.save(function() {
  console.log('This item was SAVED yo!');
  var item2 = new Task(null, client);
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
