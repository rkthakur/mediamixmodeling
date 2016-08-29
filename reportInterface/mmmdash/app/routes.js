var Subjects = require('./models/SubjectViews');
var Models = require('./models/ModelViews');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	// sample api route
 app.get('/api/data', function(req, res) {
  // use mongoose to get all nerds in the database
  Subjects.find({}, {'_id': 0,'TDate':1, 'TV': 1, 'Newspaper': 1, 'Radio': 1, 'Sales': 1}, function(err, subjectDetails) {
   // if there is an error retrieving, send the error.
       // nothing after res.send(err) will execute
   if (err)
   res.send(err);
    res.json(subjectDetails); // return all nerds in JSON format
  });
 });

 app.get('/api/modeldata', function(req, res) {
  // use mongoose to get all nerds in the database
  Models.find({'isActive': 'YES'}, {'modelResult': 1}, function(err, modelDetails) {
   // if there is an error retrieving, send the error.
       // nothing after res.send(err) will execute
   if (err)
   res.send(err);
    res.json(modelDetails); // return all nerds in JSON format
  }); //.sort({_id:-1}).limit(1)
 });

/*=========Upload File route Starts*/
app.post("/uploadfile", upload.single('uploadfile'), function (req, res, next) {

    var dataArray = [];
    var _headerData = {};
    var _index = 0;
    //var url = 'mongodb://localhost:27017';
    req.session.collectionName = req.body.Collection == "" ? "MMMDb" : req.body.Collection;
    MongoClient.connect(connectionCsvCollection, function (err, db) {
        console.log("DB is connect");
        //var _file = req.files.uploadfile;
        var reader = csv.createCsvFileReader(req.file.path, { 'separator': ',' });
        reader.addListener('data', function (data) {
            if (Object.keys(_headerData).length == 0) {
                for (var index in data) { _headerData[data[index]] = ""; }
            }
            else {
                var newRowData = {};
                var clmNO = 0;
                var _keys = Object.keys(_headerData);
                for (var index in data) {
                    newRowData[_keys[clmNO]] = data[index];
                    clmNO++;
                }
                if (err) {
                    res.end('Unable to connect to the mongoDB server. Error:', err);
                } else {
                    if (Object.keys(_headerData).length == Object.keys(newRowData).length) {
                        db.collection(req.session.collectionName).insert(newRowData);
                        console.log("Row inserted: " + JSON.stringify(newRowData));
                    }
                }
            }
        });
        reader.addListener('end', function (data) {
            db.close();
            res.writeHead(302, {
                'Location': '/index.html'
                //add other headers here...
            });
            res.end();
        });


    });
});

/*=========Upload File route Ends*/


 // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendfile('./public/login.html');
 });
}
