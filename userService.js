
var ajaxUtil = require('./ajaxUtil');
var vegvesenService = require('./vegvesenService');

var ansattlisteurl = process.env.ANSATTLISTE;
var userpass = process.env.USERPASS;

var userCache = [];

function populateUserCache() {
    ajaxUtil.get(
        ansattlisteurl + "/all",
        userpass,
        userpass,
        function (body) {
            userCache = body;
        }
    );
}

function getUserId(username) {
    var navn = username.split(" ");
    var kandidater = userCache.filter(function (elem) {
        return elem.Name.indexOf(navn[0]) >= 0 &&
            elem.Name.indexOf(navn[navn.length - 1]) >= 0;
    });
    if (kandidater == null || kandidater.length < 1) {
        console.warn("Unable to find: ", username);
        return;
    }

    var kandidat = kandidater[0];
    return kandidat.Id;
}

exports.getUser = function(username, func) {
    var userId = getUserId(username);

    ajaxUtil.get(
        ansattlisteurl + "/employee/" + userId,
        userpass,
        userpass,
        function (user) {
            user = user[0];
            var regNr = user.Cars;
            
            if(regNr) {
                user.regNr = regNr;
                vegvesenService.getCarInfoByRegNr(regNr, function (carInfo) {
                    user.bilmerke = carInfo["Merke og modell"];
                    user.drivstoffType = carInfo.Drivstoff;
                    func(user);
                });
            }else {
                func(user);
            }
        });
}


populateUserCache();