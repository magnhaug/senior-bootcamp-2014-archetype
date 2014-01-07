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
			console.log("Inserted in mongo: ", item);
			db.close();
			if (err) onError(err);
			else onSuccess(docs);
		});
	});
}

exports.get = function(key, callback){

	console.log("Trying to get " + key + " from mongo db, with connstring: " + connString);

	MongoClient.connect(connString, function(err, db) {
		if(err) {
			callback(err, null);
			return;
		}
		
		console.log("Connection opened");

		var collection = db.collection(messageCollectionName);
		// Locate all the entries using find

		var item = collection.findOne({id: parseInt(key)}, function(err, item){

			console.log("Found one!");
			console.log(arguments);


			db.close();
			console.log("Retrieved from mongo: ", item);

			console.log("Returning");
			callback(null, item);
		});

	});
}