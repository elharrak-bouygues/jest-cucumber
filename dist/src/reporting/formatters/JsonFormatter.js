"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cucumber_1 = require("cucumber");
var FormatterDiskLogger_1 = require("./formatter-loggers/FormatterDiskLogger");
var JsonFormatter = /** @class */ (function () {
    function JsonFormatter(reportEventGenerator, options) {
        var outputPath = './report.json';
        if (options.path) {
            outputPath = options.path;
        }
        var formatterLogger = new FormatterDiskLogger_1.FormatterDiskLogger(outputPath);
        var cucumberJsonFormatter = new cucumber_1.JsonFormatter({
            eventDataCollector: reportEventGenerator.eventDataCollector,
            eventBroadcaster: reportEventGenerator.eventBroadcaster,
            log: formatterLogger.log.bind(formatterLogger),
        });
        reportEventGenerator.eventBroadcaster.addListener('test-run-finished', function () {
            formatterLogger.save();
        });
    }
    return JsonFormatter;
}());
exports.JsonFormatter = JsonFormatter;
//# sourceMappingURL=JsonFormatter.js.map