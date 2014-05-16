var Task = Backbone.Model.extend({
  urlRoot: '/api/task'
});

var item1 = new Task({
  description: "I am the first task."
});
item1.save({}, {
  success: function() {
    console.log(item1);
  }
});
var item2 = new Task({id: 3});
item2.destroy();
