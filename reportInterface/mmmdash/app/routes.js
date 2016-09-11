var Subjects = require('./models/SubjectViews');
var Models = require('./models/ModelViews');
var mongodb = require('mongodb');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var connectEnsureLogin = require('connect-ensure-login');
var oAuthConfigs = require('../config/social-configs');
console.log(oAuthConfigs);
passport.use(new Strategy({
    clientID: oAuthConfigs.facebook.FACEBOOK_APP_ID,
    clientSecret: oAuthConfigs.facebook.FACEBOOK_APP_SECRET,
    callbackURL: oAuthConfigs.facebook.CallbackURL,
    profileFields: oAuthConfigs.facebook.ProfileFields
}, function (accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
}));

passport.serializeUser(function (user, cb) { cb(null, user); });
passport.deserializeUser(function (obj, cb) { cb(null, obj); });

var fs = require('fs');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;

module.exports = function (app) {
    // server routes ===========================================================   
    /*Start: authentication routes*/
    //app.use(AuthenticationMiddleware());
    app.use(passport.initialize());
    app.use(passport.session());
    app.get("/", function (req, res) {
        if (!req.isAuthenticated()) {
            res.redirect("/dashbaord");
        } else {
            console.log("User is not authenticated.");
            res.redirect("/login");
        }

    });
    app.get('/login', function (req, res) {
        if (!req.isAuthenticated()) {
            res.sendfile('./public/login.html');
        } else {

        }
        //res.render('login');
    });

    app.get('/login/facebook', passport.authenticate('facebook'));

    app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/login' }),
      function (req, res) {
          console.log(req.user);
          res.redirect('/dashboard');
      });

    app.get('/logout', function (req, res) {
        console.log('logging out');
        req.logout();
        res.redirect('/login');
    });
    /*End: authentication routes*/
    // sample api route
    app.get('/api/data', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        // use mongoose to get all nerds in the database
        req.session.collectionName = "SampleData";
        Subjects.find({}, { '_id': 0, 'TDate': 1, 'TV': 1, 'Newspaper': 1, 'Radio': 1, 'Sales': 1 }, function (err, subjectDetails) {
            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);
            res.json(subjectDetails); // return all nerds in JSON format
        });

    });

    app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(),
     function (req, res) {
         res.sendfile("./public/dashboard.html");
     });

    app.get('/api/modeldata', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        // use mongoose to get all nerds in the database
        Models.find({ 'isActive': 'YES' }, { 'summary': 1, 'modelResult': 1 }, function (err, modelDetails) {
            // if there is an error retrieving, send the error.
            // nothing after res.send(err) will execute
            if (err)
                res.send(err);
            res.json(modelDetails); // return all nerds in JSON format
        }); //.sort({_id:-1}).limit(1)
    });

    /*=========Upload File route Starts*/
    app.post("/uploadfile", connectEnsureLogin.ensureLoggedIn(), upload.single('uploadfile'), function (req, res, next) {

        var dataArray = [];
        var _headerData = {};
        var _index = 0;
        //var url = 'mongodb://localhost:27017';
        req.session.collectionName = req.body.Collection == "" ? "MMMDb" : req.body.Collection;
        console.log("req.session.collectionName=>" + req.session.collectionName);
        MongoClient.connect(connectionCsvCollection, function (err, db) {
            console.log("DB is connect");
            //var cursor = db.collection(collectionName).find();
            //var deleteStatus=db.collection(req.session.collectionName).remove();
            //console.log(deleteStatus);
            //var _file = req.files.uploadfile;
            var rs = fs.createReadStream(req.file.path);
            var result = {};
            converter.on("end_parsed", function (jsonObj) {
                //console.log(jsonObj);
                db.collection(req.session.collectionName).remove();
                for (var newRowData in jsonObj) {
                    //console.log(typeof (jsonObj[newRowData].school_zip));
                    db.collection(req.session.collectionName).insert(jsonObj[newRowData]);
                }
                db.close();
                res.writeHead(302, {
                    'Location': '/' //http://localhost:8088'
                    // // //add other headers here...
                });
                fs.unlink(req.file.path, function (err) {
                    if (err) return console.log(err);
                    console.log('file deleted successfully');
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
    /*=========Upload File route Ends===========*/


    /*=========Data Grid routes starts=========*/
    app.get("/api/tabledata", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        var collectionName = "SampleData";
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
    app.post("/api/editTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In editTableData : " + JSON.stringify(req.body));
        req.session.collectionName = "SampleData";
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
    app.post("/api/deleteTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In deleteTableData : " + JSON.stringify(req.body));
        req.session.collectionName = "SampleData";
        console.log("req.session.collectionName=>" + req.session.collectionName);
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
        else {
            res.send("no colleciton was found");
        }
    });
    app.post("/api/insertTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In insertTableData : " + JSON.stringify(req.body));
        req.session.collectionName = "SampleData";
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
    /*=========Data Grid routes ends===========*/
}
