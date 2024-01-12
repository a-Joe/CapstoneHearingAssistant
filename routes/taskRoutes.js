require('dotenv').config();
const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');
const clientController = require('../controller/clientController');
const clientTaskController = require('../controller/clientTaskController');
const s3 = require('../s3');
const fs = require('fs');

//Multer middleware to handle FormData()
const multer = require('multer');
const e = require('express');
const upload = multer();

/*
    Data to be sent from frontend:
        var formData = new FormData();
        formData.append("filename", filenameString)
        formData.append("title", titleString)
        formData.append("file", fileInputElement.files[0])

        axios.post('/task/add', formData).then(res => { console.log(res) })
*/

router.post('/add', upload.single('file'), async (req, res) => {
    //Adds a task to AWS file storage and Database
    try {
        const bucket = process.env.AWS_TASK_BUCKET;

        //Retrieving file fields from http request
        const title = req.body.title;
        const filename = req.body.filename;
        const description = req.body.description;

        //Retrieving file from request
        const file = req.file;

        //Checking the 'key' is unique
        const exists = await taskController.hasKey(filename);

        //Processing The file
        if(!exists) {
            console.log('Processing File Upload: ' + title + "\nFile: " + Object.keys(file));
            const fileContent = Buffer.from(file.buffer, 'binary');

            //Calling S3 addfile
            s3.addFile(fileContent, filename, bucket).then(() => {
                console.log('Successfully Uploaded: ' + filename + ' to: ' + bucket);
                
                //Creating database reference to file in database -> Task
                taskController.addTask(title, filename, description).then(data => {
                    res.send({ success: true, id: data });

                //Task unable to be added
                }).catch(error => {
                    res.send({ success: false, error: error });
                });

            //File unable to be uploaded
            }).catch(error => {
                res.send({ success: false, error: error });
            });
        } else {
            res.send({ success: false, error: 'File already exists with that title' });
        }

    } catch (error) {
        res.send({ success: false, error: error });
    }
});

router.post('/get', async (req, res) => {
    //Returns all entries in Object form:
    const tasks = await taskController.getAll();
    res.send(tasks);
});

router.post('/get/:taskid', async (req, res) => {
    //Returns task file of specific task_id
    const task = await taskController.getTaskByID(req.params.taskid);
    if(!task) {
        res.send({ retrieved: false, error: 'Invalid Task ID' });
    } else {
        const key = task.key;

        await s3.getFile(key, process.env.AWS_TASK_BUCKET).then(data => {
            if(data.Body) {
                res.send({ retrieved: true, data: data.Body.toString("binary"), title: task.title, description: task.description });
            } else {
                console.log('Error: data.Body does not exist');
            }
        }).catch(err => {
            console.log('Unable to retrieve file: ' + err);
            res.send({ retrieved: false, error: 'Unable to retrieve file: ' + err });
        });
    }
});

router.post('/delete/:taskid', async (req, res) => {
    //Deletes specified task from database and Amazon S3
    const task = await taskController.getTaskByID(req.params.taskid);
    if(!task) {
        res.send({ deleted: false, error: 'Invalid Task ID' });
    } else {
        const key = task.key;

        await s3.deleteFile(key, process.env.AWS_TASK_BUCKET).then(async data => {
            const deleted = await taskController.removeTask(key);
            console.log(key + ' deleted from db: ' + deleted);
            res.send({ deleted: true, data: data });
        }).catch(err => {
            console.log('Unable to delete file: ' + err);
            res.send({ deleted: false, error: 'Unable to delete file: ' + err });
        });
    }
});

router.post('/assign/:clientid/:taskid', async (req, res) => {
    //Assign a client a task
    const clientId = req.params.clientid;
    const taskId = req.params.taskid;
    console.log('Client ID: ' + clientId + " Task ID: " + taskId);

    const clientExists = await clientController.hasID(clientId);
    const taskExists = await taskController.hasID(taskId);
    console.log('Client Exists: ' + clientExists + " Task Exists: " + taskExists);

    if(clientExists && taskExists) {
        clientTaskController.assignTask(taskId, clientId).then(data => {
            res.send({ assigned: true });
        }).catch(err => {
            res.send({ assigned: false, error: err });
        });
    } else {
        res.send({ assigned: false, error: 'Client and Task must both exist' });
    }
});

router.post('/unassign/:clientid/:taskid', async (req, res) => {
    //Unassign a client a task
    const clientId = req.params.clientid;
    const taskId = req.params.taskid;

    if(clientTaskController.hasClientTask(taskId, clientId)) {
        clientTaskController.removeTask(taskId, clientId).then(data => {
            res.send({ unassigned: true });
        }).catch(err => {
            res.send({ unassigned: false, error: err });
        });
    } else {
        res.send({ assigned: false, error: 'Client is not assigned given task' });
    }
});

router.post('/getassigned', async (req, res) => {
    const clientId = req.user?.id;

    if(clientController.hasID(clientId)) {
        clientTaskController.getClientTasks(clientId).then(async tasks => {
            console.log(tasks);
            const taskList = [];
            for(const clientTask of tasks) {
                const task =  await taskController.getTaskByID(clientTask.task_id);
                task.progress = clientTask.progress;
                taskList.push(task);
            }

            res.send({ success: true, tasks: taskList });
        }).catch(err => {
            res.send({ success: false, error: err });
        });
    }else {
        res.send({ success: false, error: 'Client doesn\'t exist' });
    }
});

router.post('/updateprogress/:taskid/:progress', async (req, res) => {
    const clientId = req.user.id;
    const taskId = req.params.taskid;
    const progress = req.params.progress;

    if(clientTaskController.hasClientTask(taskId, clientId) && progress >= 0 && progress <=  100) {

        clientTaskController.updateProgess(taskId, clientId, progress).then(async success => {
            const clientTask = await clientTaskController.getClientTask(taskId, clientId);
            res.send({ success: true, task: clientTask });

        }).catch(err => {
            res.send({ success: false, error: true });
        })
    } else {
        res.send({ success: false, error: 'Invalid Parameters'});
    }
});

module.exports = router;