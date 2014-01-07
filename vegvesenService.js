var ajaxUtil = require('./ajaxUtil');


var serviceurl = process.env.VEGVESENSERVICE;
var userpass = process.env.USERPASS;



exports.getCarInfoByRegNr = function getCarInfoByRegNr (regNr, callback) {

	ajaxUtil.get(serviceurl + "/api/" + regNr, userpass,userpass,
		function(dataArray) {
			var carinfo = {};
			dataArray.forEach(function(item) {
				carinfo[item.name] = item.value;
			});
			callback(carinfo);
		});
}