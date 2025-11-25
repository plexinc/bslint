"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messages = exports.CodeStyleError = void 0;
const brighterscript_1 = require("brighterscript");
var CodeStyleError;
(function (CodeStyleError) {
    CodeStyleError["InlineIfFound"] = "LINT3001";
    CodeStyleError["InlineIfThenMissing"] = "LINT3002";
    CodeStyleError["InlineIfThenFound"] = "LINT3003";
    CodeStyleError["BlockIfThenMissing"] = "LINT3004";
    CodeStyleError["BlockIfThenFound"] = "LINT3005";
    CodeStyleError["ConditionGroupMissing"] = "LINT3006";
    CodeStyleError["ConditionGroupFound"] = "LINT3007";
    CodeStyleError["SubKeywordExpected"] = "LINT3008";
    CodeStyleError["FunctionKeywordExpected"] = "LINT3009";
    CodeStyleError["ReturnTypeAnnotation"] = "LINT3010";
    CodeStyleError["TypeAnnotation"] = "LINT3011";
    CodeStyleError["NoPrint"] = "LINT3012";
    CodeStyleError["AACommaFound"] = "LINT3013";
    CodeStyleError["AACommaMissing"] = "LINT3014";
    CodeStyleError["NoTodo"] = "LINT3015";
    CodeStyleError["NoStop"] = "LINT3016";
    CodeStyleError["EolLastMissing"] = "LINT3017";
    CodeStyleError["EolLastFound"] = "LINT3018";
    CodeStyleError["ColorFormat"] = "LINT3019";
    CodeStyleError["ColorCase"] = "LINT3020";
    CodeStyleError["ColorAlpha"] = "LINT3021";
    CodeStyleError["ColorAlphaDefaults"] = "LINT3022";
    CodeStyleError["ColorCertCompliant"] = "LINT3023";
    CodeStyleError["NoAssocarrayFieldType"] = "LINT3024";
    CodeStyleError["NoArrayFieldType"] = "LINT3025";
    CodeStyleError["NoRegexDuplicates"] = "LINT3026";
})(CodeStyleError = exports.CodeStyleError || (exports.CodeStyleError = {}));
const CS = 'Code style:';
const ST = 'Strictness:';
exports.messages = {
    addBlockIfThenKeyword: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.BlockIfThenMissing,
        source: 'bslint',
        message: `${CS} add 'then' keyword`,
        range: stat.tokens.if.range,
        data: stat
    }),
    removeBlockIfThenKeyword: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.BlockIfThenFound,
        source: 'bslint',
        message: `${CS} remove 'then' keyword`,
        range: stat.tokens.then.range,
        data: stat
    }),
    inlineIfNotAllowed: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.InlineIfFound,
        source: 'bslint',
        message: `${CS} no inline if statement allowed`,
        range
    }),
    addInlineIfThenKeyword: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.InlineIfThenMissing,
        source: 'bslint',
        message: `${CS} add 'then' keyword`,
        range: stat.tokens.if.range,
        data: stat
    }),
    removeInlineIfThenKeyword: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.InlineIfThenFound,
        source: 'bslint',
        message: `${CS} remove 'then' keyword`,
        range: stat.tokens.then.range,
        data: stat
    }),
    addParenthesisAroundCondition: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ConditionGroupMissing,
        source: 'bslint',
        message: `${CS} add parenthesis around condition`,
        range: stat.condition.range,
        data: stat
    }),
    removeParenthesisAroundCondition: (stat) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ConditionGroupFound,
        source: 'bslint',
        message: `${CS} remove parenthesis around condition`,
        range: stat.condition.range,
        data: stat
    }),
    expectedSubKeyword: (fun, reason) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.SubKeywordExpected,
        source: 'bslint',
        message: `${CS} expected 'sub' keyword ${reason}`,
        range: fun.functionType.range,
        data: fun
    }),
    expectedFunctionKeyword: (fun, reason) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.FunctionKeywordExpected,
        source: 'bslint',
        message: `${CS} expected 'function' keyword ${reason}`,
        range: fun.functionType.range,
        data: fun
    }),
    expectedReturnTypeAnnotation: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ReturnTypeAnnotation,
        source: 'bslint',
        message: `${ST} function should declare the return type`,
        range
    }),
    expectedTypeAnnotation: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.TypeAnnotation,
        source: 'bslint',
        message: `${ST} type annotation required`,
        range
    }),
    noPrint: (range, severity) => ({
        severity: severity,
        code: CodeStyleError.NoPrint,
        source: 'bslint',
        message: `${CS} Avoid using direct Print statements`,
        range
    }),
    noTodo: (range, severity) => ({
        severity: severity,
        code: CodeStyleError.NoTodo,
        source: 'bslint',
        message: `${CS} Avoid using TODO comments`,
        range
    }),
    noStop: (range, severity) => ({
        severity: severity,
        code: CodeStyleError.NoStop,
        source: 'bslint',
        message: `${CS} STOP statements are not allowed in published applications`,
        range
    }),
    removeAAComma: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.AACommaFound,
        source: 'bslint',
        message: `Remove optional comma`,
        range
    }),
    addAAComma: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.AACommaMissing,
        source: 'bslint',
        message: `Add comma after the expression`,
        range
    }),
    addEolLast: (range, preferredEol) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.EolLastMissing,
        source: 'bslint',
        message: `${CS} File should end with a newline`,
        range,
        data: { preferredEol }
    }),
    removeEolLast: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.EolLastFound,
        source: 'bslint',
        message: `${CS} File should not end with a newline`,
        range
    }),
    expectedColorFormat: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ColorFormat,
        source: 'bslint',
        message: `${CS} File should follow color format`,
        range
    }),
    expectedColorCase: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ColorCase,
        source: 'bslint',
        message: `${CS} File should follow color case`,
        range
    }),
    expectedColorAlpha: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ColorAlpha,
        source: 'bslint',
        message: `${CS} File should follow color alpha rule`,
        range
    }),
    expectedColorAlphaDefaults: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ColorAlphaDefaults,
        source: 'bslint',
        message: `${CS} File should follow color alpha defaults rule`,
        range
    }),
    colorCertCompliance: (range) => ({
        severity: brighterscript_1.DiagnosticSeverity.Error,
        code: CodeStyleError.ColorCertCompliant,
        source: 'bslint',
        message: `${CS} File should follow Roku broadcast safe color cert requirement`,
        range
    }),
    noAssocarrayFieldType: (range, severity) => ({
        message: `Avoid using field type 'assocarray'`,
        code: CodeStyleError.NoAssocarrayFieldType,
        severity: severity,
        source: 'bslint',
        range
    }),
    noArrayFieldType: (range, severity) => ({
        message: `Avoid using field type 'array'`,
        code: CodeStyleError.NoArrayFieldType,
        severity: severity,
        source: 'bslint',
        range
    }),
    noIdenticalRegexInLoop: (range, severity) => ({
        message: 'Avoid redeclaring identical regular expressions in a loop',
        code: CodeStyleError.NoRegexDuplicates,
        severity: severity,
        source: 'bslint',
        range
    }),
    noRegexRedeclaring: (range, severity) => ({
        message: 'Avoid redeclaring identical regular expressions',
        code: CodeStyleError.NoRegexDuplicates,
        severity: severity,
        source: 'bslint',
        range
    })
};
//# sourceMappingURL=diagnosticMessages.js.map