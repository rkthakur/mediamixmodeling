var UserDataRepository = function (MMMDash) {

    if (MMMDash != null && typeof MMMDash == "object") {
        if (!MMMDash.hasOwnProperty("db")) { throw new Error("MMMDash object is empty, it suppose to contain db details"); }
        if (!MMMDash.hasOwnProperty("user")) { throw new Error("MMMDash object is empty, it suppose to contain user details"); }
        MMMDash.userDataCollectionName = MMMDash.user.id + "_Data";
        MMMDash.userMixModelCollectionName = MMMDash.user.id + "_MixModel";

        if (!MMMDash.db.isUserDataCollectionExist(MMMDash.userDataCollectionName)) {
            MMMDash.db.connectionObj.db.createCollection(MMMDash.userDataCollectionName, function (err, collection) {
                if (err) console.log(err);//throw err;

                var placeholderRecord=[{'TDate' : '4/1/15','TV' : 1000, 'Radio' : 0,'Newspaper' : 1000, 'Sales' : 8000},
                                      {'TDate' : '5/1/15','TV' : 500, 'Radio' : 700,'Newspaper' : 0, 'Sales' : 7500},
                                      {'TDate' : '6/1/15','TV' : 1250, 'Radio' : 500,'Newspaper' : 692, 'Sales' : 7700},
                                      {'TDate' : '7/1/15','TV' : 750, 'Radio' : 800,'Newspaper' : 1000, 'Sales' : 7500},
                                      {'TDate' : '8/1/15','TV' : 1000, 'Radio' : 378,'Newspaper' : 0, 'Sales' : 7800},
                                      {'TDate' : '9/1/15','TV' : 500, 'Radio' : 700,'Newspaper' : 1000, 'Sales' : 7700},
                                      {'TDate' : '10/1/15','TV' : 1200, 'Radio' : 378,'Newspaper' : 0, 'Sales' : 7800},
                                      {'TDate' : '11/1/15','TV' : 1000, 'Radio' : 0,'Newspaper' : 1000, 'Sales' : 7750},
                                      {'TDate' : '12/1/15','TV' : 600, 'Radio' : 800,'Newspaper' : 692, 'Sales' : 7000},
                                      {'TDate' : '1/1/16','TV' : 2000, 'Radio' : 0,'Newspaper' : 1000, 'Sales' : 8500},
                                      {'TDate' : '2/1/16','TV' : 1500, 'Radio' : 400,'Newspaper' : 0, 'Sales' : 8200},
                                      {'TDate' : '3/1/16','TV' : 2301, 'Radio' : 0,'Newspaper' : 1000, 'Sales' : 8500},
              ];
                console.log("Collection Created " + MMMDash.userDataCollectionName);
                MMMDash.db.connectionObj.collection(MMMDash.userDataCollectionName).insert(placeholderRecord, function (err, result) {
                    if (err) console.log(err); //throw err;
                    console.log("Placeholder Record Added");
                });

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
