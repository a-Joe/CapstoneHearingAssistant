const db = require('../model/database');
const clientController = require('../controller/clientController');
const clinicianController = require('../controller/clinicianController');
const taskController = require('../controller/taskController');
const clientTaskController = require('../controller/clientTaskController');

// Mock data for the tests
const mockClient = {
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@test.com',
  password: 'securepassword',
  assignedClinicianID: null
};

const mockClinician = {
  firstname: 'Doc',
  lastname: 'Docco',
  email: 'dd@gmail.com',
  password: 'securepassword2',
};

const mockTask = {
    title: 'Mock Task',
    key: 'mock_task.txt'
};


// CLIENT
describe('Client Controller Test Cases', () => {
  // clientID var to be used at beforeEach() and afterEach()
  let clientID;

  beforeEach(async () => {
    clientID = await clientController.addClient(mockClient.firstname, mockClient.lastname, mockClient.email, mockClient.password);
  });

  afterEach(async () => {
    await clientController.removeClient(clientID);
  });

  test('should correctly add a new client', async () => {
    clientHasID = await clientController.hasID(clientID)
    expect(clientHasID).toBe(true);
  });

  test('should update the client password', async () => {
    await clientController.changePassword(clientID, "NewPassword123");
    const newClient = await clientController.findByID(clientID);
    expect(newClient.password_hash).toEqual("NewPassword123");
  });

  test('should delete client from the database', async () => {
    await clientController.removeClient(clientID);
    clientHasID = await clientController.hasID(clientID)
    expect(clientHasID).toBe(false);
  });

  test('should retrieve client by email', async () => {
    const newClient = await clientController.findByEmail(mockClient.email);
    expect(newClient.email).toBe(mockClient.email);
    expect(newClient.password_hash).toBe(mockClient.password);
    expect(newClient.first_name).toBe(mockClient.firstname);
    expect(newClient.last_name).toBe(mockClient.lastname);
  });

  test('should retrieve client by ID', async () => {
    const newClient = await clientController.findByID(clientID);
    expect(newClient.email).toBe(mockClient.email);
    expect(newClient.password_hash).toBe(mockClient.password);
    expect(newClient.first_name).toBe(mockClient.firstname);
    expect(newClient.last_name).toBe(mockClient.lastname);
  });
});


// CLINICIAN
describe('Clinician Controller Test Cases', () => {

  let clinicianID;

  beforeEach(async () => {
    clinicianID = await clinicianController.addClinician(mockClinician.firstname, mockClinician.lastname, mockClinician.email, mockClinician.password);
  });

  afterEach(async () => {
    await clinicianController.removeClinician(clinicianID);
  });

  test('should correctly add a new clinician', async () => {
    clinicianHasID = await clinicianController.hasID(clinicianID)
    expect(clinicianHasID).toBe(true);
  });

  test('should update the clinician password', async () => {
    await clinicianController.changePassword(clinicianID, "NewPassword123");
    const newClinician = await clinicianController.findByID(clinicianID);
    expect(newClinician.password_hash).toEqual("NewPassword123");
  });

  test('should delete clinician from the database', async () => {
    await clinicianController.removeClinician(clinicianID);
    clinicianHasID = await clinicianController.hasID(clinicianID)
    expect(clinicianHasID).toBe(false);
  });

  test("should retrieve clinician by email", async () => {
    const newClinician = await clinicianController.findByEmail(mockClinician.email);
    expect(newClinician.email).toBe(mockClinician.email);
    expect(newClinician.password_hash).toBe(mockClinician.password);
    expect(newClinician.first_name).toBe(mockClinician.firstname);
    expect(newClinician.last_name).toBe(mockClinician.lastname); 
   });

  test('should retrieve clinician by ID', async () => {
    const newClinician = await clinicianController.findByID(clinicianID);
    expect(newClinician.email).toBe(mockClinician.email);
    expect(newClinician.password_hash).toBe(mockClinician.password);
    expect(newClinician.first_name).toBe(mockClinician.firstname);
    expect(newClinician.last_name).toBe(mockClinician.lastname);
    
  });
  // LINKING CLIENT AND CLINICIAN
  describe('linkClinician Function', () => {

    let clientID;
    let clinicianID;
  
    beforeEach(async () => {
      clientID = await clientController.addClient(mockClient.firstname, mockClient.lastname, mockClient.email, mockClient.password);
      clinicianID = await clinicianController.addClinician(mockClinician.firstname, mockClinician.lastname, mockClinician.email, mockClinician.password);
    });
  
    afterEach(async () => {
      await clientController.removeClient(clientID);
      await clinicianController.removeClinician(clinicianID);
    });
  
    test('should link clinician to a client', async () => {
      await clientController.assignClinician(clientID, clinicianID);
      const linkedClient = await clientController.findByID(clientID);
      expect(linkedClient.assigned_clinician_id).toBe(clinicianID);
    });
  });
});

describe('clientTaskController Functionality', () => {
    let clientID;
    let taskID;

    beforeAll(async() => {
        clientID = await clientController.addClient(mockClient.firstname, mockClient.lastname, mockClient.email, mockClient.password);
        taskID = await taskController.addTask(mockTask.title, mockTask.key);
    });

    afterAll(async() => {
        await clientController.removeClient(clientID);
        await taskController.removeTask(mockTask.key);
    });

    describe('first clientTaskController test block', () => {
        test('should assign task to client', async () => {
            const success = await clientTaskController.assignTask(taskID, clientID);
            expect(success).toBe(true);
        });
    });

    describe('second clientTaskController test block', () => {
        test('should get list of tasks assigned to client', async () => {
            const tasks = await clientTaskController.getClientTasks(clientID);
            expect(tasks[0].task_id).toBe(taskID);
        });
    
        test('should get single task assigned to client', async () => {
            console.log('getClientTask:\n  Client ID: ' + clientID + '  Task ID: ' + taskID);
            const task = await clientTaskController.getClientTask(taskID, clientID);
            console.log(task);
            expect(task.task_id).toBe(taskID);
        });
    });

    describe('third clientTaskController test block', () => {
        test('should update the progress of an assigned task', async () => {
            success = await clientTaskController.updateProgess(taskID, clientID, 50);
            if(success) {
                const task = await clientTaskController.getClientTask(taskID, clientID);
                console.log(task);
                expect(task.progress).toEqual(50);
            } else { expect(success.toBe(true)); }
        });
    });

    describe('fourth clientTaskController test block', () => {
        test('should delete assigned task', async () => {
            success = await clientTaskController.removeTask(taskID, clientID);
            expect(success).toBe(true);
        });
    });
});
