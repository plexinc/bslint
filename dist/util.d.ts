import { BsLintConfig, BsLintRules } from './index';
import { Program, BscFile, DiagnosticSeverity } from 'brighterscript';
import { ChangeEntry } from './textEdit';
export declare function getDefaultRules(): BsLintConfig['rules'];
export declare function getDefaultSeverity(): {
    assignAllPath: DiagnosticSeverity;
    unreachableCode: DiagnosticSeverity;
    unsafePathLoop: DiagnosticSeverity;
    unsafeIterators: DiagnosticSeverity;
    caseSensitivity: DiagnosticSeverity;
    unusedVariable: DiagnosticSeverity;
    unusedParameter: DiagnosticSeverity;
    consistentReturn: DiagnosticSeverity;
    inlineIfStyle: import("./index").RuleInlineIf;
    blockIfStyle: import("./index").RuleBlockIf;
    conditionStyle: import("./index").RuleCondition;
    namedFunctionStyle: import("./index").RuleFunction;
    anonFunctionStyle: import("./index").RuleFunction;
    aaCommaStyle: import("./index").RuleAAComma;
    typeAnnotations: import("./index").RuleTypeAnnotations;
    noPrint: DiagnosticSeverity;
    noTodo: DiagnosticSeverity;
    noStop: DiagnosticSeverity;
    eolLast: import("./index").RuleEolLast;
    colorFormat: import("./index").RuleColorFormat;
    colorCase: import("./index").RuleColorCase;
    colorAlpha: import("./index").RuleColorAlpha;
    colorAlphaDefaults: import("./index").RuleColorAlphaDefaults;
    colorCertCompliant: import("./index").RuleColorCertCompliant;
    noAssocarrayComponentFieldType: DiagnosticSeverity;
    noArrayComponentFieldType: DiagnosticSeverity;
    noRegexDuplicates: DiagnosticSeverity;
};
export declare function normalizeConfig(options: BsLintConfig): BsLintConfig;
export declare function mergeConfigs(a: BsLintConfig, b: BsLintConfig): BsLintConfig;
export interface PluginContext {
    program: Readonly<Program>;
    severity: Readonly<BsLintRules>;
    todoPattern: Readonly<RegExp>;
    globals: string[];
    ignores: (file: BscFile) => boolean;
    fix: Readonly<boolean>;
    fixAll: Readonly<boolean>;
    checkUsage: Readonly<boolean>;
    addFixes: (file: BscFile, entry: ChangeEntry) => void;
}
export interface PluginWrapperContext extends PluginContext {
    pendingFixes: Map<string, ChangeEntry[]>;
    applyFixes: () => Promise<void>;
}
export declare function createContext(program: Program): PluginWrapperContext;
