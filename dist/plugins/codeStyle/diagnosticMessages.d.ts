import { DiagnosticSeverity, FunctionExpression, IfStatement, Range, WhileStatement } from 'brighterscript';
export declare enum CodeStyleError {
    InlineIfFound = "LINT3001",
    InlineIfThenMissing = "LINT3002",
    InlineIfThenFound = "LINT3003",
    BlockIfThenMissing = "LINT3004",
    BlockIfThenFound = "LINT3005",
    ConditionGroupMissing = "LINT3006",
    ConditionGroupFound = "LINT3007",
    SubKeywordExpected = "LINT3008",
    FunctionKeywordExpected = "LINT3009",
    ReturnTypeAnnotation = "LINT3010",
    TypeAnnotation = "LINT3011",
    NoPrint = "LINT3012",
    AACommaFound = "LINT3013",
    AACommaMissing = "LINT3014",
    NoTodo = "LINT3015",
    NoStop = "LINT3016",
    EolLastMissing = "LINT3017",
    EolLastFound = "LINT3018",
    ColorFormat = "LINT3019",
    ColorCase = "LINT3020",
    ColorAlpha = "LINT3021",
    ColorAlphaDefaults = "LINT3022",
    ColorCertCompliant = "LINT3023",
    NoAssocarrayFieldType = "LINT3024",
    NoArrayFieldType = "LINT3025",
    NoRegexDuplicates = "LINT3026"
}
export declare const messages: {
    addBlockIfThenKeyword: (stat: IfStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement;
    };
    removeBlockIfThenKeyword: (stat: IfStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement;
    };
    inlineIfNotAllowed: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    addInlineIfThenKeyword: (stat: IfStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement;
    };
    removeInlineIfThenKeyword: (stat: IfStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement;
    };
    addParenthesisAroundCondition: (stat: IfStatement | WhileStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement | WhileStatement;
    };
    removeParenthesisAroundCondition: (stat: IfStatement | WhileStatement) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: IfStatement | WhileStatement;
    };
    expectedSubKeyword: (fun: FunctionExpression, reason: string) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: FunctionExpression;
    };
    expectedFunctionKeyword: (fun: FunctionExpression, reason: string) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: FunctionExpression;
    };
    expectedReturnTypeAnnotation: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    expectedTypeAnnotation: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    noPrint: (range: Range, severity: DiagnosticSeverity) => {
        severity: DiagnosticSeverity;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    noTodo: (range: Range, severity: DiagnosticSeverity) => {
        severity: DiagnosticSeverity;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    noStop: (range: Range, severity: DiagnosticSeverity) => {
        severity: DiagnosticSeverity;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    removeAAComma: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    addAAComma: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    addEolLast: (range: Range, preferredEol: string) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
        data: {
            preferredEol: string;
        };
    };
    removeEolLast: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    expectedColorFormat: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    expectedColorCase: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    expectedColorAlpha: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    expectedColorAlphaDefaults: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    colorCertCompliance: (range: Range) => {
        severity: 1;
        code: CodeStyleError;
        source: string;
        message: string;
        range: Range;
    };
    noAssocarrayFieldType: (range: Range, severity: DiagnosticSeverity) => {
        message: string;
        code: CodeStyleError;
        severity: DiagnosticSeverity;
        source: string;
        range: Range;
    };
    noArrayFieldType: (range: Range, severity: DiagnosticSeverity) => {
        message: string;
        code: CodeStyleError;
        severity: DiagnosticSeverity;
        source: string;
        range: Range;
    };
    noIdenticalRegexInLoop: (range: Range, severity: DiagnosticSeverity) => {
        message: string;
        code: CodeStyleError;
        severity: DiagnosticSeverity;
        source: string;
        range: Range;
    };
    noRegexRedeclaring: (range: Range, severity: DiagnosticSeverity) => {
        message: string;
        code: CodeStyleError;
        severity: DiagnosticSeverity;
        source: string;
        range: Range;
    };
};
