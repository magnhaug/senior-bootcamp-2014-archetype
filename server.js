var express = require('express');
var request = require('request');
var exphbs = require('express3-handlebars');

var mongoDb = require('./mongoService');
var ajaxUtil = require('./ajaxUtil');
var userService = require('./userService');
var socialcastService = require('./socialcastService');

var app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));

app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/'));

app.use(express.bodyParser());

// GUI
app.get('/', function (req, res) {
    socialcastService.getMessages(function(messages){
        res.render('messages', {posts: messages});
    });
});

// ALLE MELDINGER
app.get('/messages', function (req, res) {
    socialcastService.getMessages(function(messages){
        res.json(messages);
    });
});

// ENKELT MELDING
app.get('/message/:id', function (req, res) {
    var messageid = req.params.id;
    var timeId = "Message_" + messageid + "_" + (new Date()).getTime();

    var mongoMessage = mongoDb.get(messageid, function (err, item) {
        if (item) {
            res.json(item);
            return;
        }

        // else..
        socialcastService.getMessage(messageid, function(message){
            res.json(message);
        })

    });
});

app.post('/push', function (req, res) {

    var message = req.body.data;
    mongoDb.insert(message,
        function (err) {
            res.send(500, { error: 'Couldnt save' })
        }, function (message) {
            res.json(message);
        });

});

// if on heroku use heroku port.
app.listen(process.env.PORT || 1339);
console.log("Started!");
