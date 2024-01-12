const db = require('../model/database.js');

function addTask(title, key, description) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO task (title, key, description) VALUES (?, ?, ?);";
        db.run(query, [title, key, description], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
    });
}

function removeTask(taskKey) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM task WHERE key = ?";
        db.run(query, [taskKey], function(err) {
            if(err) reject(err);
            else resolve(true);
        });
    })
}

function getTaskByID(taskID) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM task WHERE task_id = ?";
        db.get(query, [taskID], function(err, row) {
          if (err) reject(err);
          else resolve(row);
        });
    });
}

function getTaskByKey(taskKey) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM task WHERE key = ?";
        db.get(query, [taskKey], function(err, row) {
          if (err) reject(err);
          else resolve(row);
        });
    });
}

function hasKey(taskKey) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM task WHERE key = ?";
        db.get(query, [taskKey], function(err, row) {
          if (err) {
            reject(false);
          } else if (row) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
}

function hasID(taskId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM task WHERE task_id = ?";
        db.get(query, [taskId], function(err, row) {
          if (err) {
            reject(false);
          } else if (row) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
}

function getAll() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM task";
      db.all(query, function(err, rows) {
        const tasks = [];
      
        rows.forEach(function(row) {
            tasks.push({ 
                taskId: row.task_id,
                title: row.title,
                filename: row.key,
                description: row.description
            });
        });

        if(err) {
          reject(err);
        } else {
          resolve(tasks);
        }
      });
    });
}

module.exports = { addTask, getTaskByID, getTaskByKey, hasKey, hasID, removeTask, getAll };