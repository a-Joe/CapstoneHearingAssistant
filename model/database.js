const sqlite3 = require('sqlite3').verbose();

//database setup.
let db = new sqlite3.Database('./database.db', (err) => {
  if(err) {
    console.error("Error opening database: " + err.message);
  } else {
    console.log('Connected to the SQlite database.');
  }
});

//enables foreign keys
db.exec('PRAGMA foreign_keys = ON;', err => {
  if (err) {
    console.error("Could not enable foreign keys:", err.message);
  } else {
    //console.log("Foreign Keys Enabled");
  }
});

//table creation SQL strings as variables
const createClientTable = require('./client.js');
const createClinicianTable = require('./clinician.js');
const createMessageTableSQL = require('./message.js');
const createSuperUserTableSQL = require('./superUser.js');
const createTaskTableSQL = require('./task.js');
const createClientTaskTableSQL = require('./clientTask.js');
const createClinicTableSQL = require('./clinic.js');
const createPasswordResetTokenTable = require('./passwordResetToken.js');
//Helper function for Error Checking and modularity
function createTable(sql, tableName) {
  return new Promise((resolve, reject) =>
  {
    db.run(sql, (err) => {
      if (err) {
        console.error("Error creating" ,  tableName, " table:", err.message);
        reject(err);
      }else{
        console.log(tableName , "table creation query ran succesfully.");
        resolve();
      }
    });
  });
}
async function runTableCreation(){
  await createTable(createClinicianTable, "Clinician");
  await createTable(createClientTable, "Client");
  await createTable(createTaskTableSQL, "Task");
  await createTable(createClientTaskTableSQL, "ClientsTask");
  await createTable(createMessageTableSQL, "Message");
  await createTable(createSuperUserTableSQL, "SuperUser");
  await createTable(createClinicTableSQL, "Clinic");
  await createTable(createPasswordResetTokenTable, "PasswordResetToken");
}
runTableCreation();

module.exports = db;