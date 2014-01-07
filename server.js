var express = require('express');
var request = require('request');
var exphbs = require('express3-handlebars');

var ajaxUtil = require('./ajaxUtil');
var userService = require('./userService');
//var socialcastService = require('./socialcastService');
var cachedSocialcastService = require('./cachedSocialcastService');

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/'));
app.use(express.bodyParser());


app.get('/', function (req, res) {
    cachedSocialcastService.getMessages(function(messages){
        res.render('messages', {posts: messages});
    });
});

app.get('/messages', function (req, res) {
    cachedSocialcastService.getMessages(function(messages){
        res.json(messages);
    });
});

app.get('/message/:id', function (req, res) {
    var messageid = req.params.id;

    var mongoMessage = cachedSocialcastService.getMessage(
        messageid,
        function(message){
            res.json(message);
    });
});

app.post('/push', function (req, res) {
    var message = req.body.data;
    cachedSocialcastService.storeMessage(
        message,
        function (err) {
            res.send(500, { error: 'Couldnt save' })
        },
        function (message) {
            res.json(message);
        });

});

// if on heroku use heroku port.
app.listen(process.env.PORT || 1339);
console.log("Started!");
