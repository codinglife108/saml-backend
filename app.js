require('dotenv').config();

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

const samlStrategy = new SamlStrategy(
    {
        entryPoint: 'https://login.salesforce.com/?so=00D7R000005HjV2',
        // + "&metaAlias=/idp"
        // + "&spEntityID=https://bet123.ninja/metadata/",
        issuer: 'https://saas-innovation-41572.my.salesforce.com',
        callbackUrl: 'https://bet123.ninja/api/auth/saml/callback',
        cert: `MIIErDCCA5SgAwIBAgIOAY7DS+C5AAAAAA4BZpEwDQYJKoZIhvcNAQELBQAwgZAxKDAmBgNVBAMMH1NlbGZTaWduZWRDZXJ0XzA5QXByMjAyNF8xNDM4MzMxGDAWBgNVBAsMDzAwRDdSMDAwMDA1SGpWMjEXMBUGA1UECgwOU2FsZXNmb3JjZS5jb20xFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28xCzAJBgNVBAgMAkNBMQwwCgYDVQQGEwNVU0EwHhcNMjQwNDA5MTQzODMzWhcNMjUwNDA5MTIwMDAwWjCBkDEoMCYGA1UEAwwfU2VsZlNpZ25lZENlcnRfMDlBcHIyMDI0XzE0MzgzMzEYMBYGA1UECwwPMDBEN1IwMDAwMDVIalYyMRcwFQYDVQQKDA5TYWxlc2ZvcmNlLmNvbTEWMBQGA1UEBwwNU2FuIEZyYW5jaXNjbzELMAkGA1UECAwCQ0ExDDAKBgNVBAYTA1VTQTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJ1UvvEPLiCUoDDMrPPDzeaFK6YVI0n9jLmQm8pP3lIwkj029QxySVTyA7J+62aJ6GbUON43KL8ekIdPqthIfsr63XqsZ5ZxW19/wm3lNTFvYRYEz5WR1/nMdEEG3/tZ9EUhwO3V706tjJtQQCmwvEM12t1duBlvgjE4tSt4eY2spgj3J5XiYXx/+ELgUovIcX39sVwxSxskJ8OY1sPwzkavhA7s/aOvDnEJrrKngR6JfHDCcyONRh7/bKMLyOgNXxEVKUQ1ouCXsQ8CbexklsK5ta1KoIWX5UaKPz7KRosYavTzT2BxY31+o+OA4Svk1NNlA7Jxd8cIGOXVoZf5Kn0CAwEAAaOCAQAwgf0wHQYDVR0OBBYEFJfs53wHlB8wmRurYpNW3uKq9O6vMA8GA1UdEwEB/wQFMAMBAf8wgcoGA1UdIwSBwjCBv4AUl+znfAeUHzCZG6tik1be4qr07q+hgZakgZMwgZAxKDAmBgNVBAMMH1NlbGZTaWduZWRDZXJ0XzA5QXByMjAyNF8xNDM4MzMxGDAWBgNVBAsMDzAwRDdSMDAwMDA1SGpWMjEXMBUGA1UECgwOU2FsZXNmb3JjZS5jb20xFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28xCzAJBgNVBAgMAkNBMQwwCgYDVQQGEwNVU0GCDgGOw0vguQAAAAAOAWaRMA0GCSqGSIb3DQEBCwUAA4IBAQAwVrNVTaZ4SKsNfiRT3z6CriF68KTkhkuu+wZ3EK32ap+5MJ6MQ9IFAepg6+OQ86Al8N574PC6GEN5rfNfivKQor4ZEM9Vpv2wXqsjk6iKKQN/3SYg42AZdUK2hmbGszC3GKmSgOP9pZ0/cklFJTGvzP5No+QXi2lDWTIpeJo7ldZB5lFjU7CmyWOK/zU6oVFm5j0xNVvAGpS8n9M3YNLe04ZNJkhUNgauTgpnYbkp9XAKbyTFjmRe0Bs3nuLjMeR8WfWpXNzltg3dqLArHnwDNl6CraLpIYUiNhlo/aTt7aJDLU7S1ssfbBUaSAvlBhOJndibRrS9LdBr/RzuGy5D`, // Salesforce certificate
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

app.get('/metadata', function (req, res) {
  //Send custom metadata
       res.type('application/xml');
       res.sendFile(__dirname + "/metadata.xml");
     }
   );

app.get(
    '/login',
    (req, res, next) => {
        console.log('rim I am here');
        console.log(req.body);
        next();
    },
    passport.authenticate('saml', { 
      successRedirect: 'https://bet123.ninja/api/auth/saml/callback',
      failureRedirect: '/', 
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
    (req, res, next) => {
        console.log('rim you are there');
        console.log(req.body);
        next();
    },
    passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
    (req, res) => {
        // Successful authentication
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
