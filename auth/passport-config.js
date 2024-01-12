//Passport Authentication Cofiguration
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initialize(passport, clients, clinicians) { 
    //Client Local Strategy
    const authenticateClient = async (email, password, done) => {
        const user = await clients.findByEmail(email);

        if(user == null) { 
            console.log('Client: ' + email + " not found.");
            return done(null, false, { message: 'No user with that email' }); }
        try {
            if(await bcrypt.compare(password, user.password_hash)) {
                console.log('Client: ' + email + " Authenticated.");
                user.type = 'client';
                user.id = user.client_id;
                return done(null, user);
            } else {
                return done(null, false, { message: 'Inccorect Password' });
            }
        } catch(e) {
            console.log('Error:' + e.message);
            return done(e);
        }
    }

    //Clinician local strategy
    const authenticateClinician = async (email, password, done) => {
        const user = await clinicians.findByEmail(email);

        if(user == null) {
            console.log('\nUser: ' + email + ' not found'); 
            return done(null, false, { message: 'No user with that email' }); 
        }
        try {
            if(await bcrypt.compare(password, user.password_hash)) {
                console.log('\nUser: ' + email + ' authenticated.');
                user.type = 'clinician';
                user.id = user.clinician_id;

                return done(null, user);
            } else {
                return done(null, false, { message: 'Inccorect Password' });
            }
        } catch(e) {
            console.log('Error:' + e.message);
            return done(e);
        }
    }

    //Using Local Strategies
    passport.use('clientLocal', new localStrategy({ usernameField: 'email' }, authenticateClient));
    passport.use('clinicianLocal', new localStrategy({ usernameField: 'email' }, authenticateClinician));

    //Serialising / Deserialising of the User
    passport.serializeUser(function (user, done) {
        console.log("Entered Serialize: " + user);
        return done(null, { id: user.id, type: user.type });
    });
    
    

    passport.deserializeUser(function (obj, done) {
        console.log("Entered Deserialize: " + obj);
        //Deserialise client
        if(obj.type === "client") {
            clients.findByID(obj.id).then((user) => {
                user.id = obj.id;
                user.type = "client";
                done(null, user) 
            }).catch((reason) => {
                done(reason, obj);
            });
        }
    
        //Deserialise clinician
        if(obj.type === "clinician") {
            clinicians.findByID(obj.id).then((user) => {
                user.id = obj.id;
                user.type = "clinician";
                done(null, user) 
            }).catch((reason) => {
                done(reason, obj);
            });
        }
    });
}
module.exports = initialize;