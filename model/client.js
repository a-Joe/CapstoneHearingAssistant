const createClientTableSQL = 
`CREATE TABLE IF NOT EXISTS client (
    client_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    assigned_clinician_id INTEGER,
    FOREIGN KEY(assigned_clinician_id) REFERENCES Clinician(clinician_id)
);`;

module.exports = createClientTableSQL;
