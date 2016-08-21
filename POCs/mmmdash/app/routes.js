var Subjects = require('./models/SubjectViews');
var Models = require('./models/ModelViews');

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
 
 // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendfile('./public/login.html');
 });
}
