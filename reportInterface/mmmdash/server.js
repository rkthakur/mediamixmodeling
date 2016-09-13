(function () {
    MMMDash = {} //defining app namespace

    //var bson = require('./node_modules/mongodb/node_modules/mongodb-core/node_modules/bson/lib/bson')
    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');
    var session = require("express-session");
    db = require('./config/db');
    var fs = require("fs");
    var multer = require("multer");
    var Converter = require("csvtojson").Converter;
    var port = process.env.PORT || 8088;
    app.use(bodyParser.json()); // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
    app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
    app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
    app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
    app.use(require('morgan')('combined'));

    converter = new Converter({});
    upload = multer({ dest: 'uploads/', rename: function (fieldname, filename) { return "temp"; } });
    
    require('./app/routes')(app, MMMDash); // pass our application into our routes
    // start app ===============================================
    app.listen(port);
    console.log('Magic happens on port ' + port);
    exports = module.exports = app;
})({});


