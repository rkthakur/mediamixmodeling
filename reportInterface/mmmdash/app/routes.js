var regressionAnalysisModel, mixModellingModel;
var session = require("express-session");
var Converter = require("csvtojson").Converter;
var mongodb = require('mongodb');
var passport = require('passport');
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth20').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;
var linkedInStrategy = require('passport-linkedin').Strategy;
var request = require('request');
var connectEnsureLogin = require('connect-ensure-login');
var wsConfig = process.env.NODE_ENV ? ((process.env.NODE_ENV).toUpperCase() == 'DEVELOPMENT' ? require("../config/WsConfig")("DEV") : require("../config/WsConfig")("PROD")) : require("../config/WsConfig")("DEV");
var oAuthConfigs = process.env.NODE_ENV ? ((process.env.NODE_ENV).toUpperCase() == 'DEVELOPMENT' ? require('../config/social-configs')("DEV") : require('../config/social-configs')("PROD")) : require('../config/social-configs')("DEV");
var userDataRepo = require("./MMMDashBL/UserDataRepository");

passport.use(new facebookStrategy({
    clientID: oAuthConfigs.facebook.FACEBOOK_APP_ID,
    clientSecret: oAuthConfigs.facebook.FACEBOOK_APP_SECRET,
    callbackURL: oAuthConfigs.facebook.CallbackURL,
    profileFields: oAuthConfigs.facebook.ProfileFields
}, function (accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
}));
passport.use(new googleStrategy({
	  clientID: oAuthConfigs.google.GOOGLE_APP_ID,
    clientSecret: oAuthConfigs.google.GOOGLE_APP_SECRET,
    callbackURL: oAuthConfigs.google.CallbackURL
  },
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));
passport.use(new twitterStrategy({
    consumerKey:  oAuthConfigs.twitter.TWITTER_APP_ID,
    consumerSecret: oAuthConfigs.twitter.TWITTER_APP_SECRET,
    callbackURL: oAuthConfigs.twitter.CallbackURL
  },
  function(token, tokenSecret, profile, cb) {
      return cb(null, profile);
  }
));
passport.use(new linkedInStrategy({
    consumerKey: oAuthConfigs.linkedin.LINKEDIN_APP_ID,
    consumerSecret: oAuthConfigs.linkedin.LINKEDIN_APP_SECRET,
    callbackURL: oAuthConfigs.linkedin.CallbackURL
  },
  function(token, tokenSecret, profile, done) {
      return done(null,profile);
  }
));
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
        res.redirect("/#dashboard");
        //res.render('login');
    });

    app.get('/login/facebook', passport.authenticate('facebook'));

    app.get('/login/facebook/return', passport.authenticate('facebook', { failureRedirect: '/' }),
      function (req, res) {
          MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash,req);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
          res.redirect("/#dashboard");
      });
	app.get('/login/google', passport.authenticate('google', { scope: ['profile'] }));

	  app.get('/login/google/return', passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
	   MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash,req);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
    // Successful authentication, redirect home.

    res.redirect('/#dashboard');
  });

  app.get('/login/twitter',passport.authenticate('twitter'));

app.get('/login/twitter/return', passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
	   MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash,req);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
    // Successful authentication, redirect home.
    res.redirect('/#dashboard');
  });
   app.get('/auth/linkedin',passport.authenticate('linkedin'));
   app.get('/login/linkedin/return', passport.authenticate('linkedin', { failureRedirect: '/' }),
  function(req, res) {
	   MMMDash.user = req.user;
          var _userRepo = new userDataRepo(MMMDash,req);
          regressionAnalysisModel = require('./models/RegressionAnalysisViews');
          mixModellingModel = require('./models/MixModellingViews');
    // Successful authentication, redirect home.
    res.redirect('/#dashboard');
  });
    app.get('/logout', function (req, res) {
        //console.log('logging out');
        req.logout();
        res.redirect('/#page-top');
    });
    /*End: authentication routes*/
    // sample api route
    app.get('/api/data', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        //
        var cursor = MMMDash.db.connectionObj.db.collection(req.session.passport.user.id + "_Data").find({}, { '_id': 0, 'TDate': 1, 'TV': 1, 'Newspaper': 1, 'Radio': 1, 'Sales': 1 });
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
        res.redirect("/#dashboard");
    });

    app.get('/api/modeldata', connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        // use mongoose to get all nerds in the database
        var cursor = MMMDash.db.connectionObj.db.collection(req.session.passport.user.id + "_MixModel").find({"isActive" : "YES"});
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
      console.log("Upload called");
        var dataArray = [];
        var _headerData = {};
        var _index = 0;
        var rs = fs.createReadStream(req.file.path);
        console.log("Upload called after fs read");
        var result = {};
        converter = new Converter({});
        converter.on("end_parsed", function (jsonObj) {
            MMMDash.db.connectionObj.db.collection(req.session.passport.user.id + "_Data", function (err, collection) {
                collection.remove({}, function (err, removed) {
                  if(err) console.log("collection remove error"+err);
                  console.log("collection remove called");
                  MMMDash.IsDataDirty = true;
                });
            });
            for (var newRowData in jsonObj) {
                var _data = jsonObj[newRowData];
                _data._id = String(new ObjectId());
                //console.log(_data);
                MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").insert(_data, function (err, inserted) {
                  console.log("Data inserted " + JSON.stringify(inserted));
                    //console.log("Data inserted error " + err);
                });
            }
            res.writeHead(301, { 'Location': '/#dashboard' });
            fs.unlink(req.file.path, function (err) {
                if (err) return console.log(err);
                //console.log('file deleted successfully');
            });
            console.log('end_parsed done');
            res.end();
        });

        //record_parsed will be emitted each time a row has been parsed.
        converter.on("record_parsed", function (resultRow, rawRow, rowIndex) {
          console.log('inside record_parsed ');
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
        var cursor = MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").find();
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
        //console.log("In editTableData : " + JSON.stringify(req.body));
        var _id = req.body._id;
        delete req.body._id;
        var _param = { "TDate": null, "TV": null, "Radio": null, "Newspaper": null, "Sales": null };
        _param.TDate = req.body.TDate;
        _param.Newspaper = (isNaN(parseFloat(req.body.Newspaper)) ? 0 : parseFloat(req.body.Newspaper));
        _param.Radio = (isNaN(parseFloat(req.body.Radio)) ? 0 : parseFloat(req.body.Radio));
        _param.TV = (isNaN(parseFloat(req.body.TV)) ? 0 : parseFloat(req.body.TV));
        _param.Sales = (isNaN(parseFloat(req.body.Sales)) ? 0 : parseFloat(req.body.Sales));

        //MMMDash.Is
        MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").update({ "_id": _id }, _param, function (err, result) {
			MMMDash.IsDataDirty = true;
            if (err) {console.log("editTableData : "+err);res.send(500);}
			else{res.send(200);}
        });
    });
    app.post("/api/deleteTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
        //console.log("In deleteTableData : " + JSON.stringify(req.body));
        var _id = req.body._id;
        delete req.body._id;
        MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").remove({ "_id": _id }, function (err, result) {
        MMMDash.IsDataDirty = true;
        if (err) {console.log("deleteTableData : "+err);res.send(500);}
			else{res.send(200);}
        });
    });
    app.post("/api/insertTableData", connectEnsureLogin.ensureLoggedIn(), function (req, res) {
      //  console.log("In insertTableData : " + JSON.stringify(req.body));
        var _data = req.body;
        _data._id = String(new ObjectId());

        MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").insert(_data, function (err, result) {
            MMMDash.IsDataDirty = true;
            //console.log("insertTableData=> " + err ? err : result);
            res.send(result);
        });
    });
    /*=========Data Grid routes ends===========*/

    app.post("/api/doDataRefresh", function (req, res) {

        requestURL=wsConfig.RE_WS.getConfig()+"?uid="+req.session.passport.user.id ;
        //console.log(requestURL)
        request(requestURL, function (error, response, body) {
            MMMDash.IsDataDirty = false;
            //console.log("doDataRefresh isSuccessful=>", response);
            if (response.statusCode != 200) {
              console.log(error);
              MMMDash.IsDataDirty = true;
              res.statusCode = 503;
            }
            res.send({ "body": body });
        })
    });

}
