
var express = require('express');
var request = require('request');
var exphbs  = require('express3-handlebars')
var app = express();

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var serviceurl = process.env.SERVICE;
var ansattlisteurl = process.env.ANSATTLISTE;
var userpass = process.env.USERPASS;

var demo_url = "https://api.github.com/users/bekkopen/repos";

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var alle_ansatte = [];

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

// GUI FOR ALLE MELDINGER
app.get('/gui', function(req, res) {
  getUrl(
    serviceurl + '/api/messages',
    function(body) {
      res.render('messages', {posts: body});
    }
  );
});

// ALLE MELDINGER
app.get('/messages', function(req, res) {
  getUrl(
    serviceurl + '/api/messages',
    function(body) {
      res.json(body);
    }
  );
});

// ENKELT MELDING
app.get('/message/:id', function(req, res) {
  var messageid = req.params.id;
  getUrl(
    serviceurl + '/api/messages/' + messageid,
    function(message){
      enrichMessage(message, function(message){
        res.json(message);
      });
    }
  );
});

function enrichMessage(message, func) {
  var remainingCalls = 2;

  function decrementAndCommit(){
    remainingCalls = remainingCalls-1;
    if (remainingCalls == 0){
      func(message);
    }
  }

  enrichMessageWithLikes(message, decrementAndCommit);
  enrichMessageWithUser(message, decrementAndCommit);
}

function enrichMessageWithLikes(message, func) {
  getUrl(
    serviceurl + "/api/messages/" + message.id + "/likes",
    function(likes){
      message.likes = likes;
      func(message);
    });
}

function enrichMessageWithUser(message, func) {
  var username = message.user.name;
  var userId = get_userId(username);

  getUrl(
    ansattlisteurl + "/employee/" + userId,
    function(user){

      user = user[0];
      message.user.avdeling = user.Department;
      message.user.senioritet = user.Seniority;

      func(message);
    });
}

function get_userId(username){
  var navn = username.split(" ");
  var kandidater = alle_ansatte.filter(function( elem ) {
    return elem.Name.indexOf(navn[0]) >= 0 &&
           elem.Name.indexOf(navn[navn.length-1]) >= 0;
  });
  if (kandidater == null || kandidater.length < 1){
    return;
  }

  var kandidat = kandidater[0];
  return kandidat.Id;
}

// ALLE BRUKERE
app.get('/users', function(req, res) {
  getUrl(
    serviceurl + '/api/users',
    function(body) {
      res.json(body);
    }
  );
});

// ENKELT BRUKER
app.get('/user/:id', function(req, res) {
  var userid = req.params.id;
  getUrl(
    serviceurl + '/api/users/' + userid,
    function(body) {
      res.json(body);
    }
  );
});

// SEARCH 
app.get('/search', function(req, res) {
  var searchstring = req.query.q;
  getUrl(
    serviceurl + '/api/search?q=' + searchstring,
    function(body) {
      res.json(body);
    }
  );
});


function getUrl(url, func){

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

request.get({
    url: ansattlisteurl + "/all",
    json: true,
    headers: {
      'User-Agent': 'request'
    }
  },
  function(error, response, body){
    if(error) {
      console.log("an error has occured. keep calm and carry on.", error);
    }
    alle_ansatte = body;
  }
);

app.listen(port);
