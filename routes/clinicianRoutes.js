const express = require('express');
const router = express.Router();
const clinicianController = require('../controller/clinicianController');
const clientTaskController = require('../controller/clientTaskController');
const taskController = require('../controller/taskController');

//Returns currently logged in clinician details
router.get('/get', async (req, res) => {
    // check if a clinician and logged in.
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try {
        const clinicianId = req.user.id;
        const clinician = await clinicianController.findByID(clinicianId);
        res.send({ success: true, clinician: clinician });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

//Returns list of the currently logged in clinician's clients
router.get('/getallclients', async (req, res) => {
    // check if a clinician and logged in.
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try{
        const clinicianID = req.user.id;
        const clientsList = await clinicianController.getAllClients(clinicianID);
        console.log("Clients:" + clientsList)
        res.send({ success: true, clients: clientsList });
    } catch(err){
        console.error("Error fetching clients:", err); 
        res.status(400).json({ success: false, error: err.message });
    }
});

//Get specific linked client
router.get('/getclient/:clientId', async (req, res) => {
    // check if a clinician and logged in.
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try {
        const clientId = req.params.clientId;
        const clinicianId = req.user.id;

        clinicianController.hasClient(clinicianId, clientId).then(client => {
            res.json({ sucess: true, client: client });
        }).catch(err => {
            res.status(400).json({ success: false, error: "No assigned client found with that ID: " + err });
        })
    } catch (err) {
        res.status(400).json({ success: false, error: err });
    }
});

router.get('/getclienttasks/:clientId', async (req, res) => {
    // check if a clinician and logged in.
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try {
        const clientId = req.params.clientId;
        const clinicianId = req.user.id;

        clinicianController.hasClient(clinicianId, clientId).then(() => {
            clientTaskController.getClientTasks(clientId).then(async tasks => {
                const taskList = [];

                for(const clientTask of tasks) {
                    const task =  await taskController.getTaskByID(clientTask.task_id);
                    taskList.push(task);
                }

                res.send({ success: true, tasks: taskList });
            }).catch(err => {
                res.send({ success: false, error: "Client Does not have any assigned tasks: " + err });
            });
        }).catch(err => {
            res.status(400).json({ success: false, error: "No assigned client found with that ID: " + err });
        })
    } catch(err) {
        res.status(400).json({ success: false, error: err });
    }
});

//Edits clinician details
router.post('/editdetails', async (req, res) => {
    // check if a clinician and logged in.
    if (!req.isAuthenticated() || req.user.type !== "clinician") {
        return res.status(401).json({ message: "Invalid user" });
    }

    try{
        const clinicianId = req.user.id;
        const clinicianUpdate = req.body.clinician;

        console.log('editDetails/ clinicianId: ' + clinicianId + '\nclinicianUpdate: ' + JSON.stringify(clinicianUpdate))

        clinicianController.updateClinician(clinicianId, clinicianUpdate).then(() => {
            res.json({ success: true, clinicianId: clinicianId });
        }).catch(err => {
            res.json({ success: false, error: err });
        });
    } catch(err) {
        res.status(400).json({ success: false, error: "Error Updating Details: " + err });
    }
});

module.exports = router;