const db = require('../model/database.js');


function checkIfValid(token, email) {
    // Check if a token exists that is not expired and is linked to the supplied email.
    const query = "SELECT * FROM password_reset_token WHERE token = ? AND email = ? AND expiration_date > datetime('now')";
    return new Promise((resolve, reject) => {
        db.get(query, [token, email], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // If row exists - token found and valid
                resolve(true);
            } else {
                // If row doesn't exist - token not found or invalid
                resolve(false);
            }
        });
    });
}

function addToken(token, email) {
    const query = "INSERT INTO password_reset_token (token, email, expiration_date) VALUES (?, ?, datetime('now', '+30 minutes'))";
    
    return new Promise((resolve, reject) => {
        db.run(query, [token, email], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

function removeToken(token, email){
    const query = "DELETE FROM password_reset_token WHERE token = ? AND email = ?";
    return new Promise((resolve, reject) => {
        db.run(query, [token, email], function(err) {
            if (err) {
                reject(err);
            } else {
                if (this.changes === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
}

module.exports = {
    checkIfValid,
    addToken,
    removeToken
};