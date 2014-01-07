
var ajaxUtil = require('./ajaxUtil');
var userService = require('./userService');

var cache = require('memory-cache');

var serviceurl = process.env.SERVICE;
var userpass = process.env.USERPASS;

var ansattlisteurl = process.env.ANSATTLISTE;

exports.getMessages = function getMessages(callback) {
    ajaxUtil.get(
        serviceurl + '/api/messages',
        userpass,
        userpass,
        function (messages) {
            enrichMessages(messages, function (messages) {
                callback(messages);
            });
        }
    );
};

exports.getMessage = function getMessage(messageid, callback) {
    ajaxUtil.get(
        serviceurl + '/api/messages/' + messageid,
        userpass,
        userpass,
        function (message) {
            enrichMessage(message, function (message) {
                callback(message);
            });
        }
    );
};

function getLikes(message, callback){
    ajaxUtil.get(
        serviceurl + "/api/messages/" + message.id + "/likes",
        userpass,
        userpass,
        function (likes) {
            callback(likes);
        });
}

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
        getLikes(
            message,
            function (likes) {
                cache.put(cacheKey, likes, 1000 * 60 * 15);
                message.likes = likes;
                func(message);
            }
        );
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