var UserDataRepository = function (MMMDash,req) {
    if (MMMDash != null && typeof MMMDash == "object") {
        if (!MMMDash.hasOwnProperty("db")) { throw new Error("MMMDash object is empty, it suppose to contain db details"); }
        if (!MMMDash.hasOwnProperty("user")) { throw new Error("MMMDash object is empty, it suppose to contain user details"); }
        MMMDash.userDataCollectionName = req.session.passport.user.id + "_Data";
        MMMDash.userMixModelCollectionName = req.session.passport.user.id + "_MixModel";

        MMMDash.db.connectionObj.db.collectionNames(function (err, names) {
          MMMDash.db.connectionObj.collection('UserDataRepository').update({ "_id": req.session.passport.user.id }, req.session.passport.user, function (err, result) {
  		           if (err) {console.log("Error while user profile update : "+err);}
                 //console.log("Response of user profile update"+result);
                 if(result == 0)
                 {
                    MMMDash.db.connectionObj.collection('UserDataRepository').insert({ "_id": req.session.passport.user.id, "profile": req.session.passport.user}, function (err, result) {
                        if (err) {console.log("Error while user profile insert : "+err);}
                        //console.log("Response of user profile insert"+result);
                       });
                  }
                });

          var existsFlag = false;
            for (i=0; i < names.length;i++)
            {
              console.log(req.session.passport.user.id + "_Data" +" COL "+names[i].name);
              var colname=req.session.passport.user.id + "_Data";
              if (colname.localeCompare(names[i].name) == 0)
              {
                console.log(names[i].name+" Found!!");
                existsFlag = true;
                break;
              }
            }
            if(existsFlag == false)
            {
              MMMDash.db.connectionObj.db.createCollection(req.session.passport.user.id + "_Data", function (err, collection) {

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
                                        {'TDate' : '3/1/16','TV' : 2301, 'Radio' : 0,'Newspaper' : 1000, 'Sales' : 8500}
                ];
                  console.log("Collection Created 2 " + req.session.passport.user.id + "_Data");
                  MMMDash.db.connectionObj.collection(req.session.passport.user.id + "_Data").insert(placeholderRecord, function (err, result) {
                      if (err) console.log(err); //throw err;
                      console.log("Placeholder Record Added");
                  });

              });
            }
        });
    }
};

module.exports = UserDataRepository;
