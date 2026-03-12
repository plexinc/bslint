import { BscFile, FunctionExpression, BsDiagnostic, NamespaceStatement, Expression, Scope, CallableContainerMap } from 'brighterscript';
import { LintState, StatementInfo } from '.';
import { PluginContext } from '../../util';
export declare enum VarLintError {
    UninitializedVar = "LINT1001",
    UnsafeIteratorVar = "LINT1002",
    UnsafeInitialization = "LINT1003",
    CaseMismatch = "LINT1004",
    UnusedVariable = "LINT1005",
    UnusedParameter = "LINT1006"
}
export declare function resetVarContext(file: BscFile): void;
export declare function createVarLinter(lintContext: PluginContext, file: BscFile, fun: FunctionExpression, state: LintState, diagnostics: BsDiagnostic[]): {
    openBlock: (block: StatementInfo) => void;
    closeBlock: (closed: StatementInfo) => void;
    visitStatement: (curr: StatementInfo) => void;
    visitExpression: (expr: Expression, parent: Expression, curr: StatementInfo) => void;
};
export declare function runDeferredValidation(lintContext: PluginContext, scope: Scope, files: BscFile[], callables: CallableContainerMap): BsDiagnostic[];
/**
 * Get the leftmost part of the namespace name. (i.e. `alpha` from `alpha.beta.charlie`) by walking
 * up the namespace chain until we get to the very topmost namespace. Then grabbing the leftmost token's name.
 *
 */
export declare function getRootNamespaceName(namespace: NamespaceStatement): string;
