

var tableData = function () {
    var that = {};
    var _editTableData = function (item) {
        $.ajax({
            url: "/api/editTableData",
            type: "post",
            data: item,
            success: function (res) {
                console.log(res);
            },
            error: function (err, xhr) {
                console.log(err);
            }
        });
    };
    var _insertTableData = function (item) {
        $.ajax({
            url: "/api/insertTableData",
            type: "post",
            data: item,
            success: function (res) {
                console.log(res);
            },
            error: function (err, xhr) {
                console.log(err);
            }
        });
    };
    var _deleteTableData = function (item) {
        $.ajax({
            url: "/api/deleteTableData",
            type: "post",
            data: item,
            success: function (res) {
                console.log(res);
            },
            error: function (err, xhr) {
                console.log(err);
            }
        });
    };
    var _getTableField = function (data) {
        debugger;
        var schemaConst = function () {
            return { name: "", type: "text", width: 150, validate: "required" };
        };

        var sampleRow = data[0];
        var schema = {};
        var fieldsArray = [];
        for (var fieldName in sampleRow) {
            schema = new schemaConst();
            schema.name = fieldName;
            if (schema.name == "_id") { delete schema.validate; schema.visible = false; }
            fieldsArray.push(schema)
        }
        fieldsArray.push({ type: "control" });
        return fieldsArray;
    };
    var _loadTable = function () {
        $.ajax({
            url: "/api/tabledata",
            type: "get",
            success: function (result) {
                $("#jsGrid").jsGrid({
                    width: "100%",
                    height: "400px",
                    paging: true,
                    inserting: true,
                    editing: true,
                    sorting: true,
                    paging: true,
                    data: result,
                    fields: _getTableField(result),
                    onItemInserted: function (args) {
                        debugger;
                        // cancel insertion of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _insertTableData(args.item);
                    },
                    onItemUpdating: function (args) {
                        debugger;
                        // cancel update of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _editTableData(args.item);
                    },
                    onItemDeleted: function (args) {
                        debugger;
                        // cancel insertion of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _deleteTableData(args.item);
                    },
                });
            },
            error: function (err, xhr) { }
        });
    };
    _loadTable();
};
tableData();