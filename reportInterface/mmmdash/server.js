// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

var session = require("express-session");
app.use(session({ secret: '1234567890QWERTY' }));
//csv = require("ya-csv");
var fs = require("fs");
var multer = require("multer");
var Converter = require("csvtojson").Converter;
converter = new Converter({});
upload = multer({
    dest: 'uploads/', rename: function (fieldname, filename) {
        console.log("sfasdsad " + fieldname);
        return "sdfsdfsd";
    }
});



// configuration ===========================================

// config files
var port = process.env.PORT || 8088; // set our port
var db = require('./config/db');
connectionCsvCollection = db.urlSubjectViews;

// connect to our mongoDB database (commented out after you enter in your own credentials)
connectionsubject = mongoose.createConnection(db.urlSubjectViews);



// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
