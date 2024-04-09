require('dotenv').config()

const cors = require('cors');
const path = require('path');
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
app.use(express.static(__dirname + '/client/build'))
app.use(bodyParser.json({ limit: "15360mb", type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const samlStrategy = new SamlStrategy(
  {
    entryPoint: 'https://login.salesforce.com/?so=00D7R000005HjV2',
    issuer: 'https://saas-innovation-41572.my.salesforce.com',
    callbackUrl: 'https://bet123.ninja.com/api/auth/saml/callback',
    cert: `-----BEGIN CERTIFICATE-----
    MIIErDCCA5SgAwIBAgIOAY7DS+C5AAAAAA4BZpEwDQYJKoZIhvcNAQELBQAwgZAx
    KDAmBgNVBAMMH1NlbGZTaWduZWRDZXJ0XzA5QXByMjAyNF8xNDM4MzMxGDAWBgNV
    BAsMDzAwRDdSMDAwMDA1SGpWMjEXMBUGA1UECgwOU2FsZXNmb3JjZS5jb20xFjAU
    BgNVBAcMDVNhbiBGcmFuY2lzY28xCzAJBgNVBAgMAkNBMQwwCgYDVQQGEwNVU0Ew
    HhcNMjQwNDA5MTQzODMzWhcNMjUwNDA5MTIwMDAwWjCBkDEoMCYGA1UEAwwfU2Vs
    ZlNpZ25lZENlcnRfMDlBcHIyMDI0XzE0MzgzMzEYMBYGA1UECwwPMDBEN1IwMDAw
    MDVIalYyMRcwFQYDVQQKDA5TYWxlc2ZvcmNlLmNvbTEWMBQGA1UEBwwNU2FuIEZy
    YW5jaXNjbzELMAkGA1UECAwCQ0ExDDAKBgNVBAYTA1VTQTCCASIwDQYJKoZIhvcN
    AQEBBQADggEPADCCAQoCggEBAJ1UvvEPLiCUoDDMrPPDzeaFK6YVI0n9jLmQm8pP
    3lIwkj029QxySVTyA7J+62aJ6GbUON43KL8ekIdPqthIfsr63XqsZ5ZxW19/wm3l
    NTFvYRYEz5WR1/nMdEEG3/tZ9EUhwO3V706tjJtQQCmwvEM12t1duBlvgjE4tSt4
    eY2spgj3J5XiYXx/+ELgUovIcX39sVwxSxskJ8OY1sPwzkavhA7s/aOvDnEJrrKn
    gR6JfHDCcyONRh7/bKMLyOgNXxEVKUQ1ouCXsQ8CbexklsK5ta1KoIWX5UaKPz7K
    RosYavTzT2BxY31+o+OA4Svk1NNlA7Jxd8cIGOXVoZf5Kn0CAwEAAaOCAQAwgf0w
    HQYDVR0OBBYEFJfs53wHlB8wmRurYpNW3uKq9O6vMA8GA1UdEwEB/wQFMAMBAf8w
    gcoGA1UdIwSBwjCBv4AUl+znfAeUHzCZG6tik1be4qr07q+hgZakgZMwgZAxKDAm
    BgNVBAMMH1NlbGZTaWduZWRDZXJ0XzA5QXByMjAyNF8xNDM4MzMxGDAWBgNVBAsM
    DzAwRDdSMDAwMDA1SGpWMjEXMBUGA1UECgwOU2FsZXNmb3JjZS5jb20xFjAUBgNV
    BAcMDVNhbiBGcmFuY2lzY28xCzAJBgNVBAgMAkNBMQwwCgYDVQQGEwNVU0GCDgGO
    w0vguQAAAAAOAWaRMA0GCSqGSIb3DQEBCwUAA4IBAQAwVrNVTaZ4SKsNfiRT3z6C
    riF68KTkhkuu+wZ3EK32ap+5MJ6MQ9IFAepg6+OQ86Al8N574PC6GEN5rfNfivKQ
    or4ZEM9Vpv2wXqsjk6iKKQN/3SYg42AZdUK2hmbGszC3GKmSgOP9pZ0/cklFJTGv
    zP5No+QXi2lDWTIpeJo7ldZB5lFjU7CmyWOK/zU6oVFm5j0xNVvAGpS8n9M3YNLe
    04ZNJkhUNgauTgpnYbkp9XAKbyTFjmRe0Bs3nuLjMeR8WfWpXNzltg3dqLArHnwD
    Nl6CraLpIYUiNhlo/aTt7aJDLU7S1ssfbBUaSAvlBhOJndibRrS9LdBr/RzuGy5D
    -----END CERTIFICATE-----
    `, // Salesforce certificate
  },
  (profile, done) => done(null, profile)
);

passport.use(samlStrategy);

app.get(
  '/login',
  (req,res,next) => {
    console.log("rim I am here")
    console.log(req.body)
    next()
  },
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    console.log("Send login requeset")
    res.redirect('/')
  }
  // (req, res) => {
  //   console.log(123)
  // }

);

app.post(
  '/api/auth/saml/callback',
  (req,res,next) => {
    console.log("rim you are there")
    console.log(req.body)
    next()
  },
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    // Successful authentication
    console.log("Succeed !")
    res.redirect('/');
  }
);

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'client/build/index.html')) })

server.listen(PORT, () => {console.log(`Started server on => http://localhost:${PORT}`)})
