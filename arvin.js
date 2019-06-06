'use strict';
const fs   = require('fs');
const jwt  = require('jsonwebtoken');

var payload = {
    data1: "Data 1",
    data2: "Data 2",
    data3: "Data 3",
    data4: "Data 4",
   };

   var privateKEY  = fs.readFileSync('./private.key', 'utf8');
var publicKEY  = fs.readFileSync('./public.key', 'utf8');
var i  = 'Mysoft_corp';          // Issuer 
var s  = '1234567890';        // Subject 
var a  = 'http://mysoftcorp.in'; // Audience

var signOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "10m",
    algorithm:  "PS256"
   };

   var token = jwt.sign(payload, privateKEY, signOptions);
console.log("Token - " + token)

//JWT verification using public key
var verifyOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    expiresIn:  "10m",
    algorithm:  ["PS256"]
   };
   var legit = jwt.verify(token, publicKEY, verifyOptions);
   console.log("\nJWT verification result: " + JSON.stringify(legit));