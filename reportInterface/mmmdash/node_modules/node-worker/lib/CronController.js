var Class = require('better-js-class');
var cps = require('cps');
var $U = require('underscore');
var spawn = require('child_process').spawn;
var util = require('util');
var CronJob = require('cron').CronJob;

var CronController = Class({
    _init: function() {
        this._crons = [];
    },

    _runTask: function(task, cb) {
        var n = spawn('node', [task], {
            stdio: 'inherit',
            env: process.env
        });

        n.on('exit', function (code, signal) {
            console.log('Cron job process terminated with code: [%d]', code);
            cb();
        });

        n.on('error', function (err) {
            console.log('Cron job process emits an error: %s', util.inspect(err));
            cb();
        });

    },

    _runParallelTasks: function(tasks, cb) {
        var me = this;

        var procs = [];
        $U.each(tasks, function(task) {
            procs.push(function(cb) {
                me._runTask(task, cb);
            });
        });

        cps.parallel(procs, cb)
    },

    _runBatch: function(batch, cb) {
        var me = this;

        cps.peach(batch, function(tasks, cb) {
            me._runParallelTasks(tasks, cb);
        }, cb);
    },

    _runCron: function(cron, cb) {
        var me = this;

        if (cron['running']) {
            cb();
        } else {
            cron['running'] = true;
            cps.rescue({
                'try': function(cb) {
                    me._runBatch(cron['batch'], cb);
                },
                'finally': function(cb) {
                    cron['running'] = false;
                    cb();
                }
            }, cb);
        }
    },

    add: function(batch, cronTime) {
        this._crons.push({
            batch: batch,
            cronTime: cronTime
        });
    },


    start: function() {
        var me = this;

        var cb = function(err, res) {

        };

        $U.each(me._crons, function(cron) {
            var job = new CronJob({
                cronTime: cron['cronTime'],
                onTick: function() {
                    me._runCron(cron, cb);
                },
                start : true
            });
            cron['cronJob'] = job;
        });
    }
});

module.exports = CronController;
