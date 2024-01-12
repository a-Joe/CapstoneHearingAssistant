const db = require('../model/database.js');

function addMessage(senderId, senderType, receiverId, receiverType, title, contents) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO message (sender_id, sender_type, receiver_id, receiver_type, title, contents) VALUES (?, ?, ?, ?, ?, ?);";
        db.run(query, [senderId, senderType, receiverId, receiverType, title, contents], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

function getMessageById(messageId) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM message WHERE message_id = ?;";
        db.get(query, [messageId], function(err, row) {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getUsersMessages(userId, userType) {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM message WHERE (receiver_id = ? AND receiver_type = ?) OR (sender_id = ? AND sender_type = ?);";
        db.all(query, [userId, userType, userId, userType], function(err, rows) {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

module.exports = {
    addMessage,
    getMessageById,
    getUsersMessages
  };
  