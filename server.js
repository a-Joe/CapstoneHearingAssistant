const express           = require('express');
const bcrypt            = require('bcrypt');
const passport          = require('passport');
const session           = require('express-session');
const app               = express();
const port              = 4201;
const clients           = require('./controller/clientController');
const clinicians        = require('./controller/clinicianController');
const resetPasswordRoutes   = require('./routes/resetPasswordRoutes');
const crypto            = require('crypto');
const cors              = require('cors');

require('dotenv').config();

//Initialise passport config
const initializePassport = require('./auth/passport-config');
initializePassport(passport, clients, clinicians);

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:8080','http://localhost:8100'], // Allow only our frontends to communicate
  methods: ['GET', 'POST'], 
  credentials: true
}));

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session ({
    //Todo: Update secret to use .env (secret: )
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Testing purposes only for session tracking
// app.use((req, res, next) => {
//     console.log('Incoming request at:');
//     console.log('Session data:', req.session);
//     next();
// });


//Routing
app.use('/task', require('./routes/taskRoutes'));
app.use('/client', require('./routes/clientRoutes'));
app.use('/clinician', require('./routes/clinicianRoutes'));
app.use('/resetpassword', require('./routes/resetPasswordRoutes'));
app.use('/link', require('./routes/clinicianLinkingRoutes'));

//Login Routes
app.post('/login/client', passport.authenticate('clientLocal'), (req, res) => {
    if (req.isAuthenticated()) {
        // User is authenticated
        res.json({ isAuthenticated: true });
      } else {
        // User is not authenticated
        res.json({ isAuthenticated: false });
      }
});

app.post('/login/clinician', passport.authenticate('clinicianLocal'), (req, res) => {
  if (req.isAuthenticated()) {
    // User is authenticated
    res.json({ isAuthenticated: true });
  } else {
    // User is not authenticated
    res.json({ isAuthenticated: false });
  }
});

//Registration Routes
app.post('/register/client', async (req, res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const clientId = await clients.addClient(req.body.firstname, req.body.lastname, req.body.email, hashedPassword);
      console.log("Registered Client: ");
      console.log(" Firstname: " + req.body.firstname);
      console.log(" Lastname: " + req.body.lastname);
      console.log(" Email: " + req.body.email);
      console.log(" Password: " + req.body.password);
      res.send({ registered: true, id: clientId });
  } catch (err) {
      console.error("Error:", err);
      res.send({ registered: false, error: err });
  }
});

app.post('/register/clinician', async (req, res) => {
  try {
    console.log('Registered Clinician:');
    console.log(' Firstname: ' + req.body.firstname);
    console.log(' Lastname:' + req.body.lastname);
    console.log(' Email: ' + req.body.email);
    console.log(' Password: ' + req.body.password);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const clinicianID = await clinicians.addClinician(req.body.firstname, req.body.lastname, req.body.email, hashedPassword);
      res.send({ registered: true, id: clinicianID });
  } catch (err) {
      console.error("Error:", err);
      res.send({ registered: false, error: err });
  }
});

//Run server
if(process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    });
}

module.exports = app;