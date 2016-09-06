

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
        //debugger;
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
                    height: "70%",
                    width: "100%",
                    filtering: true,
                    inserting: true,
                    editing: true,
                    sorting: true,
                    paging: true,
                    autoload: true,
                    pageSize: 10,
                    pageButtonCount: 5,
                    deleteConfirm: "Do you really want to delete this record?",
                    data: result,
                    fields: _getTableField(result),
                    onItemInserted: function (args) {
                        //debugger;
                        // cancel insertion of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _insertTableData(args.item);
                    },
                    onItemUpdating: function (args) {
                        //debugger;
                        // cancel update of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _editTableData(args.item);
                    },
                    onItemDeleted: function (args) {
                        //debugger;
                        // cancel insertion of the item with empty 'name' field
                        if (args.item.name === "") {
                            args.cancel = true;
                            alert("Specify the name of the item!");
                        }
                        _deleteTableData(args.item);
                    }/*,
                    fields: [
                        { name: "TDate", type: "date", width: 50, title: "Date" },
                        { name: "TV", type: "number", width: 50, filtering: false },
                        { name: "Radio", type: "number", width: 50 },
                        { name: "Newspaper", type: "number", width: 50 },
                        { name: "Sales", type: "number", width: 50 }
                    ]*/
                });
            },
            error: function (err, xhr) { }
        });
    };
    var _loadMixModelConsoleData = function () {
        $.ajax({
            url: "/api/modeldata",
            type: "GET",
            success: function (res) {
                debugger;
                var dataRow = $("#mix-model-console tr td[data-attr-data-name]").each(function (index, ele) {
                    var attrName = $(ele).attr("data-attr-data-name");
                    var attrValue = res[0].summary[0].head[attrName];
                    if (attrValue) {
                        if ($(ele).attr("data-value") == "date") {
                            attrValue = new Date(attrValue);
                            attrValue = attrValue.toDateString();
                        } else if ($(ele).attr("data-value") == "time") {
                            attrValue = new Date(attrValue);
                            attrValue = attrValue.toGMTString().split(attrValue.getFullYear())[1].replace(" ", "");
                        }

                        $(ele).html(attrValue);
                    }
                });

            },
            error: function (err, xhr) {
                console.log("error on _loadMixModelConsoleData");
            }
        });
    };
    var _init = function (param) {
        _loadTable();
        _loadMixModelConsoleData();
    }
    that.init = _init;
    return that;
};
var objTableData = new tableData();
objTableData.init();