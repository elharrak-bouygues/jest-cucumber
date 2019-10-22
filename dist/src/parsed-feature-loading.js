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
var fs_1 = require("fs");
var path_1 = require("path");
var callsites_1 = require("callsites");
// tslint:disable-next-line:no-var-requires
var Gherkin = require('gherkin');
var configuration_1 = require("./configuration");
var parseDataTableRow = function (astDataTableRow) {
    return astDataTableRow.cells.map(function (col) { return col.value; });
};
var parseDataTable = function (astDataTable, astDataTableHeader) {
    var headerRow;
    var bodyRows;
    if (astDataTableHeader) {
        headerRow = parseDataTableRow(astDataTableHeader);
        bodyRows = astDataTable;
    }
    else {
        headerRow = parseDataTableRow(astDataTable.rows[0]);
        bodyRows = astDataTable && astDataTable.rows && astDataTable.rows.length && astDataTable.rows.slice(1);
    }
    if (bodyRows && bodyRows.length > 0) {
        return bodyRows.map(function (nextRow) {
            var parsedRow = parseDataTableRow(nextRow);
            return parsedRow.reduce(function (rowObj, nextCol, index) {
                var _a;
                return __assign(__assign({}, rowObj), (_a = {}, _a[headerRow[index]] = nextCol, _a));
            }, {});
        });
    }
    else {
        return [];
    }
};
var parseTableRowLineNumbers = function (astDataTable) {
    return astDataTable && astDataTable
        .map(function (row) { return row.location.line; });
};
var parseStepArgument = function (astStepArgument) {
    if (astStepArgument) {
        switch (astStepArgument.type) {
            case 'DataTable':
                return parseDataTable(astStepArgument);
            case 'DocString':
                return astStepArgument.content;
            default:
                return null;
        }
    }
    else {
        return null;
    }
};
var parseStep = function (astStep) {
    return {
        stepText: astStep.text,
        keyword: (astStep.keyword).trim().toLowerCase(),
        stepArgument: parseStepArgument(astStep.argument),
        lineNumber: astStep.location.line,
    };
};
var parseSteps = function (astScenario) {
    return astScenario.steps.map(function (astStep) { return parseStep(astStep); });
};
var parseTags = function (ast) {
    if (!ast.tags) {
        return [];
    }
    else {
        return ast.tags.map(function (tag) { return tag.name.toLowerCase(); });
    }
};
var parseScenario = function (astScenario) {
    return {
        title: astScenario.name,
        steps: parseSteps(astScenario),
        tags: parseTags(astScenario),
        lineNumber: astScenario.location.line,
    };
};
var parseScenarioOutlineExampleSteps = function (exampleTableRow, scenarioSteps) {
    return scenarioSteps.map(function (scenarioStep) {
        var stepText = Object.keys(exampleTableRow).reduce(function (processedStepText, nextTableColumn) {
            return processedStepText.replace("<" + nextTableColumn + ">", exampleTableRow[nextTableColumn]);
        }, scenarioStep.stepText);
        var stepArgument;
        if (scenarioStep.stepArgument) {
            stepArgument = scenarioStep.stepArgument.map(function (stepArgumentRow) {
                var modifiedStepAgrumentRow = __assign({}, stepArgumentRow);
                Object.keys(exampleTableRow).forEach(function (nextTableColumn) {
                    Object.keys(modifiedStepAgrumentRow).forEach(function (prop) {
                        modifiedStepAgrumentRow[prop] =
                            modifiedStepAgrumentRow[prop].replace("<" + nextTableColumn + ">", exampleTableRow[nextTableColumn]);
                    });
                });
                return modifiedStepAgrumentRow;
            });
        }
        return __assign(__assign({}, scenarioStep), { stepText: stepText,
            stepArgument: stepArgument });
    });
};
var getOutlineDynamicTitle = function (exampleTableRow, title) {
    return title.replace(/<(\S*)>/g, function (_, firstMatch) {
        return exampleTableRow[firstMatch || ''];
    });
};
var parseScenarioOutlineExample = function (exampleTableRow, outlineScenario, lineNumber) {
    var outlineScenarioTitle = outlineScenario.title;
    var exampleKeyTitle = getOutlineDynamicTitle(exampleTableRow, outlineScenarioTitle);
    var exampleTitle = exampleTableRow[exampleKeyTitle] ? exampleTableRow[exampleKeyTitle] : '';
    var title = outlineScenarioTitle;
    if (exampleKeyTitle) {
        title = outlineScenarioTitle.replace("<" + exampleKeyTitle + ">", exampleTitle);
    }
    return {
        title: getOutlineDynamicTitle(exampleTableRow, outlineScenario.title),
        steps: parseScenarioOutlineExampleSteps(exampleTableRow, outlineScenario.steps),
        tags: outlineScenario.tags,
        lineNumber: lineNumber,
    };
};
var parseScenarioOutlineExampleSet = function (astExampleSet, outlineScenario) {
    var exampleTable = parseDataTable(astExampleSet.tableBody, astExampleSet.tableHeader);
    var rowLineNumbers = parseTableRowLineNumbers(astExampleSet.tableBody);
    return exampleTable.map(function (tableRow, index) { return parseScenarioOutlineExample(tableRow, outlineScenario, rowLineNumbers[index]); });
};
var parseScenarioOutlineExampleSets = function (astExampleSets, outlineScenario) {
    var exampleSets = astExampleSets.map(function (astExampleSet) {
        return parseScenarioOutlineExampleSet(astExampleSet, outlineScenario);
    });
    return exampleSets.reduce(function (scenarios, nextExampleSet) {
        return __spreadArrays(scenarios, nextExampleSet);
    }, []);
};
var parseScenarioOutline = function (astScenarioOutline) {
    var outlineScenario = parseScenario(astScenarioOutline);
    return {
        title: outlineScenario.title,
        scenarios: parseScenarioOutlineExampleSets(astScenarioOutline.examples, outlineScenario),
        tags: outlineScenario.tags,
        steps: outlineScenario.steps,
        lineNumber: astScenarioOutline.location.line,
    };
};
var parseScenarios = function (astFeature) {
    return astFeature.children
        .filter(function (child) { return child.type === 'Scenario'; })
        .map(function (astScenario) { return parseScenario(astScenario); });
};
var parseScenarioOutlines = function (astFeature) {
    return astFeature.children
        .filter(function (child) { return child.type === 'ScenarioOutline'; })
        .map(function (astScenarioOutline) { return parseScenarioOutline(astScenarioOutline); });
};
exports.parseFeature = function (featurePath, featureText, options) {
    var ast;
    try {
        ast = new Gherkin.Parser().parse(featureText);
    }
    catch (err) {
        throw new Error("Error parsing feature Gherkin: " + err.message);
    }
    var astFeature = ast.feature;
    return {
        title: astFeature.name,
        scenarios: parseScenarios(astFeature),
        scenarioOutlines: parseScenarioOutlines(astFeature),
        tags: parseTags(astFeature),
        options: options,
        path: featurePath,
    };
};
exports.loadFeature = function (featureFilePath, options) {
    options = configuration_1.getJestCucumberConfiguration(options);
    var callSite = callsites_1.default()[1];
    var fileOfCaller = callSite && callSite.getFileName() || '';
    var dirOfCaller = path_1.dirname(fileOfCaller);
    var absoluteFeatureFilePath = path_1.resolve(options.loadRelativePath ? dirOfCaller : '', featureFilePath);
    try {
        var featureText = fs_1.readFileSync(absoluteFeatureFilePath, 'utf8');
        return exports.parseFeature(absoluteFeatureFilePath, featureText, options);
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error("Feature file not found (" + absoluteFeatureFilePath + ")");
        }
        throw err;
    }
};
//# sourceMappingURL=parsed-feature-loading.js.map