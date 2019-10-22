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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var scenario_validation_1 = require("./validation/scenario-validation");
var step_definition_validation_1 = require("./validation/step-definition-validation");
var tag_filtering_1 = require("./tag-filtering");
var ScenarioResultTracker_1 = require("./reporting/scenario-result-tracking/ScenarioResultTracker");
var processScenarioTitleTemplate = function (scenarioTitle, parsedFeature, options, parsedScenario, parsedScenarioOutline) {
    if (options && options.scenarioNameTemplate) {
        try {
            return options && options.scenarioNameTemplate({
                featureTitle: parsedFeature.title,
                scenarioTitle: scenarioTitle.toString(),
                featureTags: parsedFeature.tags,
                scenarioTags: (parsedScenario || parsedScenarioOutline).tags,
            });
        }
        catch (err) {
            throw new Error(
            // tslint:disable-next-line:max-line-length
            "An error occurred while executing a scenario name template. \nTemplate:\n" + options.scenarioNameTemplate + "\nError:" + err.message);
        }
    }
    return scenarioTitle;
};
var checkForPendingSteps = function (scenarioFromStepDefinitions) {
    var scenarioPending = false;
    scenarioFromStepDefinitions.steps.forEach(function (step) {
        try {
            if (step.stepFunction.toString().indexOf('pending()') !== -1) {
                var pendingTest = new Function("\n                    let isPending = false;\n\n                    const pending = function () {\n                        isPending = true;\n                    };\n\n                    (" + step.stepFunction + ")();\n\n                    return isPending;\n                ");
                scenarioPending = pendingTest();
            }
        }
        catch (err) {
            // Ignore
        }
    });
    return scenarioPending;
};
var getTestFunction = function (skippedViaTagFilter, only, skip, concurrent) {
    if (skip || skippedViaTagFilter) {
        return test.skip;
    }
    else if (only) {
        return test.only;
    }
    else if (concurrent) {
        return test.concurrent;
    }
    else {
        return test;
    }
};
var defineScenario = function (feature, scenarioTitle, scenarioFromStepDefinitions, parsedScenario, only, skip, concurrent) {
    if (only === void 0) { only = false; }
    if (skip === void 0) { skip = false; }
    if (concurrent === void 0) { concurrent = false; }
    var testFunction = getTestFunction(parsedScenario.skippedViaTagFilter, only, skip, concurrent);
    testFunction(scenarioTitle, function () {
        var scenarioResultTracker = new ScenarioResultTracker_1.ScenarioResultTracker(feature, scenarioTitle, parsedScenario.lineNumber);
        var stepsPromise = scenarioFromStepDefinitions.steps.reduce(function (promiseChain, nextStep, index) {
            var stepArgument = parsedScenario.steps[index].stepArgument;
            var step = parsedScenario.steps[index];
            var stepText = step.stepText;
            var matches = step_definition_validation_1.matchSteps(stepText, scenarioFromStepDefinitions.steps[index].stepMatcher);
            var matchArgs = [];
            if (matches && matches.length) {
                matchArgs = matches.slice(1);
            }
            var args = __spreadArrays(matchArgs, [stepArgument]);
            return promiseChain
                .then(function () {
                scenarioResultTracker.startStep(stepText, matchArgs, step.lineNumber);
                return Promise.resolve()
                    .then(function () { return nextStep.stepFunction.apply(nextStep, args); })
                    .then(function () { return scenarioResultTracker.endStep(); })
                    .catch(function (error) {
                    scenarioResultTracker.stepError(error);
                    return Promise.reject(__assign(__assign({}, error), { message: "An error occurred while executing step \"" + stepText + "\": " + error.message }));
                });
            });
        }, Promise.resolve());
        return stepsPromise
            .catch(function (error) {
            return scenarioResultTracker
                .endScenario()
                .then(function () { return Promise.reject(error); });
        })
            .then(function () {
            return scenarioResultTracker.endScenario();
        });
    });
};
var createDefineScenarioFunction = function (featureFromStepDefinitions, parsedFeature, only, skip, concurrent) {
    if (only === void 0) { only = false; }
    if (skip === void 0) { skip = false; }
    if (concurrent === void 0) { concurrent = false; }
    var defineScenarioFunction = function (scenarioTitle, stepsDefinitionFunctionCallback) {
        var scenarioFromStepDefinitions = {
            title: scenarioTitle,
            steps: [],
        };
        featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);
        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
            given: createDefineStepFunction(scenarioFromStepDefinitions),
            when: createDefineStepFunction(scenarioFromStepDefinitions),
            then: createDefineStepFunction(scenarioFromStepDefinitions),
            and: createDefineStepFunction(scenarioFromStepDefinitions),
            but: createDefineStepFunction(scenarioFromStepDefinitions),
            pending: function () {
                // Nothing to do
            },
        });
        var parsedScenario = parsedFeature.scenarios
            .filter(function (s) { return s.title.toLowerCase() === scenarioTitle.toLowerCase(); })[0];
        var parsedScenarioOutline = parsedFeature.scenarioOutlines
            .filter(function (s) { return s.title.toLowerCase() === scenarioTitle.toLowerCase(); })[0];
        var options = parsedFeature.options;
        scenarioTitle = processScenarioTitleTemplate(scenarioTitle, parsedFeature, options, parsedScenario, parsedScenarioOutline);
        step_definition_validation_1.ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps(options, parsedScenario || parsedScenarioOutline, scenarioFromStepDefinitions);
        if (checkForPendingSteps(scenarioFromStepDefinitions)) {
            xtest(scenarioTitle, function () {
                // Nothing to do
            }, undefined);
        }
        else if (parsedScenario) {
            defineScenario(parsedFeature, scenarioTitle, scenarioFromStepDefinitions, parsedScenario, only, skip, concurrent);
        }
        else if (parsedScenarioOutline) {
            parsedScenarioOutline.scenarios.forEach(function (scenario) {
                defineScenario(parsedFeature, (scenario.title || scenarioTitle), scenarioFromStepDefinitions, scenario, only, skip, concurrent);
            });
        }
    };
    return defineScenarioFunction;
};
var createDefineScenarioFunctionWithAliases = function (featureFromStepDefinitions, parsedFeature) {
    var defineScenarioFunctionWithAliases = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature);
    defineScenarioFunctionWithAliases.only = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, true);
    defineScenarioFunctionWithAliases.skip = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, false, true);
    defineScenarioFunctionWithAliases.concurrent = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature, false, false, true);
    return defineScenarioFunctionWithAliases;
};
var createDefineStepFunction = function (scenarioFromStepDefinitions) {
    return function (stepMatcher, stepFunction) {
        var stepDefinition = {
            stepMatcher: stepMatcher,
            stepFunction: stepFunction,
        };
        scenarioFromStepDefinitions.steps.push(stepDefinition);
    };
};
function defineFeature(featureFromFile, scenariosDefinitionCallback) {
    var featureFromDefinedSteps = {
        title: featureFromFile.title,
        scenarios: [],
    };
    var parsedFeatureWithTagFiltersApplied = tag_filtering_1.applyTagFilters(featureFromFile);
    if (parsedFeatureWithTagFiltersApplied.scenarios.length === 0
        && parsedFeatureWithTagFiltersApplied.scenarioOutlines.length === 0) {
        return;
    }
    describe(featureFromFile.title, function () {
        scenariosDefinitionCallback(createDefineScenarioFunctionWithAliases(featureFromDefinedSteps, parsedFeatureWithTagFiltersApplied));
        scenario_validation_1.checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(parsedFeatureWithTagFiltersApplied, featureFromDefinedSteps);
    });
}
exports.defineFeature = defineFeature;
//# sourceMappingURL=feature-definition-creation.js.map