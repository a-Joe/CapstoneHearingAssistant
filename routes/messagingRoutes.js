require('dotenv').config();
const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');
const clientController = require('../controller/clientController');
const clientTaskController = require('../controller/clientTaskController');
const messageController = require('../controller/messageController');
const s3 = require('../s3');
const fs = require('fs');


router.get('/GetAllMessages', async (req, res) => {
    try {
        const messages = await messageController.getUsersMessages(req.user.id, req.user.type);
        res.status(200).json(messages);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

router.post('/sendMessage', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Invalid user" });
    }

    try {
        // message info
        const title = req.body.title;
        const contents = req.body.contents;
        // sender info
        const senderId = req.user.id;
        const senderType = req.user.type;
        // recipient info
        const receiverId = req.body.receiverId;
        let receiverType;

        // determine who is sending and who is recieving the messages
        if (senderType == "client"){
            receiverType = "clinician";
        }else{
            receiverType = "client"
        }

        const messageId = await messageController.addMessage(senderId, senderType, receiverId, receiverType, title, contents);
        res.status(201).json({ message: "Message sent.", messageId });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});









module.exports = router;
