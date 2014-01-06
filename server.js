
var express = require('express');
var request = require('request');
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var serviceurl = process.env.SERVICE;
var userpass = process.env.USERPASS;

var demo_url = "https://api.github.com/users/bekkopen/repos";

// ROT-url
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

// ALLE MELDINGER
app.get('/messages', function(req, res) {
  get_socialcast(
    serviceurl + '/api/messages',
    function(body) {
      res.json(body);
    }
  );
});

// ENKELT MELDING
app.get('/message/:id', function(req, res) {
  var messageid = req.params.id;
  get_socialcast(
    serviceurl + '/api/messages/' + messageid,
    function(body) {
      res.json(body);
    }
  );
});

// ALLE BRUKERE
app.get('/users', function(req, res) {
  get_socialcast(
    serviceurl + '/api/users',
    function(body) {
      res.json(body);
    }
  );
});

// ENKELT BRUKER
app.get('/user/:id', function(req, res) {
  var userid = req.params.id;
  get_socialcast(
    serviceurl + '/api/users/' + userid,
    function(body) {
      res.json(body);
    }
  );
});

// SEARCH 
app.get('/search', function(req, res) {
  var searchstring = req.query.q;
  get_socialcast(
    serviceurl + '/api/search?q=' + searchstring,
    function(body) {
      res.json(body);
    }
  );
});


function get_socialcast(url, func){

  request.get({
    url: url,
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
    func(body);
  });
}

app.listen(port);
