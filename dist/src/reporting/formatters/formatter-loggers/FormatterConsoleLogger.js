"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormatterConsoleLogger = /** @class */ (function () {
    function FormatterConsoleLogger() {
    }
    FormatterConsoleLogger.prototype.log = function (logText) {
        process.stdout.write(logText);
    };
    return FormatterConsoleLogger;
}());
exports.FormatterConsoleLogger = FormatterConsoleLogger;
//# sourceMappingURL=FormatterConsoleLogger.js.map