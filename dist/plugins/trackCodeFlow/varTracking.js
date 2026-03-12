"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootNamespaceName = exports.runDeferredValidation = exports.createVarLinter = exports.resetVarContext = exports.VarLintError = void 0;
const brighterscript_1 = require("brighterscript");
const _1 = require(".");
var VarLintError;
(function (VarLintError) {
    VarLintError["UninitializedVar"] = "LINT1001";
    VarLintError["UnsafeIteratorVar"] = "LINT1002";
    VarLintError["UnsafeInitialization"] = "LINT1003";
    VarLintError["CaseMismatch"] = "LINT1004";
    VarLintError["UnusedVariable"] = "LINT1005";
    VarLintError["UnusedParameter"] = "LINT1006";
})(VarLintError = exports.VarLintError || (exports.VarLintError = {}));
var ValidationKind;
(function (ValidationKind) {
    ValidationKind["Assignment"] = "Assignment";
    ValidationKind["UninitializedVar"] = "UninitializedVar";
    ValidationKind["Unsafe"] = "Unsafe";
})(ValidationKind || (ValidationKind = {}));
const deferredValidation = new Map();
function getDeferred(file) {
    return deferredValidation.get(file.pathAbsolute);
}
function resetVarContext(file) {
    deferredValidation.set(file.pathAbsolute, []);
}
exports.resetVarContext = resetVarContext;
function createVarLinter(lintContext, file, fun, state, diagnostics) {
    const { severity } = lintContext;
    const deferred = getDeferred(file);
    let foundLabelAt = 0;
    const args = new Map();
    args.set('m', { name: 'm', range: brighterscript_1.Range.create(0, 0, 0, 0), isParam: true, isUnsafe: false, isUsed: true });
    fun.parameters.forEach((p) => {
        const name = p.name.text;
        args.set(name.toLowerCase(), { name: name, range: p.name.range, isParam: true, isUnsafe: false, isUsed: false });
    });
    if ((0, brighterscript_1.isMethodStatement)(fun.functionStatement)) {
        args.set('super', { name: 'super', range: null, isParam: true, isUnsafe: false, isUsed: true });
    }
    function verifyVarCasing(curr, name) {
        if (curr && curr.name !== name.text) {
            diagnostics.push({
                severity: severity.caseSensitivity,
                code: VarLintError.CaseMismatch,
                message: `Variable '${name.text}' was previously set with a different casing as '${curr.name}'`,
                range: name.range,
                file: file,
                data: {
                    name: curr.name,
                    range: name.range
                }
            });
        }
    }
    function setLocal(parent, name, restriction) {
        if (!name) {
            return;
        }
        const key = name.text.toLowerCase();
        const arg = args.get(key);
        const local = {
            name: name.text,
            range: name.range,
            parent: parent,
            restriction: restriction,
            metBranches: 1,
            isUnsafe: false,
            isUsed: false
        };
        if (arg) {
            verifyVarCasing(arg, name);
            arg.isUsed = true;
            return local;
        }
        if (!parent.locals) {
            parent.locals = new Map();
        }
        else {
            verifyVarCasing(parent.locals.get(key), name);
        }
        parent.locals.set(key, local);
        deferred.push({
            kind: ValidationKind.Assignment,
            name: name.text,
            local: local,
            range: name.range
        });
        return local;
    }
    function findLocal(name) {
        var _a, _b;
        const key = name.toLowerCase();
        const arg = args.get(key);
        if (arg) {
            return arg;
        }
        const { parent, blocks, stack } = state;
        if ((_a = parent === null || parent === void 0 ? void 0 : parent.locals) === null || _a === void 0 ? void 0 : _a.has(key)) {
            return parent.locals.get(key);
        }
        for (let i = stack.length - 2; i >= 0; i--) {
            const block = blocks.get(stack[i]);
            const local = (_b = block === null || block === void 0 ? void 0 : block.locals) === null || _b === void 0 ? void 0 : _b.get(key);
            if (local) {
                return local;
            }
        }
        return undefined;
    }
    // A local was found but it is considered unsafe (e.g. set in an if branch)
    // Found out whether a parent has this variable set safely
    function findSafeLocal(name) {
        var _a;
        const key = name.toLowerCase();
        const { blocks, stack } = state;
        if (stack.length < 2) {
            return undefined;
        }
        for (let i = stack.length - 2; i >= 0; i--) {
            const block = blocks.get(stack[i]);
            const local = (_a = block === null || block === void 0 ? void 0 : block.locals) === null || _a === void 0 ? void 0 : _a.get(key);
            // if partial, look up higher in the scope for a non-partial
            if (local && !local.isUnsafe) {
                return local;
            }
        }
    }
    function openBlock(block) {
        var _a;
        const { stat } = block;
        if ((0, brighterscript_1.isForStatement)(stat)) {
            // for iterator will be declared by the next assignment statement
        }
        else if ((0, brighterscript_1.isForEachStatement)(stat)) {
            // declare `for each` iterator variable
            setLocal(block, stat.item, _1.VarRestriction.Iterator);
        }
        else if ((_a = state.parent) === null || _a === void 0 ? void 0 : _a.narrows) {
            narrowBlock(block);
        }
    }
    function narrowBlock(block) {
        var _a;
        const { parent } = state;
        const { stat } = block;
        if ((0, brighterscript_1.isIfStatement)(stat) && (0, brighterscript_1.isIfStatement)(parent.stat)) {
            block.narrows = parent === null || parent === void 0 ? void 0 : parent.narrows;
            return;
        }
        (_a = parent === null || parent === void 0 ? void 0 : parent.narrows) === null || _a === void 0 ? void 0 : _a.forEach(narrow => {
            if (narrow.block === stat) {
                setLocal(block, narrow).narrowed = narrow;
            }
            else {
                // opposite narrowing for other branches
                setLocal(block, narrow).narrowed = Object.assign(Object.assign({}, narrow), { type: narrow.type === 'invalid' ? 'valid' : 'invalid' });
            }
        });
    }
    function visitStatement(curr) {
        var _a;
        const { stat } = curr;
        if ((0, brighterscript_1.isAssignmentStatement)(stat) && state.parent) {
            // value = stat.value;
            setLocal(state.parent, stat.name, (0, brighterscript_1.isForStatement)(state.parent.stat) ? _1.VarRestriction.Iterator : undefined);
        }
        else if ((0, brighterscript_1.isCatchStatement)(stat) && state.parent) {
            setLocal(curr, stat.exceptionVariable, _1.VarRestriction.CatchedError);
        }
        else if ((0, brighterscript_1.isLabelStatement)(stat) && !foundLabelAt) {
            foundLabelAt = stat.range.start.line;
        }
        else if (foundLabelAt && (0, brighterscript_1.isGotoStatement)(stat) && state.parent) {
            // To avoid false positives when finding a goto statement,
            // very generously mark as used all unused variables after 1st found label line.
            // This isn't accurate but tracking usage across goto jumps is tricky
            const { stack, blocks } = state;
            const labelLine = foundLabelAt;
            for (let i = state.stack.length - 1; i >= 0; i--) {
                const block = blocks.get(stack[i]);
                (_a = block === null || block === void 0 ? void 0 : block.locals) === null || _a === void 0 ? void 0 : _a.forEach(local => {
                    var _a;
                    if (((_a = local.range) === null || _a === void 0 ? void 0 : _a.start.line) > labelLine) {
                        local.isUsed = true;
                    }
                });
            }
        }
    }
    function closeBlock(closed) {
        const { locals, branches, returns } = closed;
        const { parent } = state;
        if (!locals || !parent) {
            // Finalize when there's no parent, i.e. end of function
            if (!parent) {
                finalize(locals);
            }
            return;
        }
        // when closing a branched statement, evaluate vars with partial branches covered
        if (branches > 1) {
            locals.forEach((local) => {
                if (local.metBranches !== branches) {
                    local.isUnsafe = true;
                }
                local.metBranches = 1;
            });
        }
        else if ((0, brighterscript_1.isIfStatement)(parent.stat)) {
            locals.forEach(local => {
                // keep narrowed vars if we `return` the invalid branch
                if (local.narrowed) {
                    if (!returns || local.narrowed.type === 'valid') {
                        locals.delete(local.name.toLowerCase());
                    }
                }
            });
        }
        else if ((0, brighterscript_1.isCatchStatement)(closed.stat)) {
            locals.forEach(local => {
                // drop error variable
                if (local.restriction === _1.VarRestriction.CatchedError) {
                    locals.delete(local.name.toLowerCase());
                }
            });
        }
        // move locals to parent
        if (!parent.locals) {
            parent.locals = locals;
        }
        else {
            const isParentBranched = (0, brighterscript_1.isIfStatement)(parent.stat) || (0, brighterscript_1.isTryCatchStatement)(parent.stat);
            const isLoop = (0, brighterscript_1.isForStatement)(closed.stat) || (0, brighterscript_1.isForEachStatement)(closed.stat) || (0, brighterscript_1.isWhileStatement)(closed.stat);
            locals.forEach((local, name) => {
                var _a;
                const parentLocal = parent.locals.get(name);
                // if var is an iterator var, flag as partial
                if (local.restriction) {
                    local.isUnsafe = true;
                }
                // combine attributes / met branches
                if (isParentBranched) {
                    if (parentLocal) {
                        local.isUnsafe = parentLocal.isUnsafe || local.isUnsafe;
                        local.metBranches = ((_a = parentLocal.metBranches) !== null && _a !== void 0 ? _a : 0) + 1;
                    }
                }
                else if (parentLocal && !parentLocal.isUnsafe) {
                    local.isUnsafe = false;
                }
                if (parentLocal === null || parentLocal === void 0 ? void 0 : parentLocal.restriction) {
                    local.restriction = parentLocal.restriction;
                }
                if (!local.isUsed && isLoop) {
                    // avoid false positive if a local set in a loop isn't used
                    const someParentLocal = findLocal(local.name);
                    if (someParentLocal === null || someParentLocal === void 0 ? void 0 : someParentLocal.isUsed) {
                        local.isUsed = true;
                    }
                }
                parent.locals.set(name, local);
            });
        }
    }
    function visitExpression(expr, parent, curr) {
        var _a;
        if ((0, brighterscript_1.isVariableExpression)(expr)) {
            const name = expr.name.text;
            if (name === 'm') {
                return;
            }
            const local = findLocal(name);
            if (!local) {
                deferred.push({
                    kind: ValidationKind.UninitializedVar,
                    name: name,
                    range: expr.range,
                    namespace: (_a = expr.findAncestor(brighterscript_1.isNamespaceStatement)) === null || _a === void 0 ? void 0 : _a.nameExpression
                });
                return;
            }
            else {
                local.isUsed = true;
                verifyVarCasing(local, expr.name);
            }
            if (local.isUnsafe && !findSafeLocal(name)) {
                if (local.restriction) {
                    diagnostics.push({
                        severity: severity.unsafeIterators,
                        code: VarLintError.UnsafeIteratorVar,
                        message: `Using iterator variable '${name}' outside loop`,
                        range: expr.range,
                        file: file
                    });
                }
                else if (!isNarrowing(local, expr, parent, curr)) {
                    diagnostics.push({
                        severity: severity.unsafePathLoop,
                        code: VarLintError.UnsafeInitialization,
                        message: `Not all the code paths assign '${name}'`,
                        range: expr.range,
                        file: file
                    });
                }
            }
        }
    }
    function isNarrowing(local, expr, parent, curr) {
        var _a;
        // Are we inside an `if/elseif` statement condition?
        if (!(0, brighterscript_1.isIfStatement)(curr.stat)) {
            return false;
        }
        const block = curr.stat.thenBranch;
        // look for a statement testing whether variable is `invalid`,
        // like `if x <> invalid` or `else if x = invalid`
        if (!(0, brighterscript_1.isBinaryExpression)(parent) || !((0, brighterscript_1.isLiteralInvalid)(parent.left) || (0, brighterscript_1.isLiteralInvalid)(parent.right))) {
            // maybe the variable was narrowed as part of the condition
            // e.g. 2nd condition in: if x <> invalid and x.y = z
            return (_a = curr.narrows) === null || _a === void 0 ? void 0 : _a.some(narrow => narrow.text === local.name);
        }
        const operator = parent.operator.kind;
        if (operator !== brighterscript_1.TokenKind.Equal && operator !== brighterscript_1.TokenKind.LessGreater) {
            return false;
        }
        const narrow = {
            text: local.name,
            range: local.range,
            type: operator === brighterscript_1.TokenKind.Equal ? 'invalid' : 'valid',
            block
        };
        if (!curr.narrows) {
            curr.narrows = [];
        }
        curr.narrows.push(narrow);
        return true;
    }
    function finalize(locals) {
        locals === null || locals === void 0 ? void 0 : locals.forEach(local => {
            if (!local.isUsed && !local.restriction) {
                diagnostics.push({
                    severity: severity.unusedVariable,
                    code: VarLintError.UnusedVariable,
                    message: `Variable '${local.name}' is set but value is never used`,
                    range: local.range,
                    file: file
                });
            }
        });
        args === null || args === void 0 ? void 0 : args.forEach(arg => {
            // treat a leading underscore as an intentionally unused parameter
            if (!arg.isUsed && !arg.name.startsWith('_')) {
                diagnostics.push({
                    severity: severity.unusedParameter,
                    code: VarLintError.UnusedParameter,
                    message: `Parameter '${arg.name}' is set but value is never used`,
                    range: arg.range,
                    file: file,
                    data: {
                        name: arg.name,
                        range: arg.range,
                        isExperimental: true
                    }
                });
            }
        });
    }
    return {
        openBlock: openBlock,
        closeBlock: closeBlock,
        visitStatement: visitStatement,
        visitExpression: visitExpression
    };
}
exports.createVarLinter = createVarLinter;
function runDeferredValidation(lintContext, scope, files, callables) {
    const topLevelVars = buildTopLevelVars(scope, lintContext.globals);
    const diagnostics = [];
    files.forEach((file) => {
        const deferred = deferredValidation.get(file.pathAbsolute);
        if (deferred) {
            deferredVarLinter(scope, file, callables, topLevelVars, deferred, diagnostics);
        }
    });
    return diagnostics;
}
exports.runDeferredValidation = runDeferredValidation;
/**
 * Get a list of all top level variables available in the scope
 */
function buildTopLevelVars(scope, globals) {
    // lookups for namespaces, classes, enums, etc...
    // to add them to the topLevel so that they don't get marked as unused.
    const toplevel = new Set(globals);
    for (const namespace of scope.getAllNamespaceStatements()) {
        toplevel.add(getRootNamespaceName(namespace).toLowerCase()); // keep root of namespace
    }
    for (const [, cls] of scope.getClassMap()) {
        toplevel.add(cls.item.name.text.toLowerCase());
    }
    for (const [, enm] of scope.getEnumMap()) {
        toplevel.add(enm.item.name.toLowerCase());
    }
    for (const [, cnst] of scope.getConstMap()) {
        toplevel.add(cnst.item.name.toLowerCase());
    }
    return toplevel;
}
function deferredVarLinter(scope, file, callables, toplevel, deferred, diagnostics) {
    deferred.forEach(({ kind, name, local, range, namespace }) => {
        const key = name === null || name === void 0 ? void 0 : name.toLowerCase();
        let hasCallable = key ? callables.has(key) || toplevel.has(key) : false;
        if (key && !hasCallable && namespace) {
            // check if this could be a callable in the current namespace
            const keyUnderNamespace = `${namespace.getName(brighterscript_1.ParseMode.BrightScript)}_${key}`.toLowerCase();
            hasCallable = callables.has(keyUnderNamespace);
        }
        switch (kind) {
            case ValidationKind.UninitializedVar:
                if (!hasCallable) {
                    diagnostics.push({
                        severity: brighterscript_1.DiagnosticSeverity.Error,
                        code: VarLintError.UninitializedVar,
                        message: `Using uninitialised variable '${name}' when this file is included in scope '${scope.name}'`,
                        range: range,
                        file: file
                    });
                }
                // TODO else test case
                break;
            case ValidationKind.Assignment:
                break;
            case ValidationKind.Unsafe:
                break;
        }
    });
}
/**
 * Get the leftmost part of the namespace name. (i.e. `alpha` from `alpha.beta.charlie`) by walking
 * up the namespace chain until we get to the very topmost namespace. Then grabbing the leftmost token's name.
 *
 */
function getRootNamespaceName(namespace) {
    var _a, _b, _c;
    // there are more concise ways to accomplish this, but this is a hot function so it's been optimized.
    while (true) {
        const parent = (_a = namespace.parent) === null || _a === void 0 ? void 0 : _a.parent;
        if ((0, brighterscript_1.isNamespaceStatement)(parent)) {
            namespace = parent;
        }
        else {
            break;
        }
    }
    const result = (_c = (_b = brighterscript_1.util.getDottedGetPath(namespace.nameExpression)[0]) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.text;
    // const name = namespace.getName(ParseMode.BrighterScript).toLowerCase();
    // if (name.includes('imigx')) {
    //     console.log([name, result]);
    // }
    return result;
}
exports.getRootNamespaceName = getRootNamespaceName;
//# sourceMappingURL=varTracking.js.map