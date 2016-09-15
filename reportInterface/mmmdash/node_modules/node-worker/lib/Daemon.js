var Class = require('better-js-class');
var cps = require('cps');

var Daemon = Class({
    _init: function() {
        var me = this;

        process.on('SIGTERM', function(){
            console.log('Process pid [%d] received SIGTERM, starts wrapping up...', process.pid);
            var cb = function(err, res) {
                console.log('Process pid [%d] is wrapped up and exits.', process.pid);
                process.exit(0);
            };
            me._stop(cb);
        });

        me._start();
    },

    _start: function() {
        throw new Error('Daemon._start is a virtual protected function that must be overridden.');
    },

    _stop: function(cb) {
        cb();
    }
});

module.exports = Daemon;