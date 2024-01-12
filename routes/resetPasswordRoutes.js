const express           = require('express');
const bcrypt            = require('bcrypt');
const crypto            = require('crypto');
const nodemailer        = require('nodemailer');
const clients           = require('../controller/clientController');
const clinicians        = require('../controller/clinicianController');
const passwordToken     = require('../controller/passwordResetTokenController.js');

const router = express.Router();
// TO-DO
// Generalise routes for easier bugfixing/readability ?
// Use .env variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "hearinginformationassistant@gmail.com",
        pass: "onqlykblflwxvlck"
    }
});

//
// Reset password routes client
//

router.post('/client/email', async (req, res) => {
    try {
        const client = await clients.findByEmail(req.body.email);
        if (!client) {
            res.status(400).json({ message: "user not found" });
        } else {
            const token = generateRandomToken();
            await passwordToken.addToken(token, client.email);
            await sendMail(client.email, token);
            req.session.resetPasswordEmail = client.email;
            req.session.validResetToken = false;
            res.status(200).json({ message: "email sent with code" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

router.post('/client/code', async (req, res) => {
    try {
        const token = req.body.token;
        const validToken = await passwordToken.checkIfValid(token, req.session.resetPasswordEmail);
        if (!validToken) {
            req.session.validResetToken = false;
            res.status(400).json({ message: "invalid" });
        } else {
            req.session.validResetToken = true;
            await passwordToken.removeToken(token, req.session.resetPasswordEmail);
            res.status(200).json({ message: "accepted" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

router.post('/client/reset', async (req, res) => {
    try {
        const userEmail = req.session.resetPasswordEmail;
        const isValidToken = req.session.validResetToken;
        const client = await clients.findByEmail(userEmail);
        if (!userEmail || !isValidToken || !client) {
            res.status(400).json({ message: "invalid" });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await clients.changePassword(client.client_id, hashedPassword);
            delete req.session.resetPasswordEmail;
            delete req.session.validResetToken;
            res.status(200).json({ message: "accepted" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

//
// Reset password routes clinician
//
router.post('/clinician/email', async (req, res) => {
    try {
        const clinician = await clinicians.findByEmail(req.body.email);
        if (!clinician) {
            res.status(400).json({ message: "user not found" });
        } else {
            const token = generateRandomToken();
            await passwordToken.addToken(token, clinician.email);
            await sendMail(clinician.email, token);
            req.session.resetPasswordEmail = clinician.email;
            req.session.validResetToken = false;
            res.status(200).json({ message: "email sent with code" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

router.post('/clinician/code', async (req, res) => {
    try {
        const token = req.body.token;
        const validToken = await passwordToken.checkIfValid(token, req.session.resetPasswordEmail);
        if (!validToken) {
            req.session.validResetToken = false;
            res.status(400).json({ message: "invalid" });
        } else {
            req.session.validResetToken = true;
            await passwordToken.removeToken(token, req.session.resetPasswordEmail);
            res.status(200).json({ message: "accepted" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});

router.post('/clinician/reset', async (req, res) => {
    try {
        const userEmail = req.session.resetPasswordEmail;
        const isValidToken = req.session.validResetToken;
        const clinician = await clinicians.findByEmail(userEmail);
        if (!userEmail || !isValidToken || !clinician) {
            res.status(400).json({ message: "invalid" });
        } else {
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            await clinicians.changePassword(clinicians.clinician_id, hashedPassword);
            delete req.session.resetPasswordEmail;
            delete req.session.validResetToken;
            res.status(200).json({ message: "accepted" });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "internal server error." });
    }
});


//
// util functions for resetting password
//
function generateRandomToken(length = 8) {
    return crypto.randomBytes(length)
        .toString('base64')   // Convert to base64
        .replace(/[^a-zA-Z0-9]/g, '')  // Remove non alphanumeric characters
        .substring(0, length);  // ensures required length
}

async function sendMail(email, token) {
    const mailOptions = {
        from: 'hearinginformationassistant@gmail.com',
        to: email,
        subject: "Reset password requested for Hearing Assistant",
        text: "Your reset token is: " + token
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

module.exports = router;
