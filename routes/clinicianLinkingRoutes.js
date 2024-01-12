const express           = require('express');
const bcrypt            = require('bcrypt');
const crypto            = require('crypto');
const nodemailer        = require('nodemailer');
const clients           = require('../controller/clientController');
const clinicians        = require('../controller/clinicianController');
const passwordToken     = require('../controller/passwordResetTokenController.js');

const router = express.Router();

router.post('/link-clinician', async (req, res) => {
    // check if user is a client and authenticated first
    if (!req.isAuthenticated() || req.user.type !== "client") {
        return res.status(401).json({ message: "Invalid user" });
    }
    try{
    const linkingCode = req.body.code; // Frontend sends clinicians code
    const clinician = await clinicians.findByLinkingCode(linkingCode); // find clinician via linking code
    const clinicianID = clinician.clinician_id; 

    if (!req.isAuthenticated()){ // check if user authenticated
        res.status(401).json({ message: "Not authenticated" });
    }else{
        console.log("user sending linking request is: " , req.user.id);
        clients.assignClinician(req.user.id, clinicianID)
        res.status(200).json({ message: "accepted" });
    }

    }catch(err){
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }

});

// returns clinicians linking code
router.get('/getCode', async (req, res) => {
    // check if user is a clinician and authenticated first
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try{
        const clinician = await clinicians.findByID(req.user.id);

        res.status(200).json({ linkingCode: clinician.linking_code });
    }catch(err){
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }

});

// returns a clients clinician
router.get('/getClientsClinician', async (req, res) => {
    // check if user is a clinician and authenticated first
    if (!req.isAuthenticated() || req.user.type !== "client") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try{
        const client = await clients.findByID(req.user.id);
        const assignedClinician = client.assigned_clinician_id;
        res.status(200).json({ assignedClinician: assignedClinician });
    }catch(err){
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }

});
module.exports = router;
