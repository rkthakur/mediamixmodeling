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
                "TWITTER_APP_ID": "rAtYKcUQBYXAKZdokUzKEfj15",
				"TWITTER_APP_SECRET": "qxyi62tdj4eLIFS0Ow2snSnWo7tV9p2QDEqBcRCVkTmmO7a090",
				"CallbackURL": "http://dev-romimate.com:8088/login/twitter/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "TWITTER_APP_ID": "Mg3RgmWRGjjvFkgE1O8XGHiml",
				"TWITTER_APP_SECRET": "3X7k8NrPI3s7PK6j9MKWIpmphOMBCjwdzRnWYUMvep6IDoHeG2",
				"CallbackURL": "http://www.romimate.com/login/twitter/return",
				"ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
	var _linkedin = function () {
        var _config = {
            development: {
                "LINKEDIN_APP_ID": "814z3eizcb1qww",
				"LINKEDIN_APP_SECRET": "oF3LUQWvsPdpzA5s",
				"CallbackURL": "http://dev-romimate.com:8088/login/linkedin/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "LINKEDIN_APP_ID": "814z3eizcb1qww",
				"LINKEDIN_APP_SECRET": "oF3LUQWvsPdpzA5s",
				"CallbackURL": "http://www.romimate.com/login/linkedin/return",
				"ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
	var _google = function () {
        var _config = {
            development: {
                "GOOGLE_APP_ID": "776082858590-p7dlmdhlh2rusi8fg61dbfhatqfp71ca.apps.googleusercontent.com",
				"GOOGLE_APP_SECRET": "ozMDrv1ZvyIJAUi6mvA8xObw",
				"CallbackURL": "http://dev-romimate.com:8088/login/google/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
               "GOOGLE_APP_ID": "776082858590-p7dlmdhlh2rusi8fg61dbfhatqfp71ca.apps.googleusercontent.com",
				"GOOGLE_APP_SECRET": "ozMDrv1ZvyIJAUi6mvA8xObw",
				"CallbackURL": "http://www.romimate.com/login/google/return",
				"ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
    that.facebook = _facebook();
    that.twitter = _twitter();
	that.linkedin = _linkedin();
	that.google = _google();
    return that;
};

