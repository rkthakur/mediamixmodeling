var Class = require('better-js-class');
var Daemon = require('../lib/Daemon');

var MyDaemon = Class(Daemon, {
    _start: function() {
        this._timer = setInterval(function() {
            console.log('daemon running', new Date());
        }, 1000);
    },

    _stop: function(cb) {
        setTimeout(function() {
            clearInterval(this._timer);
            console.log('get cleaned up');
            cb();
        }, 5000);
    }
});

new MyDaemon();

