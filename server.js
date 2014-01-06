
var express = require('express');
var request = require('request');
var app = express();


var demo_url = "https://api.github.com/users/bekkopen/repos";
app.get('/', function(req, res) {
  request.get({
    url: demo_url,
    json: true,
    headers: {
      'User-Agent': 'request'
    }
  }, function(error, response, body) {
    if(error) {
      console.log("an error has occured. keep calm and carry on.");
    }
    res.json(body);
  });


});


// if on heroku use heroku port.
var port = process.env.PORT || 1339;
app.listen(port);
