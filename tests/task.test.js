const app = require('../server');
const request = require('supertest');
const fs = require('fs/promises');
const taskController = require('../controller/taskController');
const clientTaskController = require('../controller/clientTaskController');
const clientController = require('../controller/clientController');
var path = require('path');
const s3 = require('../s3');
require('dotenv').config();

//Task Controller tests
describe('TESTS FOR taskController', () => {
    describe ('taskController -> addTask()', () => {
        test('Should add a task to database', async () => {
            const testData = {
                title: "Test Task",
                key: "examplekey.txt"
            }

            const res = await taskController.addTask(testData.title, testData.key);
            expect(res).toEqual(expect.any(Number));
        });

        test('Should fail to add task to database due to null key', async () => {
            const testData = {
                title: "Test Task",
                key: null
            }

            await expect(taskController.addTask(testData.title, testData.key)).rejects.toEqual(
                expect.objectContaining({ code: expect.any(String), errno: expect.any(Number) })
            );
        });
    });

    describe('taskController -> removeTask()', () => {
        test('Should remove task from database', async () => {
            const testKey = 'examplekey.txt';

            const res = await taskController.removeTask(testKey);

            expect(res).toEqual(true);
        });
    });
});

///task/ API Tests
describe('TESTS FOR /task/ API', () => {

    const testTask = {
        title: "Test Task",
        filename: "test_task.pdf",
        absolutePath: path.resolve(__dirname, './resources/test_task.pdf')
    }

    const testVideo = {
        title: "Test Video",
        filename: "test_task3.mp4",
        absolutePath: path.resolve(__dirname, './resources/test_task3.mp4')
    }

    const testClient = {
        firstname: "post-task",
        lastname: "test",
        email: "task@test.com",
        password: "password"
    }
    let testTaskId, testVideoId, testClientId;

    beforeAll(async () => {
        testClientId = await clientController.addClient(testClient.firstname, testClient.lastname, testClient.email, testClient.password);
    });
    afterAll(async() => {
        await clientController.removeClient(testClientId);
        //await request(app).post('/task/delete/'+testVideoId);
    });

    describe('POST -> /task/add (pdf)', () => {
        test('Should add task to Amazon S3 and Task Table', async() => {

            const res = await request(app).post('/task/add')
                .field('title', testTask.title)
                .field('filename', testTask.filename)
                .field('description', '')
                .field('filetype', 'pdf')
                .attach('file', testTask.absolutePath);

            testTaskId = res.body.id;
            expect(res.body.id).toEqual(expect.any(Number));
        });
    });

    /*describe('POST -> /task/add (video)', () => {
        test('Should add video task to Amazon S3 and Task Table', async() => {

            const res = await request(app).post('/task/add')
                .field('title', testVideo.title)
                .field('filename', testVideo.filename)
                .field('description', '')
                .field('filetype', 'video')
                .attach('file', testVideo.absolutePath);
    
            testVideoId = res.body.id;
            expect(res.body.id).toEqual(expect.any(Number));
        });
    })*/

    describe('POST -> /task/get/:taskId', () => {
        test('Should retrieve file from S3', async() => {
            const res = await request(app).post('/task/get/'+testTaskId);

            // Writing retrieved to file
            // await fs.writeFile(path.resolve('./tests/resources/write_test.pdf'), res.body.data, 'binary');

            expect(res.body.retrieved).toBe(true);
        });

        test('Should not retrieve file from S3 with wrong task_id', async() => {
            const res = await request(app).post('/task/get/100000');

            expect(res.body.retrieved).toBe(false);
        });
    });

    describe('POST -> /task/assign/:clientid/:taskid', () => {
        test('should assign an existing client a task', async () => {

            const res = await request(app).post('/task/assign/'+ testClientId + '/' + testTaskId);

            if(res.body.assigned) {
                const clientTask = await clientTaskController.getClientTask(testTaskId, testClientId);
                expect(clientTask.task_id).toEqual(testTaskId);
            } else {
                expect(res.body.assigned).toBe(true);
            }
        });
    });

    describe('POST -> /task/unassign/:clientid/:taskid', () => {
        test('should unassign an existing client a task', async () => {
            const res = await request(app).post('/task/unassign/' + testClientId + '/' + testTaskId);
            expect(res.body.unassigned).toBe(true);
        });
    });

    describe('POST -> /task/delete/:taskId', () => {
        test('Should not delete non-existing task from db and S3', async() => {
            const res = await request(app).post('/task/delete/100001');

            console.log(res.body.error);
            expect(res.body.deleted).toBe(false);
        });

        test('Shoulddelete existing task from db and S3', async() => {
            const res = await request(app).post('/task/delete/'+testTaskId);

            expect(res.body.deleted).toBe(true);
        });


    });

    /*describe('POST -> /task/getassigned', () => {
        test('should retrieve task list', async () => {
            const res = await request(app).post('/task/getassigned');
            console.log(res.body);
            expect(res.body.tasks.length).toBe(2);
        })
    });*/

    //Commented out because API requires authenticated session
    /*describe('POST -> /task/updateprogress/:taskid/:progress', () => {
        beforeAll(async () => {
        });

        test('should update the progress of a current task', async () => {
            const res = await request(app).post('/task/updateprogress/1/50').send({user: 1});
            const clientTask = res.body.task;
            expect(clientTask.progress).toBe(50);
        });
    });*/
});

//Adding sample user and tasks
/*describe('Dummy Method to Add a Client and Assign them tasks (for testing)',() => {
    const client = {
        firstname: "Example",
        lastname: "User",
        email: "example@user.com",
        password: "password"
    }

    const task1 = {
        title: "Test Task 1",
        description: "A pdf task used to test our system",
        filename: "test_task1.pdf",
        absolutePath: path.resolve('./tests/resources/test_task1.pdf')
    }

    const task2 = {
        title: "Test Task 2",
        description: "Another pdf task used to test our system",
        filename: "test_task2.pdf",
        absolutePath: path.resolve('./tests/resources/test_task2.pdf')
    }

    let clientId, task1Id, task2Id;

    beforeAll(async () => {
        const clientRes = await request(app).post('/register/client').send(client);
        console.log('Dummy Method ClientID: ' + clientId);

        const task1Res = await request(app).post('/task/add')
            .field('title', task1.title)
            .field('filename', task1.filename)
            .field('description', task1.description)
            .attach('file', task1.absolutePath);
        console.log('Dummy Method Task1ID: ' + task1Id);

        const task2Res = await request(app).post('/task/add')
            .field('title', task2.title)
            .field('filename', task2.filename)
            .field('description', task2.description)
            .attach('file', task2.absolutePath);
        console.log('Dummy Method Task2ID: ' + task2Id);

        clientId = clientRes.body.id;
        task1Id = task1Res.body.id;
        task2Id = task2Res.body.id;
    });
    
    test('should assing example@user.com three test tasks', async () => {
        await clientTaskController.assignTask(task1Id, clientId);
        await clientTaskController.assignTask(task2Id, clientId);
        //await clientTaskController.assignTask(task3Id, userId);

        const clientTasks = await clientTaskController.getClientTasks(clientId);
        expect(clientTasks.length).toBe(2);
    });
});*/