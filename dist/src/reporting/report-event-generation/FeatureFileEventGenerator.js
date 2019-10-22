"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
// tslint:disable-next-line:no-var-requires
var Gherkin = require('gherkin');
var FeatureFileEventGenerator = /** @class */ (function () {
    function FeatureFileEventGenerator(eventBroadcaster) {
        this.eventBroadcaster = eventBroadcaster;
        this.processedFeatureFiles = {};
    }
    FeatureFileEventGenerator.prototype.generateEventsFromFeatureFile = function (featureFilePath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.processedFeatureFiles[featureFilePath]) {
                return resolve(_this.processedFeatureFiles[featureFilePath]);
            }
            else {
                fs_1.readFile(featureFilePath, 'utf8', function (error, data) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        _this.processedFeatureFiles[featureFilePath] = data;
                        resolve(data);
                    }
                });
            }
        })
            .then(function (featureText) {
            var events = Gherkin.generateEvents(featureText, featureFilePath);
            events.forEach(function (event) {
                _this.eventBroadcaster.emit(event.type, event);
                if (event.type === 'pickle') {
                    _this.eventBroadcaster.emit('pickle-accepted', {
                        type: 'pickle-accepted',
                        pickle: event.pickle,
                        uri: event.uri,
                    });
                }
            });
        });
    };
    return FeatureFileEventGenerator;
}());
exports.FeatureFileEventGenerator = FeatureFileEventGenerator;
//# sourceMappingURL=FeatureFileEventGenerator.js.map