
var express = require('express');
var request = require('request');
var exphbs  = require('express3-handlebars');
var cache = require('memory-cache');
var mongoDb = require('./mongoService');

var app = express();


process.setMaxListeners(0);

// if on heroku use heroku port.
var port = process.env.PORT || 1339;
var serviceurl = process.env.SERVICE;
var ansattlisteurl = process.env.ANSATTLISTE;
var userpass = process.env.USERPASS;

var demo_url = "https://api.github.com/users/bekkopen/repos";

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/'));
app.use(express.bodyParser());


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
      enrichMessages(body,function(messages) {
        res.render('messages', {posts: messages});
      });

    }
  );
});

// ALLE MELDINGER
app.get('/messages', function(req, res) {
  console.time("Messages");
  getUrl(
    serviceurl + '/api/messages',
    function(messages) {
    	enrichMessages(messages,function(messages) {
  		console.timeEnd("Messages");
	      res.json(messages);
    	});
    }
  );
});

// ENKELT MELDING
app.get('/message/:id', function(req, res) {
  var messageid = req.params.id;
  var timeId = "Message_" + messageid + "_" + (new Date()).getTime(); 

  console.time(timeId);

  var mongoMessage = mongoDb.get(messageid, function(err, item){
    if (item) {
      res.json(item);
      return
    }
    getUrl(
      serviceurl + '/api/messages/' + messageid,
      function(message){
        enrichMessage(message, function(message){
          console.timeEnd(timeId);
          res.json(message);
        });
      }
    );
  });
});

app.post('/push', function(req, res){

  var message = req.body.data;
  console.log("Melding ble pushe til oss med id: ", message.id);
  mongoDb.insert(message, 
    function(err){
      res.send(500, { error: 'Couldnt save' })
  }, function(message){
    res.json(message);
  });

});

app.get('/pushtest/:id', function(req, res){
  var messageId = req.params.id;
  var message = mongoDb.get(messageId, function(err, message){
    if (err) res.send(404, { error: 'No message found' })
    else res.json(message);    
  });
});


function enrichMessages(messages, func) {
  var remainingCalls = messages.length;

  function decrementAndCommit(){
    remainingCalls = remainingCalls-1;
    if (remainingCalls == 0){
      func(messages);
    }
  }

  messages.forEach(function (message) {
  	enrichMessage(message,decrementAndCommit);
  });

}

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
	var cacheKey = "Likes_" + message.id;
	var timeId = "Likes_" + message.id + "_" + (new Date()).getTime();

  	console.time(timeId);
  	var cacheLikes = cache.get(cacheKey);

  	if(cacheLikes) {
      message.likes = cacheLikes;
		  func(message);
      console.timeEnd(timeId);
  	}else {
	  getUrl(
	    serviceurl + "/api/messages/" + message.id + "/likes",
	    function(likes){
	    	cache.put(cacheKey, likes,1000*60*15);
	      	message.likes = likes;
	      	func(message);
	      	console.timeEnd(timeId);
	    });
	}
}

function enrichMessageWithUser(message, func) {
  var username = message.user.name;
  var userId = get_userId(username);
  var timeId = "User" + message.id + "_" + (new Date()).getTime(); 

  console.time(timeId);

  getUrl(
    ansattlisteurl + "/employee/" + userId,
    function(user){

      user = user[0];
      message.user.avdeling = user.Department;
      message.user.senioritet = user.Seniority;

      func(message);
  		console.timeEnd(timeId);
    });
}

function get_userId(username){
  var navn = username.split(" ");
  var kandidater = alle_ansatte.filter(function( elem ) {
    return elem.Name.indexOf(navn[0]) >= 0 &&
           elem.Name.indexOf(navn[navn.length-1]) >= 0;
  });
  if (kandidater == null || kandidater.length < 1){
  	console.warn("Unable to find: ",username);
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
console.log("Started!");
