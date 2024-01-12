const createClinicianTableSQL = 
`CREATE TABLE IF NOT EXISTS clinician (
    clinician_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    linking_code TEXT NOT NULL UNIQUE,
    password_hash TEXT
);`;

module.exports = createClinicianTableSQL;
