const createClientsTaskTableSQL = 
`CREATE TABLE IF NOT EXISTS client_task (
    clienttask_id INTEGER PRIMARY KEY,
    progress INTEGER,
    task_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    FOREIGN KEY(task_id)
        REFERENCES task (task_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    FOREIGN KEY(client_id)
        REFERENCES client (client_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);`;

module.exports = createClientsTaskTableSQL;