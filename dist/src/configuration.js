"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var defaultErrorSettings = {
    missingScenarioInStepDefinitions: true,
    missingStepInStepDefinitions: true,
    missingScenarioInFeature: true,
    missingStepInFeature: true,
};
var defaultConfiguration = {
    tagFilter: undefined,
    scenarioNameTemplate: undefined,
    errors: defaultErrorSettings,
};
var globalConfiguration = {};
exports.getJestCucumberConfiguration = function (options) {
    var mergedOptions = __assign(__assign(__assign({}, defaultConfiguration), globalConfiguration), options || {});
    if (mergedOptions.errors === true) {
        mergedOptions.errors = defaultErrorSettings;
    }
    return mergedOptions;
};
exports.setJestCucumberConfiguration = function (options) {
    globalConfiguration = options;
};
//# sourceMappingURL=configuration.js.map