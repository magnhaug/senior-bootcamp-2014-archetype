
var express = require('express');
var request = require('request');
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var serviceurl = process.env.SERVICE;
var userpass = process.env.USERPASS;

var demo_url = "https://api.github.com/users/bekkopen/repos";

app.get('/', function(req, res) {
  request.get({
    url: demo_url,
    json: true,
    headers: {
      'User-Agent': 'request'
    }
  },
  function(error, response, body) {
    if(error) {
      console.log("an error has occured. keep calm and carry on.", error);
    }
    res.json(body);
  });
});

app.get('/messages', function(req, res) {
  request.get({
    url: serviceurl + '/api/messages',
    json: true,
    auth: {
        user: userpass,
        pass: userpass,
        sendImmediately: false
    },
    headers: {
      'User-Agent': 'request'
    }
  },
  function(error, response, body) {
    if(error) {
      console.log("an error has occured. keep calm and carry on.", error);
    }
    res.json(body);
  });
});

app.listen(port);
