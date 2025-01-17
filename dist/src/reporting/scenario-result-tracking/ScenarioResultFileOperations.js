"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var os = require("os");
var path = require("path");
var getFilePath = function (featureTitle, scenarioTitle) {
    return path.join(os.tmpdir(), 'jest-cucumber-reporting', encodeURIComponent(featureTitle + "_" + scenarioTitle));
};
exports.saveScenarioResult = function (scenarioResult) {
    var filePath = getFilePath(scenarioResult.featureTitle, scenarioResult.scenarioTitle);
    if (!fs_1.existsSync(path.dirname(filePath))) {
        fs_1.mkdirSync(path.dirname(filePath));
    }
    return new Promise(function (resolve, reject) {
        fs_1.writeFile(filePath, JSON.stringify(scenarioResult), { encoding: 'utf8', flag: 'w' }, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};
exports.loadScenarioResult = function (featureTitle, scenarioTitle) {
    var filePath = getFilePath(featureTitle, scenarioTitle);
    return new Promise(function (resolve, reject) {
        fs_1.readFile(filePath, 'utf8', function (error, data) {
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    })
        .then(function (scenarioResult) { return JSON.parse(scenarioResult); });
};
//# sourceMappingURL=ScenarioResultFileOperations.js.map