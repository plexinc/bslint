import { BsDiagnostic, BscFile, DiagnosticSeverity, DiagnosticTag, Range } from 'brighterscript';
import { CodeDescription, DiagnosticRelatedInformation, Diagnostic } from 'vscode-languageserver-types';
type DiagnosticCollection = {
    getDiagnostics: () => Array<Diagnostic>;
} | {
    diagnostics: Diagnostic[];
} | Diagnostic[];
interface PartialDiagnostic {
    range?: Range;
    severity?: DiagnosticSeverity;
    code?: number | string;
    codeDescription?: Partial<CodeDescription>;
    source?: string;
    message?: string;
    tags?: Partial<DiagnosticTag>[];
    relatedInformation?: Partial<DiagnosticRelatedInformation>[];
    data?: unknown;
    file?: Partial<BscFile>;
}
/**
 * Ensure the DiagnosticCollection exactly contains the data from expected list.
 * @param arg - any object that contains diagnostics (such as `Program`, `Scope`, or even an array of diagnostics)
 * @param expected an array of expected diagnostics. if it's a string, assume that's a diagnostic error message
 */
export declare function expectDiagnostics(arg: DiagnosticCollection, expected: Array<PartialDiagnostic | string | number>): void;
export declare function fmtDiagnostics(diagnostics: BsDiagnostic[]): string[];
/**
 * Format a list of diagnostics and ensure they match the expectedDiagnostics string list
 */
export declare function expectDiagnosticsFmt(diagnosticCollection: DiagnosticCollection, expectedDiagnostics: string[]): void;
export {};
