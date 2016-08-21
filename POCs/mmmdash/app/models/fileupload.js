var express = require('express');
var fileUpload = require('express-fileupload');
var app = express();

// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    sampleFile = req.files.sampleFile;
    sampleFile.mv('/tmp/myfile.txt', function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send('File uploaded!');
        }
    });
});
