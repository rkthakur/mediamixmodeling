var Subjects = require('./models/SubjectViews');
var mongodb = require('mongodb');
var fs = require('fs');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;
module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes	
    // sample api route
    app.get('/api/data', function (req, res) {
        // use mongoose to get all nerds in the database
        Subjects.find({}, { '_id': 0, 'school_state': 1, 'resource_type': 1, 'poverty_level': 1, 'date_posted': 1, 'total_donations': 1, 'funding_status': 1, 'grade_level': 1 }, function (err, subjectDetails) {
            // if there is an error retrieving, send the error. 
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);
            res.json(subjectDetails); // return all nerds in JSON format
        });
    });

    app.get("/api/tabledata", function (req, res) {
        var collectionName = "MMMDb";
        if (req.session.collectionName) {
            collectionName = req.session.collectionName
        } else {
            req.session.collectionName = collectionName;
        }
        MongoClient.connect(connectionCsvCollection, function (err, db) {
            var cursor = db.collection(collectionName).find();
            var dataArray = [];
            cursor.each(function (err, doc) {
                //assert.equal(err, null);
                if (doc != null) {
                    //console.log(doc);
                    dataArray.push(doc);
                } else {
                    db.close();
                    res.send(dataArray);
                }
            });


        });

    });
    app.post("/api/editTableData", function (req, res) {
        console.log("In editTableData : " + JSON.stringify(req.body));

        if (req.session.collectionName) {
            MongoClient.connect(connectionCsvCollection, function (err, db) {
                var _id = req.body._id;
                delete req.body._id;
                console.log(req.body);
                db.collection(req.session.collectionName).update({ "_id": new ObjectId(_id) }, req.body, function (err, result) {
                    db.close();
                    res.send(result);
                });


            });

        }


    });
    app.post("/api/deleteTableData", function (req, res) {
        console.log("In deleteTableData : " + JSON.stringify(req.body));
        if (req.session.collectionName) {
            MongoClient.connect(connectionCsvCollection, function (err, db) {
                var _id = req.body._id;
                delete req.body._id;
                console.log(req.body);
                db.collection(req.session.collectionName).deleteOne({ "_id": new ObjectId(_id) }, function (err, result) {
                    db.close();
                    res.send(result);
                });


            });

        }
    });
    app.post("/api/insertTableData", function (req, res) {
        console.log("In insertTableData : " + JSON.stringify(req.body));
        if (req.session.collectionName) {
            MongoClient.connect(connectionCsvCollection, function (err, db) {
                var _id = req.body._id;
                delete req.body._id;
                console.log(req.body);
                db.collection(req.session.collectionName).insertOne(req.body, function (err, result) {
                    db.close();
                    res.send(result);
                });


            });

        }
    });
    // frontend routes =========================================================
    //app.get('*', function (req, res) {
    //    res.sendfile('./public/login.html');
    //});
    app.post("/uploadfile", upload.single('uploadfile'), function (req, res, next) {

        var dataArray = [];
        var _headerData = {};
        var _index = 0;
        //var url = 'mongodb://localhost:27017';
        req.session.collectionName = req.body.Collection == "" ? "MMMDb" : req.body.Collection;
        MongoClient.connect(connectionCsvCollection, function (err, db) {
            console.log("DB is connect");
            //var _file = req.files.uploadfile;
            var rs = fs.createReadStream(req.file.path);
            var result = {};
            converter.on("end_parsed", function (jsonObj) {
                //console.log(jsonObj);
                for (var newRowData in jsonObj) {
                    //console.log(typeof (jsonObj[newRowData].school_zip));
                    db.collection(req.session.collectionName).insert(jsonObj[newRowData]);
                }
                db.close();
                res.writeHead(302, {
                    'Location': 'http://localhost:8080/index.html'
                    // // //add other headers here...
                });
                res.end();

            });

            //record_parsed will be emitted each time a row has been parsed.
            converter.on("record_parsed", function (resultRow, rawRow, rowIndex) {
                for (var key in resultRow) {
                    if (!result[key] || !result[key] instanceof Array) {
                        result[key] = [];
                    }
                    result[key][rowIndex] = resultRow[key];
                }
                //console.log(result);
            });
            rs.pipe(converter);
        });
    });
}