"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
// tslint:disable-next-line:no-var-requires
var EventDataCollector = require('cucumber').formatterHelpers.EventDataCollector;
var ScenarioResultFileOperations_1 = require("../scenario-result-tracking/ScenarioResultFileOperations");
var FeatureFileEventGenerator_1 = require("./FeatureFileEventGenerator");
var TestCaseEventGenerator_1 = require("./TestCaseEventGenerator");
var ReportEventGenerator = /** @class */ (function () {
    function ReportEventGenerator() {
        this.eventBroadcaster = new events_1.EventEmitter();
        this.eventDataCollector = new EventDataCollector(this.eventBroadcaster);
        this.featureFileEventGenerator = new FeatureFileEventGenerator_1.FeatureFileEventGenerator(this.eventBroadcaster);
        this.testCaseEventGenerator = new TestCaseEventGenerator_1.TestCaseEventGenerator(this.eventBroadcaster, this.eventDataCollector);
    }
    ReportEventGenerator.prototype.onScenarioComplete = function (jestTestResult) {
        var _this = this;
        var promises = jestTestResult.testResults.map(function (testResult) {
            var featureTitle = testResult.ancestorTitles[0];
            var scenarioTitle = testResult.title;
            return ScenarioResultFileOperations_1.loadScenarioResult(featureTitle, scenarioTitle)
                .then(function (scenarioResult) {
                return _this.featureFileEventGenerator
                    .generateEventsFromFeatureFile(scenarioResult.featureFilePath)
                    .then(function () {
                    _this.testCaseEventGenerator.generateTestCasePreparedEvent(scenarioResult);
                    _this.testCaseEventGenerator.generateTestCaseStepEvents(scenarioResult);
                    _this.testCaseEventGenerator.generateTestCaseFinishedEvent(scenarioResult, testResult);
                });
            });
        });
        return Promise.all(promises);
    };
    ReportEventGenerator.prototype.onTestRunComplete = function (jestTestResult) {
        this.eventBroadcaster.emit('test-run-finished', {
            result: { duration: this.calculateTotalDuration(jestTestResult) },
        });
    };
    ReportEventGenerator.prototype.calculateTotalDuration = function (testResults) {
        return (testResults.testResults
            .map(function (suite) {
            return suite.perfStats.end - suite.perfStats.start;
        }))
            .reduce(function (totalDuration, nextSuiteDuration) {
            return totalDuration + nextSuiteDuration;
        }, 0);
    };
    return ReportEventGenerator;
}());
exports.ReportEventGenerator = ReportEventGenerator;
//# sourceMappingURL=ReportEventGenerator.js.map