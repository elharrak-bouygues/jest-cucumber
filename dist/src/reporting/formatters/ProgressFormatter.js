"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cucumber_1 = require("cucumber");
// tslint:disable-next-line:no-var-requires
var getColorFns = require('cucumber/lib/formatter/get_color_fns').default;
var FormatterConsoleLogger_1 = require("./formatter-loggers/FormatterConsoleLogger");
var ProgressFormatter = /** @class */ (function () {
    function ProgressFormatter(reportEventGenerator) {
        var formatterLogger = new FormatterConsoleLogger_1.FormatterConsoleLogger();
        formatterLogger.log('\n\n');
        var cucumberProgressFormatter = new cucumber_1.ProgressFormatter({
            eventDataCollector: reportEventGenerator.eventDataCollector,
            eventBroadcaster: reportEventGenerator.eventBroadcaster,
            log: formatterLogger.log.bind(formatterLogger),
            colorFns: getColorFns(true),
        });
    }
    return ProgressFormatter;
}());
exports.ProgressFormatter = ProgressFormatter;
//# sourceMappingURL=ProgressFormatter.js.map