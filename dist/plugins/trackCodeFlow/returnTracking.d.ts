import { BscFile, FunctionExpression, BsDiagnostic } from 'brighterscript';
import { LintState, StatementInfo } from '.';
import { PluginContext } from '../../util';
export declare function createReturnLinter(lintContext: PluginContext, file: BscFile, fun: FunctionExpression, state: LintState, diagnostics: BsDiagnostic[]): {
    closeBlock: (closed: StatementInfo) => void;
    visitStatement: (curr: StatementInfo) => void;
};
