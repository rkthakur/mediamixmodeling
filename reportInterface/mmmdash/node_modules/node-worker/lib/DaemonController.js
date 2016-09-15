
var Class = require('better-js-class');
var $U = require('underscore');
var spawn = require('child_process').spawn;
var util = require('util');
var CronJob = require('cron').CronJob;

var Child = Class({
    _init: function(cfg){
        this._script = cfg.script;
        this._scheduleRule = cfg.scheduleRule;
        this._signal = cfg.signal;
        this._handle = null;
        this._cronJob = null;
    },

    _cron: function(initial){
        var me = this;
        return function(){
            if(!initial){
                //kill child process first if this is a scheduled spawn
                console.log('sending child process, pid [%d], signal: [%s]', me._handle.pid, me._signal);
                me._handle.kill(me._signal);
            }

            me._start();
        }
    },

    _start: function() {
        var me = this;

        //spawn new child process, register exit/error event handler, schedule cron job to drain this child
        me._handle = spawn('node', [me._script], {
            stdio: 'inherit',
            env: process.env
        });
        console.log('child process spawned, pid: [%d]', me._handle.pid);
        var pid = me._handle.pid;

        // setup listeners for each child process
        me._handle.on('exit', function (code, signal) {
            console.log('child process terminated, code: [%d]', code);
            if (pid == me._handle.pid) {
                me._start();
            }
        });
        me._handle.on('error', function (err) {
            console.log('child process emits an error: %s', util.inspect(err));
            if (pid == me._handle.pid) {
                me._start();
            }
        });
    },

    _recur: function() {
        var me = this;

        me._cronJob = new CronJob(
            me._scheduleRule,
            function() {
                console.log('sending child process, pid [%d], signal: [%s]', me._handle.pid, me._signal);
                me._handle.kill(me._signal);
                me._start();
            },
            null,
            true
        );
        me._cronJob.start();
    },

    start: function() {
        var me = this;
        me._start();
        me._recur();
    },

    stop: function(){
        this._cronJob.stop();
        this._handle.kill(this._signal);
    }
});

module.exports = function () {
    var cls = Class({
        _init: function (cfg) {
            var me = this;
            this._signal = cfg.signal || 'SIGTERM';
            this._children = {};
            process.on('exit', function(){
                me.stop();
            });
        },

        add: function (name, childScript, numChildren, cronScheduleString) {
            var children = [];
            for(var i = 0; i<numChildren; i++){
                children.push(new Child({
                    script: childScript,
                    scheduleRule: cronScheduleString,
                    signal: this._signal
                }));
            }
            if (!this._children[name]) {
                this._children[name] = [];
            }
            this._children[name] = this._children[name].concat(children);
        },

        _start: function(name){
            var children = this._children[name];
            if(children){
                for(var i = 0; i<children.length; i++){
                    children[i].start();
                }
            }
        },

        _stop: function(name){
            var children = this._children[name];
            if(children){
                for(var i = 0; i<children.length; i++){
                    children[i].stop();
                }
            }
        },

        start: function () {
            var me = this;
            if(arguments.length == 1){
                var name = arguments[0];
                this._start(name);
            }else{
                //start'em all
                $U.each(this._children, function(children, name){
                    me._start(name);
                });
            }
        },

        stop: function(){
            var me = this;
            if(arguments.length == 1){
                var name = arguments[0];
                this._stop(name);
            }else{
                //start'em all
                $U.each(this._children, function(children, name){
                    me._stop(name);
                });
            }
        }
    });

    return cls;
}();