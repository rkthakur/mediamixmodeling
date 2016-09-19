(function () {
    var dataWs = new WebSocket("ws://www.dev-romimate.com:8088/dataAnalysis");
    dataWs.onclose = function (event) {
        console.log(event);
    };
    dataWs.onerror = function (event) {
        console.log(event);
    };
    dataWs.onmessage = function (event) {
        //console.log(event);
        IsDataDirty = JSON.parse(event.data).IsDataDirty;
        $(document).trigger("dataValidation", event.data);
        if (IsDataDirty) {
            $("#data-validation-notification").slideDown(500);
        }
        else {
            $("#data-validation-notification").slideUp(0);
        }
    };
    dataWs.onopen = function (event) {
        console.log(event);
    };
    setInterval(function () {
        dataWs.send("Ping-" + (new Date()).getMilliseconds());

    }, 5000);

    $(document).ready(function () {
        $("#btnDataRefresh").bind("click", function () {
            $("#myModal").modal('show');
            $("#data-validation-notification").slideUp(0);
            setTimeout(function () {
                $.ajax({
                    url: "/api/doDataRefresh",
                    async: false,
                    type: "POST",
                    success: function (res) {
                        alert("Data refreshed successful");
                        $("#myModal").modal('hide');
                        window.location.reload(true);
                    },
                    error: function (err) {
                        alert("Data couldn't be refreshed!");
                    }
                });
            }, 1000)

        });
    });

})();
