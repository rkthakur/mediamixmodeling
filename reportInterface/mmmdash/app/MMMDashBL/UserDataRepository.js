var UserDataRepository = function (MMMDash) {
    
    if (MMMDash != null && typeof MMMDash == "object") {
        if (!MMMDash.hasOwnProperty("db")) { throw new Error("MMMDash object is empty, it suppose to contain db details"); }
        if (!MMMDash.hasOwnProperty("user")) { throw new Error("MMMDash object is empty, it suppose to contain user details"); }
        MMMDash.userDataCollectionName = MMMDash.user.id + "_Data";
        MMMDash.userMixModelCollectionName = MMMDash.user.id + "_MixModel";

        if (!MMMDash.db.isUserDataCollectionExist(MMMDash.userDataCollectionName)) {
            MMMDash.db.connectionObj.db.createCollection(MMMDash.userDataCollectionName, function (err, collection) {
                if (err) throw err;
                console.log("Collection Created " + MMMDash.userDataCollectionName);
            });
        }
        if (!MMMDash.db.isUserDataCollectionExist(MMMDash.userMixModelCollectionName)) {
            MMMDash.db.connectionObj.db.createCollection(MMMDash.userMixModelCollectionName, function (err, collection) {
                if (err) throw err;
                console.log("Collection Created " + MMMDash.userMixModelCollectionName);
            });
        }
    }
};

module.exports = UserDataRepository;