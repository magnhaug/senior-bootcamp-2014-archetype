var express = require('express');
var request = require('request');
var exphbs = require('express3-handlebars');
var cache = require('memory-cache');
var mongoDb = require('./mongoService');
var ajaxUtil = require('./ajaxUtil');
var userService = require('./userService');

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


// GUI
app.get('/', function (req, res) {
    ajaxUtil.get(
        serviceurl + '/api/messages',
        userpass,
        userpass,
        function (body) {
            enrichMessages(body, function (messages) {
                res.render('messages', {posts: messages});
            });

        }
    );
});

// ALLE MELDINGER
app.get('/messages', function (req, res) {
    ajaxUtil.get(
        serviceurl + '/api/messages',
        userpass,
        userpass,
        function (messages) {
            enrichMessages(messages, function (messages) {
                res.json(messages);
            });
        }
    );
});

// ENKELT MELDING
app.get('/message/:id', function (req, res) {
    var messageid = req.params.id;
    var timeId = "Message_" + messageid + "_" + (new Date()).getTime();

    var mongoMessage = mongoDb.get(messageid, function (err, item) {
        if (item) {
            res.json(item);
            return
        }
        ajaxUtil.get(
            serviceurl + '/api/messages/' + messageid,
            userpass,
            userpass,
            function (message) {
                enrichMessage(message, function (message) {
                    res.json(message);
                });
            }
        );
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

app.get('/pushtest/:id', function (req, res) {
    var messageId = req.params.id;
    var message = mongoDb.get(messageId, function (err, message) {
        if (err) res.send(404, { error: 'No message found' })
        else res.json(message);
    });
});


function enrichMessages(messages, func) {
    var remainingCalls = messages.length;

    function decrementAndCommit() {
        remainingCalls = remainingCalls - 1;
        if (remainingCalls == 0) {
            func(messages);
        }
    }

    messages.forEach(function (message) {
        enrichMessage(message, decrementAndCommit);
    });

}

function enrichMessage(message, func) {
    var remainingCalls = 2;

    function decrementAndCommit() {
        remainingCalls = remainingCalls - 1;
        if (remainingCalls == 0) {
            func(message);
        }
    }

    enrichMessageWithLikes(message, decrementAndCommit);
    enrichMessageWithUser(message, decrementAndCommit);
}

function enrichMessageWithLikes(message, func) {
    var cacheKey = "Likes_" + message.id;
    var timeId = "Likes_" + message.id + "_" + (new Date()).getTime();

    var cacheLikes = cache.get(cacheKey);

    if (cacheLikes) {
        message.likes = cacheLikes;
        func(message);
    } else {
        ajaxUtil.get(
            serviceurl + "/api/messages/" + message.id + "/likes",
            userpass,
            userpass,
            function (likes) {
                cache.put(cacheKey, likes, 1000 * 60 * 15);
                message.likes = likes;
                func(message);
            });
    }
}

function enrichMessageWithUser(message, func) {
    var username = message.user.name;
    var userId = userService.getUserId(username);

    ajaxUtil.get(
        ansattlisteurl + "/employee/" + userId,
        userpass,
        userpass,
        function (user) {

            user = user[0];
            message.user.avdeling = user.Department;
            message.user.senioritet = user.Seniority;

            func(message);
        });
}



app.listen(port);
console.log("Started!");
