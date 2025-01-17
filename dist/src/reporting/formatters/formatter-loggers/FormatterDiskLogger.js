"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var FormatterDiskLogger = /** @class */ (function () {
    function FormatterDiskLogger(path) {
        this.path = path;
        this.logs = [];
    }
    FormatterDiskLogger.prototype.log = function (logText) {
        this.logs.push(logText);
    };
    FormatterDiskLogger.prototype.save = function () {
        fs_1.writeFileSync(this.path, this.logs.join('\n'), 'utf8');
    };
    return FormatterDiskLogger;
}());
exports.FormatterDiskLogger = FormatterDiskLogger;
//# sourceMappingURL=FormatterDiskLogger.js.map