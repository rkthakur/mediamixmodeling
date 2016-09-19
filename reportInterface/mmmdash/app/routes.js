var regressionAnalysisModel, mixModellingModel;

var mongodb = require('mongodb');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var request = require('request');
var connectEnsureLogin = require('connect-ensure-login');
var oAuthConfigs = require('../config/social-configs-dev');
var wsConfig = process.env.NODE_ENV ? ((process.env.NODE_ENV).toUpperCase() == 'DEVELOPMENT' ? require("../config/WsConfig")("DEV") : require("../config/WsConfig")("PROD")) : require("../config/WsConfig")("DEV");
console.log(wsConfig);
if (process.env.NODE_ENV) {
    if ((process.env.NODE_ENV).toUpperCase() == 'DEVELOPMENT')
        var oAuthConfigs = require('../config/social-configs-dev');
    else if ((process.env.NODE_ENV).toUpperCase() == 'PRODUCTION')
        var oAuthConfigs = require('../config/social-configs-prod');
}

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
    var wsDataDirty = require("./webworker")(app);

    /* GET home page. */
    app.get('/', function (req, res, next) {
        res.render('index', { title: 'ROIMmate-Marketing Investment Measurement', user: req.user });
    });

    app.get('/login', function (req, res) {
        if (!req.isAuthenticated()) {
            res.sendfile('./public/login.html');
        } else {
            res.sendfile('./public/index1.html');
        }
        //res.render('login');
    });

    app.get('/login/facebook', passport.authenticate('facebook'));

    app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/' }),
      function (req, res) {
          MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
          res.redirect("/");
      });

    app.get('/logout', function (req, res) {
        console.log('logging out');
        req.logout();
        res.redirect('/');
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
        //res.sendfile("./public/dashboard.html");
        res.sendfile("./public/index1.html");
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
                collection.remove({}, function (err, removed) { MMMDash.IsDataDirty = true; });
            });
            for (var newRowData in jsonObj) {
                var _data = jsonObj[newRowData];
                _data._id = String(new ObjectId());
                console.log(_data);
                MMMDash.db.connectionObj.db.collection(MMMDash.userDataCollectionName).insert(_data, function (err, inserted) {
                    console.log("Data inserted " + JSON.stringify(inserted));
                    console.log("Data inserted error " + err);
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
        MMMDash.Is
        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).update({ "_id": _id }, req.body, function (err, result) {
            MMMDash.IsDataDirty = true;
            res.send(result);
        });
    });
    app.post("/api/deleteTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In deleteTableData : " + JSON.stringify(req.body));
        var _id = req.body._id;
        delete req.body._id;
        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).delete({ "_id": new ObjectId(_id) }, function (err, result) {
            MMMDash.IsDataDirty = true;
            console.log("deleteTableData=> " + err ? err : result);
            res.send(result);
        });
    });
    app.post("/api/insertTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        console.log("In insertTableData : " + JSON.stringify(req.body));
        var _data = req.body;
        _data._id = String(new ObjectId());

        MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).insert(_data, function (err, result) {
            MMMDash.IsDataDirty = true;
            console.log("insertTableData=> " + err ? err : result);
            res.send(result);
        });
    });
    /*=========Data Grid routes ends===========*/

    app.post("/api/doDataRefresh", function (req, res) {
        MMMDash.IsDataDirty = false;
        var http = require('http');
        request(wsConfig.RE_WS.getConfig(), function (error, response, body) {
            if (error) {
                console.log(error)
            }
            res.send({ "error": error, "response": response, "body": body });
        })
    });

}
