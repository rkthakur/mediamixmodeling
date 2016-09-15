var Class = require('better-js-class');
var cps = require('cps');
var path = require('path');

var DaemonController = require('./DaemonController');
var CronController = require('./CronController');

var Background = Class({
    _init: function(cfg) {
        cfg = cfg || {};
        this._daemonRestartCron = cfg['daemonRestartCron'] || '0 0 */3 * * *';
        this._daemonController = new DaemonController({signal: 'SIGTERM'});
        this._cronController = new CronController();
    },

    addDaemon: function(path, numOfProcesses) {
        numOfProcesses = numOfProcesses == null? 1 : numOfProcesses;
        this._daemonController.add('daemons', path, numOfProcesses, this._daemonRestartCron);
    },

    addCron: function(batch, cron) {
        this._cronController.add(batch, cron);
    },

    start: function() {
        this._daemonController.start();
        this._cronController.start();
    }
});


module.exports = Background;