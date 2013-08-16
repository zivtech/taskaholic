var should = require('should');
var fakeredis = require('fakeredis');
var Task = require('../lib/Task');
var async = require('async');

var client = null;
var todoItem = null;

Task.client = client = fakeredis.createClient();
// We don't bother to test race conditions so there's no need to simulate them.
fakeredis.fast = true;

describe('Task', function() {
  describe('#constructor', function() {
    it ('should set the description property.', function() {
      todoItem = new Task('This is my test item');
      todoItem.description.should.equal('This is my test item');
    });
  });
  describe('#addTag', function() {
    it ('should add an item to the internal array of tags', function() {
      todoItem.tags.should.be.empty;
      todoItem.addTag('sports');
      todoItem.tags.should.include('sports');
      todoItem.addTag('news');
      todoItem.tags.should.include('news');
      todoItem.tags.should.have.length(2);
    });
  });
  describe('#save', function() {
    it ('should save without an error', function(done) {
      todoItem.save(done);
    });
    it ('should persist the item\'s properties to redis', function(done) {
      client.hgetall('task:' + todoItem.id, function(error, result) {
        result.id.should.equal(todoItem.id.toString());
        result.description.should.equal('This is my test item');
        result.tags.should.equal('sports,news');
        done(error);
      });
    });
    it ('should add the task id to the overall list of tasks', function(done) {
      client.smembers('tasks', function (error, results) {
        results.should.include(todoItem.id.toString());
        done(error);
      });
    });
    it ('should add the task id to the tag lists', function(done) {
      var multi = client.multi();
      multi.smembers('task:tag:sports');
      multi.smembers('task:tag:news');
      multi.exec(function(error, results) {
        results[0].should.include(todoItem.id.toString());
        results[1].should.include(todoItem.id.toString());
        done(error);
      });
    });
  });
  describe('#load', function() {
    it ('should retrieve an object with the data persisted during save', function(done) {
      var loadedItem = new Task(null);
      loadedItem.load(todoItem.id, function(error) {
        loadedItem.id.should.equal(todoItem.id);
        loadedItem.description.should.equal(todoItem.description);
        for (i in todoItem.tags) {
          loadedItem.tags.should.include(todoItem.tags[i]);
        }
        done(error);
      });
    });
  });
  describe('#delete', function() {
    it ('should successfully remove the item from redis', function(done) {
      todoItem.delete(function(error) {
        should.not.exist(error);
        var multi = client.multi();
        multi.smembers('tasks');
        multi.hgetall('task:' + todoItem.id);
        multi.smembers('task:tag:sports');
        multi.smembers('task:tag:news');
        multi.exec(function(error, results) {
          var id = todoItem.id;
          results[0].should.not.include(todoItem.id.toString());
          should.not.exist(results[1]);
          results[2].should.not.include(todoItem.id.toString());
          results[3].should.not.include(todoItem.id.toString());
          done();
        });
      });
    });
  });
  describe('#listTasks', function() {
    it ('should return an empty array if there are no tasks', function(done) {
      Task.listTasks([], function(error, tasks) {
        tasks.should.be.empty
        done(error)
      });
    });
    it ('should return an array of fully loaded tasks if there are tasks', function(done) {
      var task1 = new Task('Descripton 1');
      var task2 = new Task('Descripton 2');
      task1.save(function(error) {
        if (error) return done(error);
        task2.save(function(error) {
          Task.listTasks([], function(error, tasks) {
            tasks.should.be.not.empty;
            tasks[0].description.should.equal('Descripton 1');
            tasks[1].description.should.equal('Descripton 2');
            done(error);
          });
        });
      });
    });
  });
  describe('#listTaskIds', function() {
    // before(function(done) {
    //   client.flushdb(done);
    // });
    it('should receive a list of the existing tax ids', function(done) {
      Task.listTaskIds(function(error, ids) {
        ids.length.should.equal(2);
        parseInt(ids[0]).should.equal(2);
        parseInt(ids[1]).should.equal(3);
        done(error);
      });
    });
  });
});
