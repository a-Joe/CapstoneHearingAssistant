const db = require('../model/database.js');

function assignTask(task_id, client_id) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO client_task (progress, task_id, client_id) VALUES (?, ?, ?);";
        db.run(query, [0, task_id, client_id], function(err) {
            if(err) { reject(err); }
            else { resolve(true); }
        });
    });
}

function getClientTasks(client_id) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM client_task WHERE client_id = ?;";
        db.all(query, [client_id], function (err, rows) {
            const tasks = [];
      
            if(err) {
                reject(err)
            } else {
                rows.forEach(function(row) {
                    tasks.push({ 
                        task_id: row.task_id,
                        client_id: row.client_id,
                        progress: row.progress 
                    });
                });
                resolve(tasks);
            }
        });
    });
}

function getClientTask(task_id, client_id) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM client_task WHERE task_id = ? AND client_id = ?;";
        db.get(query, [task_id, client_id], function (err, row) {
            if(err) {
                reject(err)
            } else {
                resolve(row);
            }
        });
    });
}

function hasClientTask(task_id, client_id) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM client_task WHERE task_id = ? AND client_id = ?;";
        db.get(query, [task_id, client_id], function (err, row) {
            if(err) {
                reject(false)
            } else if (row) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

function updateProgess(task_id, client_id, progress) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE client_task SET progress = ? WHERE task_id = ? AND client_id = ?;";
        db.run(query, [progress, task_id, client_id], function(err) {
            if(err) { reject(err); }
            else { resolve(true); }
        });
    });
}

function removeTask(task_id, client_id) {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM client_task WHERE task_id = ? AND client_id = ?;";
        db.run(query, [task_id, client_id], function(err) {
            if(err) { reject(err); }
            else { resolve(true); }
        })
    })
}

module.exports = { assignTask, getClientTasks, hasClientTask, getClientTask, updateProgess, removeTask }