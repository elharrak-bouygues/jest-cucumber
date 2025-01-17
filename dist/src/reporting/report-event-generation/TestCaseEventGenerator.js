"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cucumber_1 = require("cucumber");
var TestCaseEventGenerator = /** @class */ (function () {
    function TestCaseEventGenerator(eventBroadcaster, eventDataCollector) {
        this.eventBroadcaster = eventBroadcaster;
        this.eventDataCollector = eventDataCollector;
    }
    TestCaseEventGenerator.prototype.generateTestCasePreparedEvent = function (scenarioResult) {
        var sourceLocation = this.getTestCaseSourceLocation(scenarioResult);
        var pickle = this.getTestCasePickle(scenarioResult);
        this.eventBroadcaster.emit('test-case-prepared', {
            sourceLocation: sourceLocation,
            steps: pickle.steps.map(function (pickleStep) {
                var location = pickleStep.locations[pickleStep.locations.length - 1];
                var line = location.line;
                return {
                    sourceLocation: { uri: scenarioResult.featureFilePath, line: line },
                };
            }),
        });
    };
    TestCaseEventGenerator.prototype.generateTestCaseStepEvents = function (scenarioResult) {
        var _this = this;
        var pickle = this.getTestCasePickle(scenarioResult);
        pickle.steps.forEach(function (pickleStep, index) {
            var stepResult = scenarioResult.stepResults[index];
            var duration = (stepResult) ? (stepResult.endTime - stepResult.startTime) || 1 : 0;
            var status = stepResult ? stepResult.error ? cucumber_1.Status.FAILED : cucumber_1.Status.PASSED : cucumber_1.Status.SKIPPED;
            var exception = stepResult && stepResult.error ? stepResult.error : undefined;
            _this.eventBroadcaster.emit('test-step-finished', {
                index: index,
                testCase: { sourceLocation: _this.getTestCaseSourceLocation(scenarioResult) },
                result: {
                    duration: duration,
                    status: status,
                    exception: exception,
                },
            });
        });
    };
    TestCaseEventGenerator.prototype.generateTestCaseFinishedEvent = function (scenarioResult, testResult) {
        this.eventBroadcaster.emit('test-case-finished', {
            sourceLocation: this.getTestCaseSourceLocation(scenarioResult),
            result: { duration: testResult.duration, status: testResult.status },
        });
    };
    TestCaseEventGenerator.prototype.getTestCaseSourceLocation = function (scenarioResult) {
        return { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber };
    };
    TestCaseEventGenerator.prototype.getTestCasePickle = function (scenarioResult) {
        var key = this.eventDataCollector.getTestCaseKey(this.getTestCaseSourceLocation(scenarioResult));
        return this.eventDataCollector.pickleMap[key];
    };
    return TestCaseEventGenerator;
}());
exports.TestCaseEventGenerator = TestCaseEventGenerator;
//# sourceMappingURL=TestCaseEventGenerator.js.map