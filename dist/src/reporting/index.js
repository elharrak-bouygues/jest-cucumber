"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReportEventGenerator_1 = require("./report-event-generation/ReportEventGenerator");
var ProgressFormatter_1 = require("./formatters/ProgressFormatter");
var SummaryFormatter_1 = require("./formatters/SummaryFormatter");
var JsonFormatter_1 = require("./formatters/JsonFormatter");
var Reporter = /** @class */ (function () {
    function Reporter(globalConfig, options) {
        this.reportEventGenerator = new ReportEventGenerator_1.ReportEventGenerator();
        var formatter = new JsonFormatter_1.JsonFormatter(this.reportEventGenerator, options);
        if (options && options.formatter) {
            switch (options.formatter) {
                case 'progress':
                    formatter = new ProgressFormatter_1.ProgressFormatter(this.reportEventGenerator);
                    break;
                case 'summary':
                    formatter = new SummaryFormatter_1.SummaryFormatter(this.reportEventGenerator);
                    break;
                case 'json':
                    formatter = new JsonFormatter_1.JsonFormatter(this.reportEventGenerator, options);
                    break;
                default:
                    throw new Error(options.formatter + " is not a valid formatter!");
            }
        }
    }
    Reporter.prototype.onTestResult = function (test, results) {
        return this.reportEventGenerator.onScenarioComplete(results);
    };
    Reporter.prototype.onRunComplete = function (contexts, results) {
        this.reportEventGenerator.onTestRunComplete(results);
    };
    return Reporter;
}());
exports.Reporter = Reporter;
//# sourceMappingURL=index.js.map