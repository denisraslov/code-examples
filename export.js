//The part from the main application module that includes methods for data export in several types.

{
    //get stored data about exports from localStorage
    getExports: function() {
        return JSON.parse(localStorage.getItem('exports')) || [];
    },

    //find index of the data about export with the type
    getExportIndex: function(type) {
        var app = this,
            exports = app.getExports(),
            result;

        _.forEach(exports, function(exportData, index) {
            if (exportData.type == type) {
                result = index;
            }
        });

        return result != undefined ? result : -1;
    },

    //get the data about export with the type
    getExportInfo: function(type) {
        var app = this,
            exports = app.getExports(),
            index = app.getExportIndex(type);

        return index != -1
            ? exports[index].info
            : null;
    },

    //remove the data about exports from localStorage
    clearExportInfo: function(type) {
        var app = this,
            exports = app.getExports(),
            index = app.getExportIndex(type);

        if (index != -1) {
            exports.splice(index, 1);
            localStorage.setItem('exports', JSON.stringify(exports));
        }
    },

    //init the export process
    startExport: function(type) {
        var app = this,
            model,
            startTime = moment(PAGE.params.startDate, 'DD.MM.YYYY').startOf('day').format('X'),
            endTime = moment(PAGE.params.endDate, 'DD.MM.YYYY').endOf('day').format('X');

        model = app.initExportModel(type, startTime, endTime);

        model.save().then(function() {
            var info,
                exports = app.getExports();

            info = {
                id: model.id,
                requestTime: moment().format('X'),
                startTime: startTime,
                endTime: endTime
            };

            exports.push({ type: type, info: info });
            localStorage.setItem('exports', JSON.stringify(exports));

            PAGE.render();
            app.prepareExportFetching(type);
        });
    },

    //init the export model
    initExportModel: function(type, startTime, endTime) {
        var app = this,
            ExportTask = require('resources/export/model'),
            model;

        app.models[app.getExportModelName(type)] = model = new ExportTask;

        model.type = type;
        model.set({
            format: type,
            start: Number(startTime),
            end: Number(endTime)
        });

        return model;
    },

    //init the long polling of the data about export state
    prepareExportFetching: function(type) {
        var app = this,
            modelName = app.getExportModelName(type),
            model = app.models[modelName],
            status = model.get('status'),
            intervalName = app.getExportIntervalName(type);

        if (status != 'done' && status != 'error') {

            app[intervalName] = setInterval(function () {
                model.fetch().then(function () {
                    var exportPanel = PAGE.$('.exportPanel[data-type="' + type + '"]')[0].block,
                        status = model.get('status');

                    exportPanel.model = model;
                    exportPanel.render();

                    if (status == 'done' || status == 'error') {
                        clearInterval(app[intervalName]);
                    }
                });
            }, app.EXPORT_FETCHING_TIMEOUT);
        }
    },

    //cancel the export process
    cancelExport: function(type) {
        var app = this,
            salesExportDropdownEl = PAGE.$('.dropdown_salesExport')[0];

        clearInterval(app[app.getExportIntervalName(type)]);
        app.clearExportInfo(type);
        PAGE.$('.exportPanel[data-type="' + type + '"]')[0].block.remove();
        salesExportDropdownEl && salesExportDropdownEl.block.render();

        $('.content').css('height', 'calc(100% - 73px - ' + (app.getExports().length * 120) + 'px');
    },

    //some utility stuff

    getExportModelName: function(type) {
        return 'export_' + type;
    },
    getExportIntervalName: function(type) {
        var app = this;

        return app.getExportModelName(type) + '_fetchInterval';
    },
    EXPORT_FETCHING_TIMEOUT: 5000
}