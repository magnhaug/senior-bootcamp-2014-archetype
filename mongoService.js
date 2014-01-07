// Mongo Service
var MongoClient = require('mongodb').MongoClient;
var messageCollectionName = 'messages';
var connString = process.env.MONGOLAB_URI;


exports.insert = function(item, onError, onSuccess){
	MongoClient.connect(connString, function(err, db) {
		if(err) {
			onError(err);
			return;
		}


		var collection = db.collection(messageCollectionName);
		collection.insert(item, function(err, docs) {
			db.close();
			if (err) onError(err);
			else onSuccess(docs);
		});
	});
};

exports.get = function(key, callback){

	MongoClient.connect(connString, function(err, db) {
		if(err) {
			callback(err, null);
			return;
		}

		var collection = db.collection(messageCollectionName);
		// Locate all the entries using find

		var item = collection.findOne({id: parseInt(key)}, function(err, item){
			db.close();
			callback(null, item);
		});

	});
};