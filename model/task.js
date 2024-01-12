const createTaskTableSQL = `
CREATE TABLE IF NOT EXISTS task (
  task_id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  description TEXT
);`;

module.exports = createTaskTableSQL;