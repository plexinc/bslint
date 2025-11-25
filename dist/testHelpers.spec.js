"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectDiagnosticsFmt = exports.fmtDiagnostics = exports.expectDiagnostics = void 0;
const chai_1 = require("chai");
const thenby_1 = require("thenby");
function getDiagnostics(arg) {
    if (Array.isArray(arg)) {
        return arg;
    }
    else if (arg.getDiagnostics) {
        return arg.getDiagnostics();
    }
    else if (arg.diagnostics) {
        return arg.diagnostics;
    }
    else {
        throw new Error('Cannot derive a list of diagnostics from ' + JSON.stringify(arg));
    }
}
function sortDiagnostics(diagnostics) {
    return diagnostics.sort((0, thenby_1.firstBy)('code')
        .thenBy('message')
        .thenBy((a, b) => { var _a, _b, _c, _d, _e, _f; return ((_c = (_b = (_a = a.range) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.line) !== null && _c !== void 0 ? _c : 0) - ((_f = (_e = (_d = b.range) === null || _d === void 0 ? void 0 : _d.start) === null || _e === void 0 ? void 0 : _e.line) !== null && _f !== void 0 ? _f : 0); })
        .thenBy((a, b) => { var _a, _b, _c, _d, _e, _f; return ((_c = (_b = (_a = a.range) === null || _a === void 0 ? void 0 : _a.start) === null || _b === void 0 ? void 0 : _b.character) !== null && _c !== void 0 ? _c : 0) - ((_f = (_e = (_d = b.range) === null || _d === void 0 ? void 0 : _d.start) === null || _e === void 0 ? void 0 : _e.character) !== null && _f !== void 0 ? _f : 0); })
        .thenBy((a, b) => { var _a, _b, _c, _d, _e, _f; return ((_c = (_b = (_a = a.range) === null || _a === void 0 ? void 0 : _a.end) === null || _b === void 0 ? void 0 : _b.line) !== null && _c !== void 0 ? _c : 0) - ((_f = (_e = (_d = b.range) === null || _d === void 0 ? void 0 : _d.end) === null || _e === void 0 ? void 0 : _e.line) !== null && _f !== void 0 ? _f : 0); })
        .thenBy((a, b) => { var _a, _b, _c, _d, _e, _f; return ((_c = (_b = (_a = a.range) === null || _a === void 0 ? void 0 : _a.end) === null || _b === void 0 ? void 0 : _b.character) !== null && _c !== void 0 ? _c : 0) - ((_f = (_e = (_d = b.range) === null || _d === void 0 ? void 0 : _d.end) === null || _e === void 0 ? void 0 : _e.character) !== null && _f !== void 0 ? _f : 0); }));
}
function cloneObject(original, template, defaultKeys) {
    const clone = {};
    let keys = Object.keys(template !== null && template !== void 0 ? template : {});
    // if there were no keys provided, use some sane defaults
    keys = keys.length > 0 ? keys : defaultKeys;
    // copy only compare the specified keys from actualDiagnostic
    for (const key of keys) {
        clone[key] = original[key];
    }
    return clone;
}
/**
 *  Helper function to clone a Diagnostic so it will give partial data that has the same properties as the expected
 */
function cloneDiagnostic(actualDiagnosticInput, expectedDiagnostic) {
    const actualDiagnostic = cloneObject(actualDiagnosticInput, expectedDiagnostic, ['message', 'code', 'range', 'severity', 'relatedInformation']);
    // deep clone relatedInformation if available
    if (actualDiagnostic.relatedInformation) {
        for (let j = 0; j < actualDiagnostic.relatedInformation.length; j++) {
            actualDiagnostic.relatedInformation[j] = cloneObject(actualDiagnostic.relatedInformation[j], expectedDiagnostic === null || expectedDiagnostic === void 0 ? void 0 : expectedDiagnostic.relatedInformation[j], ['location', 'message']);
        }
    }
    // deep clone file info if available
    if (actualDiagnostic.file) {
        actualDiagnostic.file = cloneObject(actualDiagnostic.file, expectedDiagnostic === null || expectedDiagnostic === void 0 ? void 0 : expectedDiagnostic.file, ['srcPath', 'pkgPath']);
    }
    return actualDiagnostic;
}
/**
 * Ensure the DiagnosticCollection exactly contains the data from expected list.
 * @param arg - any object that contains diagnostics (such as `Program`, `Scope`, or even an array of diagnostics)
 * @param expected an array of expected diagnostics. if it's a string, assume that's a diagnostic error message
 */
function expectDiagnostics(arg, expected) {
    const actualDiagnostics = sortDiagnostics(getDiagnostics(arg));
    const expectedDiagnostics = sortDiagnostics(expected.map(x => {
        let result = x;
        if (typeof x === 'string') {
            result = { message: x };
        }
        else if (typeof x === 'number') {
            result = { code: x };
        }
        return result;
    }));
    const actual = [];
    for (let i = 0; i < actualDiagnostics.length; i++) {
        const expectedDiagnostic = expectedDiagnostics[i];
        const actualDiagnostic = cloneDiagnostic(actualDiagnostics[i], expectedDiagnostic);
        actual.push(actualDiagnostic);
    }
    (0, chai_1.expect)(actual).to.eql(expectedDiagnostics);
}
exports.expectDiagnostics = expectDiagnostics;
function pad(n) {
    return n > 9 ? `${n}` : `0${n}`;
}
function fmtDiagnostics(diagnostics) {
    return diagnostics
        .filter((d) => d.severity && d.severity < 4)
        .sort((a, b) => a.range.start.line - b.range.start.line)
        .map((d) => `${pad(d.range.start.line + 1)}:${d.code}:${d.message}`);
}
exports.fmtDiagnostics = fmtDiagnostics;
/**
 * Format a list of diagnostics and ensure they match the expectedDiagnostics string list
 */
function expectDiagnosticsFmt(diagnosticCollection, expectedDiagnostics) {
    const diagnostics = getDiagnostics(diagnosticCollection);
    const formatted = fmtDiagnostics(diagnostics);
    (0, chai_1.expect)(formatted).eql(expectedDiagnostics);
}
exports.expectDiagnosticsFmt = expectDiagnosticsFmt;
//# sourceMappingURL=testHelpers.spec.js.map