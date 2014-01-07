var ajaxUtil = require('./ajaxUtil');

var serviceurl = process.env.VEGVESENSERVICE;
var userpass = process.env.USERPASS;

var cachedRegNr = {};



exports.getCarInfoByRegNr = function getCarInfoByRegNr (regNr, callback) {

	if(cachedRegNr[regNr]) {
		callback(cachedRegNr[regNr]);
	}else {
		ajaxUtil.get(serviceurl + "/api/" + regNr, userpass,userpass,
			function(dataArray) {
				var carinfo = {};
				dataArray.forEach(function(item) {
					carinfo[item.name] = item.value;
				});
				cachedRegNr[regNr] = carinfo;
				callback(carinfo);
			});
	}
}