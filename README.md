# Tasker \n A simple node.js TODO list.


## Redis Schema

  - tasks - a set containing the ids of all tasks
  - task:id - An increment counter to keep track of the id for the next task created.
  - task:[id] - A hash with the properties of this task.
  - task:tag:[name] - A set containing all items tagged with "name"
