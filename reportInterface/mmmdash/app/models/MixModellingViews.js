var mongoose = require('mongoose');
var Schema = mongoose.Schema;
userDataCollection = mongoose.model(MMMDash.userDataCollectionName , new Schema({
    "TDate": String,
    "TV": Number,
    "Radio": Number,
    "Newspaper": Number,
    "Sales": Number
}));
console.log("userDataCollection=>" + userDataCollection);
module.exports = userDataCollection
