var path = require('path');
var Background = require('../lib/Background.js');

var background = new Background({
    daemonRestartCron: '*/10 * * * * *'
});

background.addCron([
    [path.join(__dirname, './cron_test.js')]
], "*/10 * * * * *");


background.addDaemon(path.join(__dirname, './daemon_test.js'));

background.start();