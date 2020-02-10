module.exports = function (env) {
    var that = {};
    var _facebook = function () {
        var _config = {
            development: {
                "FACEBOOK_APP_ID": "<Please Add value>",
                "FACEBOOK_APP_SECRET": "<Please Add value>",
                "CallbackURL": "https://dev-romimate.com:8088/login/facebook/return",
                "ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "FACEBOOK_APP_ID": "<Please Add value>",
                "FACEBOOK_APP_SECRET": "<Please Add value>",
                "CallbackURL": "https://www.romimate.com/login/facebook/return",
                "ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
    var _twitter = function () {
        var _config = {
            development: {
                "TWITTER_APP_ID": "<Please Add value>",
				"TWITTER_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://dev-romimate.com:8088/login/twitter/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "TWITTER_APP_ID": "<Please Add value>",
				"TWITTER_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://www.romimate.com/login/twitter/return",
				"ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
	var _linkedin = function () {
        var _config = {
            development: {
                "LINKEDIN_APP_ID": "<Please Add value>",
				"LINKEDIN_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://dev-romimate.com:8088/login/linkedin/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
                "LINKEDIN_APP_ID": "<Please Add value>",
				"LINKEDIN_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://www.romimate.com/login/linkedin/return",
				"ProfileFields": ['id', 'displayName', 'email']
            }
        }
        return env === "DEV" ? _config.development : _config.production;
    }
	var _google = function () {
        var _config = {
            development: {
                "GOOGLE_APP_ID": "<Please Add value>",
				"GOOGLE_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://dev-romimate.com:8088/login/google/return",
				"ProfileFields": ['id', 'displayName', 'email']
            },
            production: {
               "GOOGLE_APP_ID": "<Please Add value>",
				"GOOGLE_APP_SECRET": "<Please Add value>",
				"CallbackURL": "https://www.romimate.com/login/google/return",
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

