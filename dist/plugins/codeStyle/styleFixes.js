"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixes = exports.extractFixes = void 0;
const brighterscript_1 = require("brighterscript");
const textEdit_1 = require("../../textEdit");
const diagnosticMessages_1 = require("./diagnosticMessages");
const process_1 = require("process");
function extractFixes(addFixes, diagnostics, fixAll) {
    return diagnostics.filter(diagnostic => {
        var _a;
        if (((_a = diagnostic.data) === null || _a === void 0 ? void 0 : _a.isExperimental) && !fixAll) {
            return true;
        }
        const fix = getFixes(diagnostic);
        if (fix) {
            addFixes(diagnostic.file, fix);
            return false;
        }
        return true;
    });
}
exports.extractFixes = extractFixes;
function getFixes(diagnostic) {
    switch (diagnostic.code) {
        case diagnosticMessages_1.CodeStyleError.FunctionKeywordExpected:
            return replaceFunctionTokens(diagnostic, 'function');
        case diagnosticMessages_1.CodeStyleError.SubKeywordExpected:
            return replaceFunctionTokens(diagnostic, 'sub');
        case diagnosticMessages_1.CodeStyleError.InlineIfThenFound:
        case diagnosticMessages_1.CodeStyleError.BlockIfThenFound:
            return removeThenToken(diagnostic);
        case diagnosticMessages_1.CodeStyleError.InlineIfThenMissing:
        case diagnosticMessages_1.CodeStyleError.BlockIfThenMissing:
            return addThenToken(diagnostic);
        case diagnosticMessages_1.CodeStyleError.ConditionGroupFound:
            return removeConditionGroup(diagnostic);
        case diagnosticMessages_1.CodeStyleError.ConditionGroupMissing:
            return addConditionGroup(diagnostic);
        case diagnosticMessages_1.CodeStyleError.AACommaFound:
            return removeAAComma(diagnostic);
        case diagnosticMessages_1.CodeStyleError.AACommaMissing:
            return addAAComma(diagnostic);
        case diagnosticMessages_1.CodeStyleError.EolLastMissing:
            return addEolLast(diagnostic);
        case diagnosticMessages_1.CodeStyleError.EolLastFound:
            return removeEolLast(diagnostic);
        default:
            return null;
    }
}
exports.getFixes = getFixes;
function addAAComma(diagnostic) {
    const { range } = diagnostic;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.insertText)(range.end, ',')
        ]
    };
}
function removeAAComma(diagnostic) {
    const { range } = diagnostic;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(range, '')
        ]
    };
}
function addConditionGroup(diagnostic) {
    const stat = diagnostic.data;
    const { start, end } = stat.condition.range;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.insertText)(brighterscript_1.Position.create(start.line, start.character), '('),
            (0, textEdit_1.insertText)(brighterscript_1.Position.create(end.line, end.character), ')')
        ]
    };
}
function removeConditionGroup(diagnostic) {
    var _a, _b;
    const stat = diagnostic.data;
    const { left, right } = stat.condition.tokens;
    const spaceBefore = ((_a = left.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.length) > 0 ? '' : ' ';
    let spaceAfter = '';
    if ((0, brighterscript_1.isIfStatement)(stat)) {
        spaceAfter = stat.isInline ? ' ' : '';
        if (stat.tokens.then) {
            spaceAfter = ((_b = stat.tokens.then.leadingWhitespace) === null || _b === void 0 ? void 0 : _b.length) > 0 ? '' : ' ';
        }
    }
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(left.range, spaceBefore),
            (0, textEdit_1.replaceText)(right.range, spaceAfter)
        ]
    };
}
function addThenToken(diagnostic) {
    var _a;
    const stat = diagnostic.data;
    const { end } = stat.condition.range;
    // const { start } = stat.thenBranch.range; // TODO: use when Block range bug is fixed
    const start = (_a = stat.thenBranch.statements[0]) === null || _a === void 0 ? void 0 : _a.range.start;
    const space = stat.isInline && (0, textEdit_1.comparePos)(end, start) === 0 ? ' ' : '';
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.insertText)(end, ` then${space}`)
        ]
    };
}
function removeThenToken(diagnostic) {
    var _a;
    const stat = diagnostic.data;
    const { then } = stat.tokens;
    const { line, character } = then.range.start;
    const range = brighterscript_1.Range.create(line, character - (((_a = then.leadingWhitespace) === null || _a === void 0 ? void 0 : _a.length) || 0), line, character + then.text.length);
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(range, '')
        ]
    };
}
function replaceFunctionTokens(diagnostic, token) {
    var _a, _b, _c;
    const fun = diagnostic.data;
    const space = ((_a = fun.end) === null || _a === void 0 ? void 0 : _a.text.indexOf(' ')) > 0 ? ' ' : '';
    // sub/function keyword
    const keywordChanges = [
        (0, textEdit_1.replaceText)(fun.functionType.range, token),
        (0, textEdit_1.replaceText)((_b = fun.end) === null || _b === void 0 ? void 0 : _b.range, `end${space}${token}`)
    ];
    // remove `as void` in case of `sub`
    const returnChanges = token === 'sub' && ((_c = fun.returnTypeToken) === null || _c === void 0 ? void 0 : _c.kind) === brighterscript_1.TokenKind.Void ? [
        (0, textEdit_1.replaceText)(brighterscript_1.Range.create(fun.rightParen.range.end, fun.returnTypeToken.range.end), '')
    ] : [];
    return {
        diagnostic,
        changes: [
            ...keywordChanges,
            ...returnChanges
        ]
    };
}
function addEolLast(diagnostic) {
    var _a;
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.insertText)(diagnostic.range.end, 
            // In single line files, the `preferredEol` cannot be determined
            // e.g: `sub foo() end sub\EOF`
            (_a = diagnostic.data.preferredEol) !== null && _a !== void 0 ? _a : (process_1.platform.toString() === 'win32' ? '\r\n' : '\n'))
        ]
    };
}
function removeEolLast(diagnostic) {
    return {
        diagnostic,
        changes: [
            (0, textEdit_1.replaceText)(diagnostic.range, '')
        ]
    };
}
//# sourceMappingURL=styleFixes.js.map