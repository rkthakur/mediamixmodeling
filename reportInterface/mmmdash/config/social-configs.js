module.exports = function (env) {
    var that = {};
    var _facebook = function () {
        var _config = {
            development: {
                "FACEBOOK_APP_ID": "1646035832393408",
                "FACEBOOK_APP_SECRET": "fd3eca55d01dea99251447fbb7e2ba87",
                "CallbackURL": "http://dev-romimate.com:8088/login/facebook/return",
                "ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "FACEBOOK_APP_ID": "1643209252676066",
                "FACEBOOK_APP_SECRET": "6443c4ee56cd4745a48714cfab69527d",
                "CallbackURL": "http://www.romimate.com/login/facebook/return",
                "ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
    var _twitter = function () {
        var _config = {
            development: {
                "ConsumerKey": "",
                "ConsumerSecret": "",
                "CallbackURL": ""
            },
            production: {
                "ConsumerKey": "",
                "ConsumerSecret": "",
                "CallbackURL": ""
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
    that.facebook = _facebook();
    that.twitter = _twitter();
    return that;
};

