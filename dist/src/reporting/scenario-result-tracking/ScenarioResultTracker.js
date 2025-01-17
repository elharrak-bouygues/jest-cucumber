"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ScenarioResultFileOperations_1 = require("./ScenarioResultFileOperations");
var ScenarioResultTracker = /** @class */ (function () {
    function ScenarioResultTracker(feature, scenarioTitle, lineNumber) {
        this.scenarioResult = {
            featureTitle: feature.title,
            featureFilePath: feature.path,
            scenarioTitle: scenarioTitle,
            stepResults: [],
            lineNumber: lineNumber,
        };
    }
    ScenarioResultTracker.prototype.endScenario = function () {
        return ScenarioResultFileOperations_1.saveScenarioResult(this.scenarioResult);
    };
    ScenarioResultTracker.prototype.startStep = function (stepText, stepArguments, lineNumber) {
        this.scenarioResult.stepResults.push({
            stepText: stepText,
            stepArguments: stepArguments,
            startTime: new Date().getTime(),
            endTime: new Date().getTime(),
            error: null,
            lineNumber: lineNumber,
        });
    };
    ScenarioResultTracker.prototype.endStep = function () {
        this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].endTime = new Date().getTime();
    };
    ScenarioResultTracker.prototype.stepError = function (error) {
        this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].endTime = new Date().getTime();
        this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].error = error;
    };
    return ScenarioResultTracker;
}());
exports.ScenarioResultTracker = ScenarioResultTracker;
//# sourceMappingURL=ScenarioResultTracker.js.map