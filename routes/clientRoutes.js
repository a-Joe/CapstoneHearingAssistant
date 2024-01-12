const express = require('express');
const router = express.Router();
const clientConroller = require('../controller/clientController');

//Returns currently logged in client details
router.get('/get', async (req, res) => {
    // check if a client and logged in.
    if (!req.isAuthenticated() || req.user.type !== "client") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try {
        const clientId = req.user.id;
        const client = await clientConroller.findByID(clientId);
        res.send({ success: true, client: client });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

//Edits client details
router.post('/editdetails', async (req, res) => {
    // check if a client and logged in.
    if (!req.isAuthenticated() || req.user.type !== "client") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try{
        const clientId = req.user.id;
        const clientUpdate = req.body.client;

        clientConroller.updateClient(clientId, clientUpdate).then(() => {
            res.json({ success: true, clientId: clientId });
        }).catch(err => {
            res.json({ success: false, error: err });
        });
    } catch(err) {
        res.status(400).json({ success: false, error: "Error Updating Details: " + err });
    }
});

module.exports = router;