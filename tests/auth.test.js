const request = require('supertest');
const app = require('../server');
const clientController = require('../controller/clientController.js');
const clinicianController = require('../controller/clinicianController.js');

describe('Authentication Tests', () => {
    afterAll(async () => {
        const client = await clientController.findByEmail('af@3.com2');
        await clientController.removeClient(client.client_id);

        const clinician = await clinicianController.findByEmail('ADoc@gmail.com2');
        await clinicianController.removeClinician(clinician.clinician_id);
    });
    //Register tests
    describe("POST -> /register/client", () => {

        test('should register new client', async () => {
            const newUser = {
                firstname: "12",
                lastname: "22",
                email: "af@3.com2",
                password: "42"
            };
            const res = await request(app).post('/register/client').send(newUser);
            const user = await clientController.findByEmail(newUser.email);
            expect(user.email).toBe(newUser.email);
        });
    });

    describe("POST -> /register/clinician", () => {

        test('should register new clinician', async () => {
            const newUser = {
                firstname: "Doc2",
                lastname: "Robert2",
                email: "ADoc@gmail.com2",
                password: "Doctor32"
            };
            const res = await request(app).post('/register/clinician').send(newUser);
            const user = await clinicianController.findByEmail(newUser.email);
            expect(user.email).toBe(newUser.email);
        });
    });

    //Login Tests
    describe("POST -> /login/client", () => {
        test('Should return 401 with incorrect login', async () => {
            const res = await request(app).post('/login/client').send({ 
                email: 'incorrect@email.com', 
                password: '123'
            });
            
            expect(res.status).toBe(401);
        });
    });

    describe("POST -> /login/client", () => {
        test('Should pass with correct login', async () => {
            const res = await request(app).post('/login/client').send({ 
                email: 'af@3.com2', 
                password: '42'
            });

            expect(res.body.isAuthenticated).toBe(true);
        });
    });
});