import { BscFile, Scope, CallableContainerMap, BrsFile, OnGetCodeActionsEvent, Statement, FunctionExpression, Range } from 'brighterscript';
import { PluginContext } from '../../util';
export interface NarrowingInfo {
    text: string;
    range: Range;
    type: 'valid' | 'invalid';
    block: Statement;
}
export interface StatementInfo {
    stat: Statement;
    parent?: Statement;
    locals?: Map<string, VarInfo>;
    branches?: number;
    returns?: boolean;
    narrows?: NarrowingInfo[];
}
export declare enum VarRestriction {
    Iterator = 1,
    CatchedError = 2
}
export interface VarInfo {
    name: string;
    range: Range;
    isGlobal?: boolean;
    isParam?: boolean;
    isUnsafe: boolean;
    restriction?: VarRestriction;
    parent?: StatementInfo;
    metBranches?: number;
    narrowed?: NarrowingInfo;
    isUsed: boolean;
}
export interface LintState {
    file: BrsFile;
    fun: FunctionExpression;
    parent?: StatementInfo;
    stack: Statement[];
    blocks: WeakMap<Statement, StatementInfo>;
    ifs?: StatementInfo;
    trys?: StatementInfo;
    branch?: StatementInfo;
}
export default class TrackCodeFlow {
    private lintContext;
    name: 'trackCodeFlow';
    constructor(lintContext: PluginContext);
    onGetCodeActions(event: OnGetCodeActionsEvent): void;
    afterScopeValidate(scope: Scope, files: BscFile[], callables: CallableContainerMap): void;
    afterFileValidate(file: BscFile): void;
}
export declare function isBranchedStatement(stat: Statement): boolean;
