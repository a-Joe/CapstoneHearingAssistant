const createSuperUserTableSQL = 
`CREATE TABLE IF NOT EXISTS super_user (
    super_user_id INTEGER PRIMARY KEY
);`;

module.exports = createSuperUserTableSQL;