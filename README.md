# Taskaholic

A simple node.js TODO list application for demo and training purposes.

## Running Tests

Run `npm test`. For more advanced configuration run mocha directy by running `node_modules/mocha/bin/mocha` from the root of the repository.

## Redis Schema

  - tasks - a set containing the ids of all tasks
  - task:id - An increment counter to keep track of the id for the next task created.
  - task:[id] - A hash with the properties of this task.
  - task:tag:[tag name] - A set containing all items tagged with "tag name"
