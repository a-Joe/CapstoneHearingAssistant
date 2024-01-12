const createPasswordResetTokenTable = 
`CREATE TABLE IF NOT EXISTS password_reset_token (
    token_id INTEGER PRIMARY KEY,
    token TEXT,
    email TEXT,
    expiration_date DATETIME
);`;

module.exports = createPasswordResetTokenTable;
