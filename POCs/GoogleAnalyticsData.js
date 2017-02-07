var dateFormat = require('dateformat');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/mediamixmodeling';
var mydb = '';
var startindex = 1;
var maxresults = 10000;
var gacallflag = 'true';
var gadataobj='';

var GA = require('googleanalytics'),
    util = require('util'),
    config = {
        "token": "ya29.CjVHAzM90KVCWp4JXcQQYaYWbsD6O61Mx5CWzGaUDIgRZ0PArSEVU0h3Hy6MR8zBVFtmceUeCw"
    },

    ga = new GA.GA(config);

var options = {
    'ids': 'ga:86833475',
    'start-date': '2016-08-15',
    'end-date': 'yesterday',
    'dimensions': 'ga:productSku,ga:date',
    'metrics': 'ga:quantityCheckedOut',
    'sort': '-ga:quantityCheckedOut',
    //'start-index': startindex.toString(),
    'max-results': maxresults.toString()
};

var gdata = ga.get(options, getGAData);
function getGAData(err, gadata) {
    console.log(err)
    gadataobj = gadata;
    console.log(JSON.stringify(gadataobj));
    MongoClient.connect(url,dbConnect);
   if (typeof gadata.nextLink !== 'undefined' && gadata.nextLink !== gadata.nextLink){
         startindex = startindex + maxresults;
         var gdata = ga.get(options, getGAData);
     }
}

function dbConnect(err, db) {
  assert.equal(null, err);
  mydb = db;
  insertDocument(gadataobj);
  //findRestaurants(db, dbClose);
}

function findRestaurants(db, dbClose) {
   var cursor =db.collection('gaRAW').find( );
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        //doc.rows.forEach(insertData);
        console.log(doc.rows);
        insertDocument(doc.rows);
      } else {
         dbClose(db);
      }
   });
}
function insertDocument(records) {
  records.forEach(insertRecord);

  }

function insertRecord(record)
{
  var dFormat = record[1].substr(0,4)+"-"+record[1].substr(4,2)+"-"+record[1].substr(6,2);
  mydb.collection('pageView').insertOne( {
        "productSKU" : record[0],
        "date" : new Date(dFormat),
        "quantityCheckedOut" : record[2]
     }, function(err, result) {
   assert.equal(err, null);
   console.log("Inserted a document into the restaurants collection.");
   dbClose();
 });
}

function dbClose(db) {
    mydb.close();
}

/*
https://www.googleapis.com/analytics/v3/data/ga?
ids=ga%3A86833475
&start-date=2016-08-01
&end-date=2016-08-04
&metrics=ga%3AquantityCheckedOut
&dimensions=ga%3AproductSku%2Cga%3Adate
&sort=-ga%3AquantityCheckedOut
&start-index=2000
&max-results=10000
&access_token=ya29.CjVHA61WSHYfSdCZlCnMqivRS90_gExKVN9TlTjfE_EBD195xUP0g5OW8-6zQKklsFheSQMtDg
*/
