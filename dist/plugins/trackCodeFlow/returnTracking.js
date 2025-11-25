"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnLinter = void 0;
const brighterscript_1 = require("brighterscript");
var ReturnLintError;
(function (ReturnLintError) {
    ReturnLintError["UnreachableCode"] = "LINT2001";
    ReturnLintError["ReturnValueUnexpected"] = "LINT2002";
    ReturnLintError["ReturnValueExpected"] = "LINT2003";
    ReturnLintError["UnsafeReturnValue"] = "LINT2004";
    ReturnLintError["ReturnValueRequired"] = "LINT2005";
    ReturnLintError["ReturnValueMissing"] = "LINT2006";
    ReturnLintError["LastReturnValueMissing"] = "LINT2007";
})(ReturnLintError || (ReturnLintError = {}));
function createReturnLinter(lintContext, file, fun, state, diagnostics) {
    const { severity } = lintContext;
    const returns = [];
    const throws = [];
    function visitStatement(curr) {
        const { parent } = state;
        if (parent === null || parent === void 0 ? void 0 : parent.returns) {
            if (!(0, brighterscript_1.isCommentStatement)(curr.stat)) {
                diagnostics.push({
                    severity: severity.unreachableCode,
                    code: ReturnLintError.UnreachableCode,
                    message: 'Unreachable code',
                    range: curr.stat.range,
                    file: file,
                    tags: [brighterscript_1.DiagnosticTag.Unnecessary]
                });
            }
        }
        else if ((0, brighterscript_1.isReturnStatement)(curr.stat)) {
            const { ifs, trys, branch, parent } = state;
            returns.push({
                stat: curr.stat,
                hasValue: !!curr.stat.value && !(0, brighterscript_1.isCommentStatement)(curr.stat.value)
            });
            // flag parent branch to return
            const returnBlock = (ifs || trys) ? branch : parent;
            if (returnBlock && (parent === null || parent === void 0 ? void 0 : parent.branches) === 1) {
                returnBlock.returns = true;
            }
        }
        else if ((0, brighterscript_1.isThrowStatement)(curr.stat)) {
            const { ifs, trys, branch, parent } = state;
            throws.push({ stat: curr.stat });
            // flag parent branch to 'return'
            const returnBlock = (ifs || trys) ? branch : parent;
            if (returnBlock && (parent === null || parent === void 0 ? void 0 : parent.branches) === 1) {
                returnBlock.returns = true;
            }
        }
    }
    function closeBlock(closed) {
        const { parent } = state;
        if (!parent) {
            finalize(closed);
        }
        else if ((0, brighterscript_1.isIfStatement)(closed.stat) || (0, brighterscript_1.isTryCatchStatement)(closed.stat) || (0, brighterscript_1.isCatchStatement)(closed.stat)) {
            if (closed.branches === 0) {
                parent.returns = true;
                parent.branches--;
            }
        }
        else if (closed.returns) {
            if ((0, brighterscript_1.isIfStatement)(parent.stat)) {
                parent.branches--;
            }
            else if ((0, brighterscript_1.isTryCatchStatement)(parent.stat)) {
                parent.branches--;
            }
            else if ((0, brighterscript_1.isCatchStatement)(parent.stat)) {
                parent.branches--;
            }
        }
    }
    function finalize(last) {
        var _a, _b, _c, _d;
        const { consistentReturn } = severity;
        const kind = ((_a = fun.functionType) === null || _a === void 0 ? void 0 : _a.kind) === brighterscript_1.TokenKind.Sub ? 'Sub' : 'Function';
        const returnedValues = returns.filter((r) => r.hasValue);
        const hasReturnedValue = returnedValues.length > 0;
        // Function range only includes the function signature
        const funRangeStart = ((_b = fun.functionType) !== null && _b !== void 0 ? _b : fun.leftParen).range.start;
        const funRangeEnd = ((_c = fun.returnTypeToken) !== null && _c !== void 0 ? _c : fun.rightParen).range.end;
        const funRange = brighterscript_1.util.createRangeFromPositions(funRangeStart, funRangeEnd);
        // Explicit `as void` or `sub` without return type should never return a value
        if (((_d = fun.returnTypeToken) === null || _d === void 0 ? void 0 : _d.kind) === brighterscript_1.TokenKind.Void ||
            (kind === 'Sub' && !fun.returnTypeToken)) {
            if (hasReturnedValue) {
                returnedValues.forEach((r) => {
                    var _a;
                    diagnostics.push({
                        severity: consistentReturn,
                        code: ReturnLintError.ReturnValueUnexpected,
                        message: `${kind} as void should not return a value`,
                        range: ((_a = r.stat) === null || _a === void 0 ? void 0 : _a.range) || funRange,
                        file: file
                    });
                });
            }
            return;
        }
        const requiresReturnValue = !!fun.returnTypeToken ||
            returnedValues.length > 0 ||
            (kind === 'Function' && returns.length > 0);
        const missingValue = requiresReturnValue && returnedValues.length !== returns.length;
        const missingBranches = !last.returns;
        // Function doesn't consistently return,
        // or doesn't return at all but has an explicit type
        if ((requiresReturnValue || hasReturnedValue) && (missingBranches || (returns.length + throws.length) === 0)) {
            diagnostics.push({
                severity: consistentReturn,
                code: ReturnLintError.UnsafeReturnValue,
                message: 'Not all code paths return a value',
                range: funRange,
                file: file
            });
        }
        // Some return don't have a value
        if (missingValue) {
            returns
                .filter((r) => !r.hasValue)
                .forEach((r) => {
                diagnostics.push({
                    severity: consistentReturn,
                    code: ReturnLintError.ReturnValueMissing,
                    message: `${kind} should consistently return a value`,
                    range: r.stat.range || funRange,
                    file: file
                });
            });
        }
    }
    return {
        closeBlock: closeBlock,
        visitStatement: visitStatement
    };
}
exports.createReturnLinter = createReturnLinter;
//# sourceMappingURL=returnTracking.js.map