var express = require('express');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var fs = require('fs');
var imagePage = require('./image');
var dbURL = "mongodb://localhost:27017/database1";
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(multiparty());
app.use('/uploads/images', express.static(__dirname + '/uploads/images'));
app.use('/css', express.static(__dirname + '/css'));
app.set('view engine', 'ejs');
//app.locals.jsondata = require('./file.json');

function requestGET(request, response){
	MongoClient.connect(dbURL, function(err, db) {
		assert.equal(null, err);
		var resultArray = [];
		var cursor = db.collection('MongoConnection').find();
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			resultArray.push(doc);
		}, function(){
			db.close();
			response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
			response.end(JSON.stringify(resultArray));
		});
	});
}

function requestPOST(request, response){
	var item = {
		name: request.body.name,
		age: request.body.age
	};
	MongoClient.connect(dbURL, function(err, db) {
		assert.equal(null, err);
		db.collection('MongoConnection').insertOne(item, function(err, result){
			assert.equal(null, err);
			db.close();
		});
	});
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("POST!");
	response.end();
}

function requestPUT(request, response){
	var item = {};
	if(request.body.name != null){
		item['name'] = request.body.name;
	}
	if(request.body.age != null){
		item['age'] = request.body.age;
	}
	MongoClient.connect(dbURL, function(err, db) {
		if(err) { return console.dir(err); }
		var collection = db.collection('MongoConnection');
		collection.update({'_id': ObjectID(request.body.id)}, {$set: item}, function(err, result){});
	});
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("PUT!");
	response.end();
}

function requestDELETE(request, response){
	MongoClient.connect(dbURL, function(err, db) {
		if(err) { return console.dir(err); }
		var collection = db.collection('MongoConnection');
		collection.remove({'_id': ObjectID(request.body.id)}, function(err, result) {});
	});
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write("DELETE!");
	response.end();
}

// Post iamge files
function uploadImage(request, response) {
	fs.readFile(request.files.image.path, function (err, data) {
		var imageName = request.files.image.name
		// If there's an error
		if(!imageName){
			console.log("There was an error")
			response.redirect("/");
			response.end();
		} else {
		    var newPath = __dirname + "/uploads/images/" + imageName;
		    var item = {
		  		name: request.body.name,
		  		age: "/uploads/images/" + imageName
		  	};
		  	MongoClient.connect(dbURL, function(err, db) {
				assert.equal(null, err);
				db.collection('MongoConnection').insertOne(item, function(err, result){
					assert.equal(null, err);
					db.close();
				});
			});
		    // write file to uploads/images folder
		    fs.writeFile(newPath, data, function (err) {
		        // let's see it
		        //response.redirect("/uploads/images/" + imageName);
		        response.redirect('/index');
		  	});
		}
	});
}

//set json data
function setJsonData(){
	MongoClient.connect(dbURL, function(err, db) {
		assert.equal(null, err);
		var resultArray = [];
		var cursor = db.collection('MongoConnection').find();
		cursor.forEach(function(doc, err){
			assert.equal(null, err);
			resultArray.push(doc);
		}, function(){
			db.close();
			app.locals.jsondata = resultArray;
		});
	});
}

function getIndex(request, response){
	fs.readFile('./index.html', function (err, html) {
	    if (err) {
	        throw err; 
	    }
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();
	});
}

app.get('/', function(request, response){
	response.redirect('/index');
	console.log('Redirect to index!');
});

app.get('/index', function(request, response){
	getIndex(request, response);
	setJsonData();
	console.log('This is index!');
});

app.use('/image', imagePage);

app.get('/imageDB', function(request, response){
	requestGET(request, response);
	console.log('GET: return results!');
});

app.post('/imageDB', function(request, response){
	uploadImage(request, response);
	console.log('POST: saved!');
});

app.put('/imageDB', function(request, response){
	requestPUT(request, response);
	console.log('PUT: updated!');
});

app.delete('/imageDB', function(request, response){
	requestDELETE(request, response);
	console.log('DELETE: deleted!');
});

module.exports = app;