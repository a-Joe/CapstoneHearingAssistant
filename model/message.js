const createMessageTableSQL = 
`CREATE TABLE IF NOT EXISTS message (
    message_id INTEGER PRIMARY KEY,
    title TEXT,
    contents TEXT,
    sender_id INTEGER,
    sender_type TEXT CHECK(sender_type IN ('client', 'clinician')),
    receiver_id INTEGER,
    receiver_type TEXT CHECK(receiver_type IN ('client', 'clinician')),
    FOREIGN KEY(sender_id) REFERENCES client(client_id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES clinician(clinician_id) ON DELETE CASCADE    

);`;

module.exports = createMessageTableSQL;