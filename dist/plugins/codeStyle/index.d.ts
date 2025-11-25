import { BscFile, XmlFile, BsDiagnostic, FunctionExpression, DiagnosticSeverity, OnGetCodeActionsEvent, AALiteralExpression, BrsFile } from 'brighterscript';
import { RuleAAComma } from '../..';
import { PluginContext } from '../../util';
export default class CodeStyle {
    private lintContext;
    name: 'codeStyle';
    constructor(lintContext: PluginContext);
    onGetCodeActions(event: OnGetCodeActionsEvent): void;
    validateXMLFile(file: XmlFile): Omit<BsDiagnostic, "file">[];
    validateBrsFile(file: BrsFile): Omit<BsDiagnostic, "file">[];
    validateRegex(file: BrsFile, diagnostics: (Omit<BsDiagnostic, 'file'>)[], severity: DiagnosticSeverity): void;
    afterFileValidate(file: BscFile): void;
    validateAAStyle(aa: AALiteralExpression, aaCommaStyle: RuleAAComma, diagnostics: (Omit<BsDiagnostic, 'file'>)[]): void;
    validateFunctionStyle(fun: FunctionExpression, diagnostics: (Omit<BsDiagnostic, 'file'>)[]): void;
    getFunctionReturns(fun: FunctionExpression): boolean;
    private isLoop;
    private isCreateObject;
    private getLiteralArgs;
}
/**
 * Collect indexes of non-inline AA members
 */
export declare function collectWrappingAAMembersIndexes(aa: AALiteralExpression): number[];
