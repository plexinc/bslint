"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixes = exports.extractFixes = void 0;
const textEdit_1 = require("../../textEdit");
const varTracking_1 = require("./varTracking");
function extractFixes(addFixes, diagnostics, fixAll) {
    return diagnostics.filter(diagnostic => {
        var _a;
        if (((_a = diagnostic.data) === null || _a === void 0 ? void 0 : _a.isExperimental) && !fixAll) {
            return true;
        }
        const fix = getFixes(diagnostic, fixAll);
        if (fix) {
            addFixes(diagnostic.file, fix);
            return false;
        }
        return true;
    });
}
exports.extractFixes = extractFixes;
function getFixes(diagnostic, fixAll) {
    switch (diagnostic.code) {
        case varTracking_1.VarLintError.CaseMismatch:
            return fixCasing(diagnostic);
        case varTracking_1.VarLintError.UnusedParameter:
            return fixUnusedParameter(diagnostic);
        default:
            return null;
    }
}
exports.getFixes = getFixes;
function fixCasing(diagnostic) {
    const data = diagnostic.data;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(data.range, data.name)
        ]
    };
}
function fixUnusedParameter(diagnostic) {
    const data = diagnostic.data;
    const newName = `_${data.name}`;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(data.range, newName, data.name)
        ]
    };
}
//# sourceMappingURL=trackFixes.js.map