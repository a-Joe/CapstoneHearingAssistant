const db = require('../model/database.js');


function findByEmail(email) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM client WHERE email = ?";
    db.get(query, [email], function(err, row) {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function findByID(clientID) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM client WHERE client_id = ?";
    db.get(query, [clientID], function(err, row) {
      if (err) reject(err);
      else resolve(row);
    });
  });
}


function hasID(clientID) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM client WHERE client_id = ?";
    db.get(query, [clientID], function(err, row) {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}


function addClient(firstName, lastName, email, password, assignedClinicianID = null) {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO client (first_name, last_name, email, password_hash, assigned_clinician_id) VALUES (?, ?, ?, ?, ?);";
    db.run(query, [firstName, lastName, email, password, assignedClinicianID], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

function removeClient(clientID){
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM client WHERE client_id = ?";
    db.run(query, [clientID], function(err){
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function changePassword(clientID, newPassword){
  return new Promise((resolve, reject) => {
    const query = "UPDATE client SET password_hash = ? WHERE client_id = ?";
    db.run(query, [newPassword, clientID], function(err){
      if (err) reject(err);
      else resolve(true);
    });
  });
}

function updateClient(clientId, updateClient) {
    return new Promise((resolve, reject) => {
        const query = "UPDATE client SET first_name = ?, last_name = ?, email = ? WHERE client_id = ?";
        db.run(query, [updateClient.first_name, updateClient.last_name, updateClient.email, clientId], function(err) {
            if(err) reject(err);
            else resolve(true);
        });
    });
}

function assignClinician(clientID, clinicianID){
  return new Promise((resolve, reject) => {
    const query = "UPDATE client SET assigned_clinician_id = ? WHERE client_id = ?"
    db.run(query, [clinicianID, clientID], function(err){
      if (err) reject(err);
      else resolve(true);
    });
  });
}


module.exports = {
  findByEmail,
  addClient,
  findByID,
  hasID,
  removeClient,
  changePassword,
  updateClient,
  assignClinician
};
