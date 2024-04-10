require('dotenv').config();

const fs = require('fs');
const cors = require('cors');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

const app = express();
const server = http.Server(app);

const PORT = process.env.PORT;

app.use(cors());
app.use(express.static(__dirname + '/client/build'));
app.use(bodyParser.json({ limit: '15360mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const cert = fs.readFileSync('./config/al_lin.crt', 'utf-8');

const samlStrategy = new SamlStrategy(
    {
        // entryPoint: 'https://login.salesforce.com/?so=00D2o000001R0Az',
        entryPoint: 'https://force-momentum-5090.my.salesforce.com/idp/login?app=0spKj000000oLkP',
        issuer: 'https://force-momentum-5090.my.salesforce.com',
        callbackUrl: 'https://bet123.ninja/api/auth/saml/callback',
        cert: cert, // Salesforce certificate
    },
    function (profile, done) {
        console.log('profile', profile);
        return done(null, {
            id: profile.id,
            email: profile.email,
            // displayName: profile.cn,
            //  firstName: profile.givenName,
            // lastName: profile.sn,
            sessionIndex: profile.sessionIndex,
            saml: {
                nameID: profile.nameID,
                nameIDFormat: profile.nameIDFormat,
                token: profile.getAssertionXml(),
            },
        });
    }
);

passport.use(samlStrategy);

app.get(
    '/login',
    passport.authenticate('saml', { 
      failureRedirect: '/fail', 
      failureFlash: true 
    }),
    (req, res) => {
        console.log('Send login requeset');
        res.redirect('/');
    }
    // (req, res) => {
    //   console.log(123)
    // }
);

app.post(
    '/api/auth/saml/callback',
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    (req, res) => {
        // Successful authentication

        console.log(req.body)

        console.log('Succeed !');
        res.redirect('/');
    }
);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

server.listen(PORT, () => {
    console.log(`Started server on => http://localhost:${PORT}`);
});
