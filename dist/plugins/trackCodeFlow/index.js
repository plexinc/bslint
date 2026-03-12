"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBranchedStatement = exports.VarRestriction = void 0;
const brighterscript_1 = require("brighterscript");
const returnTracking_1 = require("./returnTracking");
const varTracking_1 = require("./varTracking");
const trackFixes_1 = require("./trackFixes");
const textEdit_1 = require("../../textEdit");
var VarRestriction;
(function (VarRestriction) {
    VarRestriction[VarRestriction["Iterator"] = 1] = "Iterator";
    VarRestriction[VarRestriction["CatchedError"] = 2] = "CatchedError";
})(VarRestriction = exports.VarRestriction || (exports.VarRestriction = {}));
class TrackCodeFlow {
    constructor(lintContext) {
        this.lintContext = lintContext;
    }
    onGetCodeActions(event) {
        const addFixes = (0, textEdit_1.addFixesToEvent)(event);
        (0, trackFixes_1.extractFixes)(addFixes, event.diagnostics, this.lintContext.fixAll);
    }
    afterScopeValidate(scope, files, callables) {
        const diagnostics = (0, varTracking_1.runDeferredValidation)(this.lintContext, scope, files, callables);
        scope.addDiagnostics(diagnostics);
    }
    afterFileValidate(file) {
        if (!(0, brighterscript_1.isBrsFile)(file) || this.lintContext.ignores(file)) {
            return;
        }
        let diagnostics = [];
        (0, varTracking_1.resetVarContext)(file);
        file.parser.references.functionExpressions.forEach((fun) => {
            const state = {
                file: file,
                fun: fun,
                parent: undefined,
                stack: [],
                blocks: new WeakMap(),
                ifs: undefined,
                trys: undefined,
                branch: undefined
            };
            let curr = {
                stat: new brighterscript_1.EmptyStatement()
            };
            const returnLinter = (0, returnTracking_1.createReturnLinter)(this.lintContext, file, fun, state, diagnostics);
            const varLinter = (0, varTracking_1.createVarLinter)(this.lintContext, file, fun, state, diagnostics);
            // 1. close
            // 2. visit -> curr
            // 3. open -> curr becomes parent
            const visitStatement = (0, brighterscript_1.createStackedVisitor)((stat, stack) => {
                state.stack = stack;
                curr = {
                    stat: stat,
                    parent: stack[stack.length - 1],
                    branches: isBranchedStatement(stat) ? 2 : 1
                };
                returnLinter.visitStatement(curr);
                varLinter.visitStatement(curr);
            }, (opened) => {
                state.blocks.set(opened, curr);
                varLinter.openBlock(curr);
                if ((0, brighterscript_1.isIfStatement)(opened)) {
                    state.ifs = curr;
                }
                else if ((0, brighterscript_1.isTryCatchStatement)(opened)) {
                    state.trys = curr;
                }
                else if (!curr.parent || (0, brighterscript_1.isIfStatement)(curr.parent) || (0, brighterscript_1.isTryCatchStatement)(curr.parent) || (0, brighterscript_1.isCatchStatement)(curr.parent)) {
                    state.branch = curr;
                }
                state.parent = curr;
            }, (closed, stack) => {
                const block = state.blocks.get(closed);
                state.parent = state.blocks.get(stack[stack.length - 1]);
                if ((0, brighterscript_1.isIfStatement)(closed)) {
                    const { ifs, branch } = findIfBranch(state);
                    state.ifs = ifs;
                    state.branch = branch;
                }
                else if ((0, brighterscript_1.isTryCatchStatement)(closed)) {
                    const { trys, branch } = findTryBranch(state);
                    state.trys = trys;
                    state.branch = branch;
                }
                if (block) {
                    returnLinter.closeBlock(block);
                    varLinter.closeBlock(block);
                }
            });
            visitStatement(fun.body, undefined);
            if (fun.body.statements.length > 0) {
                /* eslint-disable no-bitwise */
                fun.body.walk((elem, parent) => {
                    // note: logic to ignore CommentStatement used as expression
                    if ((0, brighterscript_1.isStatement)(elem) && !(0, brighterscript_1.isExpression)(parent)) {
                        visitStatement(elem, parent);
                    }
                    else if (parent) {
                        varLinter.visitExpression(elem, parent, curr);
                    }
                }, { walkMode: brighterscript_1.WalkMode.visitStatements | brighterscript_1.WalkMode.visitExpressions });
            }
            else {
                // ensure empty functions are finalized
                state.blocks.set(fun.body, curr);
                state.stack.push(fun.body);
            }
            // close remaining open blocks
            let remain = state.stack.length;
            while (remain-- > 0) {
                const last = state.stack.pop();
                if (!last) {
                    continue;
                }
                const block = state.blocks.get(last);
                state.parent = remain > 0 ? state.blocks.get(state.stack[remain - 1]) : undefined;
                if (block) {
                    returnLinter.closeBlock(block);
                    varLinter.closeBlock(block);
                }
            }
        });
        if (this.lintContext.fix) {
            diagnostics = (0, trackFixes_1.extractFixes)(this.lintContext.addFixes, diagnostics, this.lintContext.fixAll);
        }
        file.addDiagnostics(diagnostics);
    }
}
exports.default = TrackCodeFlow;
// Find parent if and block where code flow is branched
function findIfBranch(state) {
    const { blocks, parent, stack } = state;
    for (let i = stack.length - 2; i >= 0; i--) {
        if ((0, brighterscript_1.isIfStatement)(stack[i])) {
            return {
                ifs: blocks.get(stack[i]),
                branch: blocks.get(stack[i + 1])
            };
        }
    }
    return {
        ifs: undefined,
        branch: parent
    };
}
// Find parent try and block where code flow is branched
function findTryBranch(state) {
    const { blocks, parent, stack } = state;
    for (let i = stack.length - 2; i >= 0; i--) {
        if ((0, brighterscript_1.isTryCatchStatement)(stack[i])) {
            return {
                trys: blocks.get(stack[i]),
                branch: blocks.get(stack[i + 1])
            };
        }
    }
    return {
        trys: undefined,
        branch: parent
    };
}
// `if` and `for/while` are considered as multi-branch
function isBranchedStatement(stat) {
    return (0, brighterscript_1.isIfStatement)(stat) || (0, brighterscript_1.isForStatement)(stat) || (0, brighterscript_1.isForEachStatement)(stat) || (0, brighterscript_1.isWhileStatement)(stat) || (0, brighterscript_1.isTryCatchStatement)(stat);
}
exports.isBranchedStatement = isBranchedStatement;
//# sourceMappingURL=index.js.map