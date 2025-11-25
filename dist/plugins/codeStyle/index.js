"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectWrappingAAMembersIndexes = void 0;
const brighterscript_1 = require("brighterscript");
const textEdit_1 = require("../../textEdit");
const createColorValidator_1 = require("../../createColorValidator");
const diagnosticMessages_1 = require("./diagnosticMessages");
const styleFixes_1 = require("./styleFixes");
class CodeStyle {
    constructor(lintContext) {
        this.lintContext = lintContext;
    }
    onGetCodeActions(event) {
        const addFixes = (0, textEdit_1.addFixesToEvent)(event);
        (0, styleFixes_1.extractFixes)(addFixes, event.diagnostics, this.lintContext.fixAll);
    }
    validateXMLFile(file) {
        var _a, _b, _c, _d, _e, _f;
        const diagnostics = [];
        const { noArrayComponentFieldType, noAssocarrayComponentFieldType } = this.lintContext.severity;
        const validateArrayComponentFieldType = noArrayComponentFieldType !== brighterscript_1.DiagnosticSeverity.Hint;
        const validateAssocarrayComponentFieldType = noAssocarrayComponentFieldType !== brighterscript_1.DiagnosticSeverity.Hint;
        for (const field of (_e = (_d = (_c = (_b = (_a = file.parser) === null || _a === void 0 ? void 0 : _a.ast) === null || _b === void 0 ? void 0 : _b.component) === null || _c === void 0 ? void 0 : _c.api) === null || _d === void 0 ? void 0 : _d.fields) !== null && _e !== void 0 ? _e : []) {
            const { tag, attributes } = field;
            if (tag.text === 'field') {
                const typeAttribute = attributes.find(({ key }) => key.text === 'type');
                const typeValue = (_f = typeAttribute === null || typeAttribute === void 0 ? void 0 : typeAttribute.value.text) === null || _f === void 0 ? void 0 : _f.toLowerCase();
                if (typeValue === 'array' && validateArrayComponentFieldType) {
                    diagnostics.push(diagnosticMessages_1.messages.noArrayFieldType(typeAttribute.value.range, noArrayComponentFieldType));
                }
                else if (typeValue === 'assocarray' && validateAssocarrayComponentFieldType) {
                    diagnostics.push(diagnosticMessages_1.messages.noAssocarrayFieldType(typeAttribute.value.range, noAssocarrayComponentFieldType));
                }
            }
        }
        return diagnostics;
    }
    validateBrsFile(file) {
        const diagnostics = [];
        const { severity } = this.lintContext;
        const { inlineIfStyle, blockIfStyle, conditionStyle, noPrint, noTodo, noStop, aaCommaStyle, eolLast, colorFormat, noRegexDuplicates } = severity;
        const validatePrint = noPrint !== brighterscript_1.DiagnosticSeverity.Hint;
        const validateTodo = noTodo !== brighterscript_1.DiagnosticSeverity.Hint;
        const validateNoStop = noStop !== brighterscript_1.DiagnosticSeverity.Hint;
        const validateNoRegexDuplicates = noRegexDuplicates !== brighterscript_1.DiagnosticSeverity.Hint;
        const validateInlineIf = inlineIfStyle !== 'off';
        const validateColorFormat = (colorFormat === 'hash-hex' || colorFormat === 'quoted-numeric-hex' || colorFormat === 'never');
        const disallowInlineIf = inlineIfStyle === 'never';
        const requireInlineIfThen = inlineIfStyle === 'then';
        const validateBlockIf = blockIfStyle !== 'off';
        const requireBlockIfThen = blockIfStyle === 'then';
        const validateCondition = conditionStyle !== 'off';
        const requireConditionGroup = conditionStyle === 'group';
        const validateAAStyle = aaCommaStyle !== 'off';
        const walkExpressions = validateAAStyle || validateColorFormat;
        const validateEolLast = eolLast !== 'off';
        const disallowEolLast = eolLast === 'never';
        const validateColorStyle = validateColorFormat ? (0, createColorValidator_1.createColorValidator)(severity) : undefined;
        // Check if the file is empty by going backwards from the last token,
        // meaning there are tokens other than `Eof` and `Newline`.
        const { tokens } = file.parser;
        let isFileEmpty = true;
        for (let i = tokens.length - 1; i >= 0; i--) {
            if (tokens[i].kind !== brighterscript_1.TokenKind.Eof &&
                tokens[i].kind !== brighterscript_1.TokenKind.Newline) {
                isFileEmpty = false;
                break;
            }
        }
        // Validate `eol-last` on non-empty files
        if (validateEolLast && !isFileEmpty) {
            const penultimateToken = tokens[tokens.length - 2];
            if (disallowEolLast) {
                if ((penultimateToken === null || penultimateToken === void 0 ? void 0 : penultimateToken.kind) === brighterscript_1.TokenKind.Newline) {
                    diagnostics.push(diagnosticMessages_1.messages.removeEolLast(penultimateToken.range));
                }
            }
            else if ((penultimateToken === null || penultimateToken === void 0 ? void 0 : penultimateToken.kind) !== brighterscript_1.TokenKind.Newline) {
                // Set the preferredEol as the last newline.
                // The fix function will handle the case where preferredEol is undefined.
                // This could happen in valid single line files, like:
                // `sub foo() end sub\EOF`
                let preferredEol;
                for (let i = tokens.length - 1; i >= 0; i--) {
                    if (tokens[i].kind === brighterscript_1.TokenKind.Newline) {
                        preferredEol = tokens[i].text;
                    }
                }
                diagnostics.push(diagnosticMessages_1.messages.addEolLast(penultimateToken.range, preferredEol));
            }
        }
        if (validateNoRegexDuplicates) {
            this.validateRegex(file, diagnostics, noRegexDuplicates);
        }
        file.ast.walk((0, brighterscript_1.createVisitor)({
            IfStatement: s => {
                const hasThenToken = !!s.tokens.then;
                if (!s.isInline && validateBlockIf) {
                    if (hasThenToken !== requireBlockIfThen) {
                        diagnostics.push(requireBlockIfThen
                            ? diagnosticMessages_1.messages.addBlockIfThenKeyword(s)
                            : diagnosticMessages_1.messages.removeBlockIfThenKeyword(s));
                    }
                }
                else if (s.isInline && validateInlineIf) {
                    if (disallowInlineIf) {
                        diagnostics.push(diagnosticMessages_1.messages.inlineIfNotAllowed(s.range));
                    }
                    else if (hasThenToken !== requireInlineIfThen) {
                        diagnostics.push(requireInlineIfThen
                            ? diagnosticMessages_1.messages.addInlineIfThenKeyword(s)
                            : diagnosticMessages_1.messages.removeInlineIfThenKeyword(s));
                    }
                }
                if (validateCondition) {
                    if ((0, brighterscript_1.isGroupingExpression)(s.condition) !== requireConditionGroup) {
                        diagnostics.push(requireConditionGroup
                            ? diagnosticMessages_1.messages.addParenthesisAroundCondition(s)
                            : diagnosticMessages_1.messages.removeParenthesisAroundCondition(s));
                    }
                }
            },
            WhileStatement: s => {
                if (validateCondition) {
                    if ((0, brighterscript_1.isGroupingExpression)(s.condition) !== requireConditionGroup) {
                        diagnostics.push(requireConditionGroup
                            ? diagnosticMessages_1.messages.addParenthesisAroundCondition(s)
                            : diagnosticMessages_1.messages.removeParenthesisAroundCondition(s));
                    }
                }
            },
            PrintStatement: s => {
                if (validatePrint) {
                    diagnostics.push(diagnosticMessages_1.messages.noPrint(s.tokens.print.range, noPrint));
                }
            },
            LiteralExpression: e => {
                if (validateColorStyle && e.token.kind === brighterscript_1.TokenKind.StringLiteral) {
                    validateColorStyle(e.token.text, e.token.range, diagnostics);
                }
            },
            TemplateStringExpression: e => {
                // only validate template strings that look like regular strings (i.e. `0xAABBCC`)
                if (validateColorStyle && e.quasis.length === 1 && e.quasis[0].expressions.length === 1) {
                    validateColorStyle(e.quasis[0].expressions[0].token.text, e.quasis[0].expressions[0].token.range, diagnostics);
                }
            },
            AALiteralExpression: e => {
                if (validateAAStyle) {
                    this.validateAAStyle(e, aaCommaStyle, diagnostics);
                }
            },
            CommentStatement: e => {
                if (validateTodo) {
                    if (this.lintContext.todoPattern.test(e.text)) {
                        diagnostics.push(diagnosticMessages_1.messages.noTodo(e.range, noTodo));
                    }
                }
            },
            StopStatement: s => {
                if (validateNoStop) {
                    diagnostics.push(diagnosticMessages_1.messages.noStop(s.tokens.stop.range, noStop));
                }
            }
        }), { walkMode: walkExpressions ? brighterscript_1.WalkMode.visitAllRecursive : brighterscript_1.WalkMode.visitStatementsRecursive });
        // validate function style (`function` or `sub`)
        for (const fun of file.parser.references.functionExpressions) {
            this.validateFunctionStyle(fun, diagnostics);
        }
        return diagnostics;
    }
    validateRegex(file, diagnostics, severity) {
        for (const fun of file.parser.references.functionExpressions) {
            const regexes = new Set();
            for (const callExpression of fun.callExpressions) {
                if (!this.isCreateObject(callExpression)) {
                    continue;
                }
                // Check if all args are literals and get them as string
                const callArgs = this.getLiteralArgs(callExpression.args);
                // CreateObject for roRegex expects 3 params,
                // they should be literals because only in this case we can guarante that call regex is the same
                if ((callArgs === null || callArgs === void 0 ? void 0 : callArgs.length) === 3 && callArgs[0] === 'roRegex') {
                    const parentStatement = callExpression.findAncestor((node, cancel) => {
                        if ((0, brighterscript_1.isIfStatement)(node)) {
                            cancel.cancel();
                        }
                        else if (this.isLoop(node) || (0, brighterscript_1.isFunctionExpression)(node)) {
                            return true;
                        }
                    });
                    const joinedArgs = callArgs.join();
                    const isRegexAlreadyExist = regexes.has(joinedArgs);
                    if (!isRegexAlreadyExist) {
                        regexes.add(joinedArgs);
                    }
                    if ((0, brighterscript_1.isFunctionExpression)(parentStatement)) {
                        if (isRegexAlreadyExist) {
                            diagnostics.push(diagnosticMessages_1.messages.noRegexRedeclaring(callExpression.range, severity));
                        }
                    }
                    else if (this.isLoop(parentStatement)) {
                        diagnostics.push(diagnosticMessages_1.messages.noIdenticalRegexInLoop(callExpression.range, severity));
                    }
                }
            }
        }
    }
    afterFileValidate(file) {
        if (this.lintContext.ignores(file)) {
            return;
        }
        const diagnostics = [];
        if ((0, brighterscript_1.isXmlFile)(file)) {
            diagnostics.push(...this.validateXMLFile(file));
        }
        else if ((0, brighterscript_1.isBrsFile)(file)) {
            diagnostics.push(...this.validateBrsFile(file));
        }
        // add file reference
        let bsDiagnostics = diagnostics.map(diagnostic => (Object.assign(Object.assign({}, diagnostic), { file })));
        // apply fix
        if (this.lintContext.fix) {
            bsDiagnostics = (0, styleFixes_1.extractFixes)(this.lintContext.addFixes, bsDiagnostics, this.lintContext.fixAll);
        }
        // append diagnostics
        file.addDiagnostics(bsDiagnostics);
    }
    validateAAStyle(aa, aaCommaStyle, diagnostics) {
        const indexes = collectWrappingAAMembersIndexes(aa);
        const last = indexes.length - 1;
        const isSingleLine = (aa) => {
            return aa.open.range.start.line === aa.close.range.end.line;
        };
        indexes.forEach((index, i) => {
            const member = aa.elements[index];
            const hasComma = !!member.commaToken;
            if (aaCommaStyle === 'never' || (i === last && ((aaCommaStyle === 'no-dangling') || isSingleLine(aa)))) {
                if (hasComma) {
                    diagnostics.push(diagnosticMessages_1.messages.removeAAComma(member.commaToken.range));
                }
            }
            else if (!hasComma) {
                diagnostics.push(diagnosticMessages_1.messages.addAAComma(member.value.range));
            }
        });
    }
    validateFunctionStyle(fun, diagnostics) {
        var _a, _b;
        const { severity } = this.lintContext;
        const { namedFunctionStyle, anonFunctionStyle, typeAnnotations } = severity;
        const style = fun.functionStatement ? namedFunctionStyle : anonFunctionStyle;
        const kind = fun.functionType.kind;
        const hasReturnedValue = style === 'auto' || typeAnnotations !== 'off' ? this.getFunctionReturns(fun) : false;
        // type annotations
        if (typeAnnotations !== 'off') {
            if (typeAnnotations !== 'args') {
                if (hasReturnedValue && !fun.returnTypeToken) {
                    diagnostics.push(diagnosticMessages_1.messages.expectedReturnTypeAnnotation(
                    // add the error to the function keyword (or just highlight the whole function if that's somehow missing)
                    (_b = (_a = fun.functionType) === null || _a === void 0 ? void 0 : _a.range) !== null && _b !== void 0 ? _b : fun.range));
                }
            }
            if (typeAnnotations !== 'return') {
                const missingAnnotation = fun.parameters.find(arg => !arg.typeToken);
                if (missingAnnotation) {
                    // only report 1st missing arg annotation to avoid error overload
                    diagnostics.push(diagnosticMessages_1.messages.expectedTypeAnnotation(missingAnnotation.range));
                }
            }
        }
        // keyword style
        if (style === 'off') {
            return;
        }
        if (style === 'no-function') {
            if (kind === brighterscript_1.TokenKind.Function) {
                diagnostics.push(diagnosticMessages_1.messages.expectedSubKeyword(fun, `(always use 'sub')`));
            }
            return;
        }
        if (style === 'no-sub') {
            if (kind === brighterscript_1.TokenKind.Sub) {
                diagnostics.push(diagnosticMessages_1.messages.expectedFunctionKeyword(fun, `(always use 'function')`));
            }
            return;
        }
        // auto
        if (hasReturnedValue) {
            if (kind !== brighterscript_1.TokenKind.Function) {
                diagnostics.push(diagnosticMessages_1.messages.expectedFunctionKeyword(fun, `(use 'function' when a value is returned)`));
            }
        }
        else if (kind !== brighterscript_1.TokenKind.Sub) {
            diagnostics.push(diagnosticMessages_1.messages.expectedSubKeyword(fun, `(use 'sub' when no value is returned)`));
        }
    }
    getFunctionReturns(fun) {
        let hasReturnedValue = false;
        if (fun.returnTypeToken) {
            hasReturnedValue = fun.returnTypeToken.kind !== brighterscript_1.TokenKind.Void;
        }
        else {
            const cancel = new brighterscript_1.CancellationTokenSource();
            fun.body.walk((0, brighterscript_1.createVisitor)({
                ReturnStatement: s => {
                    hasReturnedValue = !!s.value;
                    cancel.cancel();
                }
            }), { walkMode: brighterscript_1.WalkMode.visitStatements, cancel: cancel.token });
        }
        return hasReturnedValue;
    }
    isLoop(node) {
        return (0, brighterscript_1.isForStatement)(node) || (0, brighterscript_1.isForEachStatement)(node) || (0, brighterscript_1.isWhileStatement)(node);
    }
    isCreateObject(s) {
        return (0, brighterscript_1.isVariableExpression)(s.callee) && s.callee.name.text.toLowerCase() === 'createobject';
    }
    getLiteralArgs(args) {
        var _a, _b;
        const argsStringValue = [];
        for (const arg of args) {
            if ((0, brighterscript_1.isLiteralExpression)(arg)) {
                argsStringValue.push((_b = (_a = arg === null || arg === void 0 ? void 0 : arg.token) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.replace(/"/g, ''));
            }
            else {
                return;
            }
        }
        return argsStringValue;
    }
}
exports.default = CodeStyle;
/**
 * Collect indexes of non-inline AA members
 */
function collectWrappingAAMembersIndexes(aa) {
    const indexes = [];
    const { elements } = aa;
    const lastIndex = elements.length - 1;
    for (let i = 0; i < lastIndex; i++) {
        const e = elements[i];
        if ((0, brighterscript_1.isCommentStatement)(e)) {
            continue;
        }
        const ne = elements[i + 1];
        const hasNL = (0, brighterscript_1.isCommentStatement)(ne) || ne.range.start.line > e.range.end.line;
        if (hasNL) {
            indexes.push(i);
        }
    }
    const last = elements[lastIndex];
    if (last && !(0, brighterscript_1.isCommentStatement)(last)) {
        indexes.push(lastIndex);
    }
    return indexes;
}
exports.collectWrappingAAMembersIndexes = collectWrappingAAMembersIndexes;
//# sourceMappingURL=index.js.map