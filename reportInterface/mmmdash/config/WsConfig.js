MMMDash.WS = function (env) {
    var dev_url = "http://www.dev-romimate.com:8000/lm", prod_url = "http://www.romimate.com:8000/lm";

    var that = {};
    var _RE_WS = {};
    _RE_WS.getConfig = function () {
        return (env.toUpperCase() == 'DEV' ? dev_url : prod_url);
    }
    that.RE_WS = _RE_WS;
    return that;
};
module.exports = MMMDash.WS;
