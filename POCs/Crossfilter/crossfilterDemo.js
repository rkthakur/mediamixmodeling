var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/mdeimixmodeling';
var db = MongoClient.connect(url);
var cursor =db.collection('SampleData').find( );
