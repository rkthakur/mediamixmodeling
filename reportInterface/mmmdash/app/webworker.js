module.exports = function (app) {
    app.ws('/dataAnalysis', function (ws, req) {
        ws.on('message', function (msg) {
            //console.log(JSON.stringify({ "IsDataDirty": MMMDash.IsDataDirty }));
            ws.send(JSON.stringify({ "IsDataDirty": MMMDash.IsDataDirty }));
        });
        ws.on("open", function (ws, req) {
            console.log("WS opened:=>", ws);
        });
        ws.on("error", function (err) {
            console.log(err);
        });
        //console.log('socket', ws);
    });
}
