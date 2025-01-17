"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cucumber_1 = require("cucumber");
// tslint:disable-next-line:no-var-requires
var getColorFns = require('cucumber/lib/formatter/get_color_fns').default;
var FormatterConsoleLogger_1 = require("./formatter-loggers/FormatterConsoleLogger");
var SummaryFormatter = /** @class */ (function () {
    function SummaryFormatter(reportEventGenerator) {
        var formatterLogger = new FormatterConsoleLogger_1.FormatterConsoleLogger();
        var summaryFormatter = new cucumber_1.SummaryFormatter({
            eventDataCollector: reportEventGenerator.eventDataCollector,
            eventBroadcaster: reportEventGenerator.eventBroadcaster,
            log: formatterLogger.log.bind(formatterLogger),
            colorFns: getColorFns(true),
        });
    }
    return SummaryFormatter;
}());
exports.SummaryFormatter = SummaryFormatter;
//# sourceMappingURL=SummaryFormatter.js.map