const crypto        = require('crypto');
const db            = require('../model/database.js');

function findByEmail(email) {
    const query = "SELECT * FROM clinician WHERE email = ?";
    return new Promise((resolve, reject) => {
        db.get(query, [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function findByID(clinicianID) {
    const query = "SELECT * FROM clinician WHERE clinician_id = ?";
    return new Promise((resolve, reject) => {
        db.get(query, [clinicianID], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function hasID(clinicianID) {
    const query = "SELECT * FROM clinician WHERE clinician_id = ?";
    return new Promise((resolve, reject) => {
        db.get(query, [clinicianID], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // If row exists - ID was found..
                resolve(true);
            } else {
                // If row doesn't exist - ID wasn't found.
                resolve(false);
            }
        });
    });
}

function addClinician(firstName, lastName, email, password) {
    const query = "INSERT INTO clinician (first_name, last_name, email, linking_code, password_hash) VALUES (?, ?, ?, ?, ?);";
    return new Promise((resolve, reject) => {
        db.run(query, [firstName, lastName, email, generateRandomToken(), password], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID); //the last inserted row ID
            }
        });
    });
}

function removeClinician(clinicianID){
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM clinician WHERE clinician_id = ?";
    db.run(query, [clinicianID], function(err){
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function changePassword(clinicianID, newPassword){
  return new Promise((resolve, reject) => {
    const query = "UPDATE clinician SET password_hash = ? WHERE clinician_id = ?";
    db.run(query, [newPassword, clinicianID], function(err){
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function updateClinician(clinicianId, clinicianUpdate) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE clinician SET first_name = ?, last_name = ?, email = ? WHERE clinician_id = ?";
        db.run(query, [clinicianUpdate.first_name, clinicianUpdate.last_name, clinicianUpdate.email, clinicianId], function(err) {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    });
}

function findByLinkingCode(linking_code) {
    const query = "SELECT * FROM clinician WHERE linking_code = ?";
    return new Promise((resolve, reject) => {
        db.get(query, [linking_code], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getAllClients(clinicianID) {
    console.log("Searching with: ", clinicianID);
    return new Promise((resolve, reject) => {
        // Query to get specific fields for clients assigned to the given clinician
        const clientsQuery = "SELECT client_id, first_name, last_name, email FROM client WHERE assigned_clinician_id = ?";
        db.all(clientsQuery, [clinicianID], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

function hasClient(clinicianId, clientId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM client WHERE client_id = ? AND assigned_clinician_id = ?";
        db.get(query,[clientId, clinicianId], (err, row) => {
            if(err) {
                console.log("hasClient error: " + err);
                reject({ has: false });
            } else if (row) {
                console.log("hasClient row: " + JSON.stringify(row));
                resolve(row);
            } else {
                console.log("hasClient row: " + JSON.stringify(row));
                reject({ has: false });
            }
        });
    });
}

function getLinkingCode(clinicianID){
    console.log("Searching with: ", clinicianID);
    return new Promise((resolve, reject) => {
        const clientsQuery = "SELECT linking_code FROM clinician WHERE clinician_id = ?";
        db.all(clientsQuery, [clinicianID], (err, linkingCode) => {
            if (err) {
                reject(err);
            } else {
                resolve(linkingCode);
            }
        });
    });
}

function generateRandomToken(length = 8) {
    return crypto.randomBytes(length)
        .toString('base64')   // Convert to base64
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove non alphanumeric characters
        .substring(0, length);  // ensures required length
}

module.exports = {
    findByEmail,
    addClinician,
    findByID,
    hasID,
    removeClinician,
    changePassword,
    updateClinician,
    findByLinkingCode,
    getAllClients,
    hasClient,
    getLinkingCode
};
