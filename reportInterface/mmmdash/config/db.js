var mongoose = require('mongoose');
var connString = 'mongodb://localhost:27017/mediamixmodeling';
module.exports = MMMDash.db = {
    connectionString: connString,
    connectionObj: mongoose.createConnection(connString),
    isUserDataCollectionExist: function (collectionName) {
        MMMDash.db.connectionObj.db.collectionNames(function (err, names) {
            return (names.indexOf(collectionName) > -1 ? true : false);
        });
    }
}
