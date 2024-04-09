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
        entryPoint: 'https://login.salesforce.com/?so=00D7R000005HjV2'
        + "&metaAlias=/idp"
        + "&spEntityID=https://bet123.ninja/metadata/",
        issuer: 'https://saas-innovation-41572.my.salesforce.com',
        callbackUrl: 'https://bet123.ninja/api/auth/saml/callback',
        cert: `MIIEWzCCA0OgAwIBAgIOAY7ERXAOAAAAAAQ6vSMwDQYJKoZIhvcNAQELBQAwdzEPMA0GA1UEAwwGbGluMTA4MRgwFgYDVQQLDA8wMEQ3UjAwMDAwNUhqVjIxFzAVBgNVBAoMDlNhbGVzZm9yY2UuY29tMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMQswCQYDVQQIDAJDQTEMMAoGA1UEBhMDVVNBMB4XDTI0MDQwOTE5MTEwOFoXDTI1MDQwOTEyMDAwMFowdzEPMA0GA1UEAwwGbGluMTA4MRgwFgYDVQQLDA8wMEQ3UjAwMDAwNUhqVjIxFzAVBgNVBAoMDlNhbGVzZm9yY2UuY29tMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMQswCQYDVQQIDAJDQTEMMAoGA1UEBhMDVVNBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg5gOOXXjp8MS5Q9lRaXQQ69qP3Z4r30MP42Excbd6e4FTlHd1/9OWcYsO6ev0SnkDsrUWjwaiaXzJ5rz4LWQc6FAqepVqbx1Y0yAA43xHKRpeqMLt633ateFvllmgjTlXQ5sFvCEBWUc9NrsJZMeL0ODuYwj4t4HFVmLgSzMWne5pJm1Mn5Y14DDvQTJ6BwL3XvxGeYlDhBwvPxbFaps1bzLisJg3Gq+X2FHKr65K8sT9wz8sB5rc4p+bPwGww7OxAh1FJ6z4AK9orujWN/b3/0VmUntWhDo2+uUXxCOlLiakrLlEntp3wjHsGL+AMD1Gkzfwl8ANSNJ48Oh03Qd+wIDAQABo4HkMIHhMB0GA1UdDgQWBBTYkfvb04l2jO0lCB7F6FsnUZi+tjAPBgNVHRMBAf8EBTADAQH/MIGuBgNVHSMEgaYwgaOAFNiR+9vTiXaM7SUIHsXoWydRmL62oXukeTB3MQ8wDQYDVQQDDAZsaW4xMDgxGDAWBgNVBAsMDzAwRDdSMDAwMDA1SGpWMjEXMBUGA1UECgwOU2FsZXNmb3JjZS5jb20xFjAUBgNVBAcMDVNhbiBGcmFuY2lzY28xCzAJBgNVBAgMAkNBMQwwCgYDVQQGEwNVU0GCDgGOxEVwDgAAAAAEOr0jMA0GCSqGSIb3DQEBCwUAA4IBAQANNV29ZtSDNTLQDu4Ri3xUnUZJELAxgaoOav3CEWDyoJkzHvtn032ipvyh1ig4CG/mvwTDAxfDyQyaUUysj1bIVnE0XC/jZ2uHw/rLfxrNPtWfLt4Yqb3biYbKf5aD1V6uAz4yLmk2WrY6uuIdE42yZoXmOAjhk5SLy9OVd4ddY9XuTVvw8RMNqppV1aZsKsyjTzW6LcnaG6vqyQ/nX+V5mJqWZpwob1aHo5jxdHo6mDwlNMMSew44zI4V7U2c4FMX2KnuEsMEf24EkDjeyGn9fG03lywzn0/NWSb2h7izfxr/vv72K85FK6S1sEOh1LvoDMFiBInvcHG+VeoAcLYm`, // Salesforce certificate
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
      failureRedirect: 'https://bet123.ninja/api/auth/saml/callback', 
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
