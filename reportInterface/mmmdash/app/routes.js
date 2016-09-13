var regressionAnalysisModel, mixModellingModel;

var mongodb = require('mongodb');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var connectEnsureLogin = require('connect-ensure-login');
var oAuthConfigs = require('../config/social-configs');
var userDataRepo = require("./MMMDashBL/UserDataRepository");

passport.use(new Strategy({
    clientID: oAuthConfigs.facebook.FACEBOOK_APP_ID,
    clientSecret: oAuthConfigs.facebook.FACEBOOK_APP_SECRET,
    callbackURL: oAuthConfigs.facebook.CallbackURL,
    profileFields: oAuthConfigs.facebook.ProfileFields
}, function (accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));

passport.serializeUser(function (user, cb) { cb(null, user); });
passport.deserializeUser(function (obj, cb) { cb(null, obj); });

var fs = require('fs');
var MongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectID;

module.exports = function (app, MMMDash) {
    // server routes ===========================================================   
    /*Start: authentication routes*/
    //app.use(AuthenticationMiddleware());
    app.use(passport.initialize());
    app.use(passport.session());
    app.get("/", function (req, res) {
        if (!req.isAuthenticated()) {
            console.log("User is not authenticated.");
            res.redirect("/login");
        } else {
            res.redirect("/dashbaord");
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
          MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
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
        //
        var cursor = MMMDash.db.connectionObj.db.collection(MMMDash.userDataCollectionName).find({}, { '_id': 0, 'TDate': 1, 'TV': 1, 'Newspaper': 1, 'Radio': 1, 'Sales': 1 });
        var dataArray = [];
        cursor.each(function (err, doc) {
            if (doc != null) {
                dataArray.push(doc);
            } else {
                res.send(dataArray);
            }
        });
    });

    app.get('/dashboard', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        res.sendfile("./public/dashboard.html");
    });

    app.get('/api/modeldata', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        // use mongoose to get all nerds in the database
        var cursor = MMMDash.db.connectionObj.db.collection(MMMDash.userMixModelCollectionName).find();
        var dataArray = [];
        cursor.each(function (err, doc) {
            if (doc != null) {
                dataArray.push(doc);
            } else {
                res.send(dataArray);
            }
        });
    });

    /*=========Upload File route Starts*/
    app.post("/uploadfile", connectEnsureLogin.ensureLoggedIn(), upload.single('uploadfile'), function (req, res, next) {

        var dataArray = [];
        var _headerData = {};
        var _index = 0;
        var rs = fs.createReadStream(req.file.path);
        var result = {};
        converter.on("end_parsed", function (jsonObj) {
            MMMDash.db.connectionObj.db.collection(MMMDash.userDataCollectionName, function (err, collection) {
                collection.remove({}, function (err, removed) { });
            });
            for (var newRowData in jsonObj) {
                //console.log(typeof (jsonObj[newRowData].school_zip));
                MMMDash.db.connectionObj.db.collection(MMMDash.userDataCollectionName).insert(jsonObj[newRowData], function (err, inserted) {
                    console.log("Data inserted " + inserted);
                });
            }
            res.writeHead(302, { 'Location': '/' });
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
        //});
    });
    /*=========Upload File route Ends===========*/

    /*=========Data Grid routes starts=========*/
    app.get("/api/tabledata", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        var cursor = MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).find();
        var dataArray = [];
        cursor.each(function (err, doc) {
            if (doc != null) {
                dataArray.push(doc);
            } else {
                res.send(dataArray);
            }
        });
    });
    app.post("/api/editTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In editTableData : " + JSON.stringify(req.body));
        var _id = req.body._id;
        delete req.body._id;
        console.log(req.body);
        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).update({ "_id": new ObjectId(_id) }, req.body, function (err, result) {
            res.send(result);
        });
    });
    app.post("/api/deleteTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In deleteTableData : " + JSON.stringify(req.body));
        var _id = req.body._id;
        delete req.body._id;
        console.log(req.body);
        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).deleteOne({ "_id": new ObjectId(_id) }, function (err, result) {
            res.send(result);
        });
    });
    app.post("/api/insertTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In insertTableData : " + JSON.stringify(req.body));
        req.session.collectionName = "SampleData";
        var _id = req.body._id;
        delete req.body._id;
        console.log(req.body);
        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).insertOne(req.body, function (err, result) {
            res.send(result);
        });
    });
    /*=========Data Grid routes ends===========*/
}
