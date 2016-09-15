module.exports = function (app) {
    app.ws('/dataAnalysis', function (ws, req) {
        ws.on('message', function (msg) {
            console.log(msg);
        });
        console.log('socket', req.testing);
    });
}