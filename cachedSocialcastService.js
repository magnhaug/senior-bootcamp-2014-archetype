
var socialcastService = require('./socialcastService');
var cacheService = require('./mongoService');

exports.getMessages = socialcastService.getMessages;

exports.getMessage = function(messageid, callback){
    cacheService.get(messageid, function (err, item) {
        if (item) {
            callback(message);
        } else {
            socialcastService.getMessage(messageid, function(message){
                callback(message);
            })
        }
    });
};

exports.storeMessage = cacheService.insert;