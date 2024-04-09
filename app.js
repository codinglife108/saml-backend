require('dotenv').config()

const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser')
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;

const app = express();
const server = http.Server(app)

const PORT = process.env.PORT

app.use(cors())
app.use(express.static(__dirname + '/client'))
app.use(bodyParser.json({ limit: "15360mb", type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const samlStrategy = new SamlStrategy(
  {
    entryPoint: 'https://login.salesforce.com/?so=YOUR_ORG_ID',
    issuer: 'https://yourapp.com',
    callbackUrl: 'https://yourapp.com/api/auth/saml/callback',
    cert: '-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----', // Salesforce certificate
  },
  (profile, done) => done(null, profile)
);

passport.use(samlStrategy);

app.get(
  '/login',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => res.redirect('/')
);

app.post(
  '/api/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    // Successful authentication
    res.redirect('/');
  }
);

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'client/index.html')) })

server.listen(PORT, () => {console.log(`Started server on => http://localhost:${PORT}`)})
