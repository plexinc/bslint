"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnusedCode = void 0;
const brighterscript_1 = require("brighterscript");
const isWin = process.platform === 'win32';
var UnusedCode;
(function (UnusedCode) {
    UnusedCode["UnusedComponent"] = "LINT4001";
    UnusedCode["UnusedScript"] = "LINT4002";
})(UnusedCode = exports.UnusedCode || (exports.UnusedCode = {}));
class CheckUsage {
    constructor(_) {
        this.name = 'checkUsage';
        this.vertices = [];
        this.map = new Map();
        this.parsed = new Set();
        // known SG components
        const walked = new Set();
        [
            'animation', 'busyspinner', 'buttongroup', 'channelstore', 'checklist', 'colorfieldinterpolator',
            'contentnode', 'dialog', 'dynamiccustomkeyboard', 'dynamickeyboard', 'dynamickeygrid',
            'dynamicminikeyboard', 'dynamicpinpad', 'floatfieldinterpolator', 'font', 'group', 'keyboard',
            'keyboarddialog', 'label', 'labellist', 'layoutgroup', 'markupgrid', 'markuplist', 'maskgroup',
            'minikeyboard', 'node', 'parallelanimation', 'pindialog', 'pinpad', 'poster', 'progressdialog',
            'radiobuttonlist', 'rectangle', 'rowlist', 'scene', 'scrollabletext', 'scrollinglabel',
            'sequentialanimation', 'simplelabel', 'standarddialog', 'standardkeyboarddialog',
            'standardmessagedialog', 'standardpinpaddialog', 'standardprogressdialog', 'targetgroup',
            'targetlist', 'targetset', 'task', 'texteditbox', 'timegrid', 'timer', 'vector2dfieldinterpolator',
            'video', 'voicetexteditbox', 'zoomrowlist'
        ].forEach(name => walked.add(`"${name}"`)); // components are pre-quoted
        this.walked = walked;
    }
    walkChildren(v, children, file) {
        children.forEach(node => {
            var _a;
            const name = (_a = node.tag) === null || _a === void 0 ? void 0 : _a.text;
            if (name) {
                v.edges.push(createComponentEdge(name, node.tag.range, file));
            }
            const itemComponentName = node.getAttribute('itemcomponentname');
            if (itemComponentName) {
                v.edges.push(createComponentEdge(itemComponentName.value.text, itemComponentName.value.range, file));
            }
            if (node.children) {
                this.walkChildren(v, node.children, file);
            }
        });
    }
    walkGraph(edge) {
        const { name } = edge;
        if (this.walked.has(name)) {
            return;
        }
        this.walked.add(name);
        const v = this.map.get(name);
        if (!v) {
            console.log('[Check Usage] Unknown component:', name);
            return;
        }
        v.edges.forEach(target => {
            this.walkGraph(target);
        });
    }
    afterFileValidate(file) {
        var _a;
        // collect all XML components
        if ((0, brighterscript_1.isXmlFile)(file)) {
            if (!file.componentName) {
                return;
            }
            const { text, range } = file.componentName;
            if (!text) {
                return;
            }
            const edge = createComponentEdge(text, range, file);
            let v;
            if (this.map.has(edge.name)) {
                v = this.map.get(edge.name);
                v.file = file;
            }
            else {
                v = {
                    name: edge.name,
                    file,
                    edges: []
                };
                this.vertices.push(v);
                this.map.set(edge.name, v);
            }
            if (file.parentComponentName) {
                const { text, range } = file.parentComponentName;
                v.edges.push(createComponentEdge(text, range, file));
            }
            const children = (_a = file.ast.component) === null || _a === void 0 ? void 0 : _a.children;
            if (children) {
                this.walkChildren(v, children.children, file);
            }
        }
    }
    afterScopeValidate(scope, files, _) {
        var _a;
        const pkgPath = scope.name.toLowerCase();
        let v;
        if (scope.name === 'global') {
            return;
        }
        else if (scope.name === 'source') {
            v = {
                name: 'source',
                file: null,
                edges: []
            };
        }
        else {
            const comp = files.find(file => file.pkgPath.toLowerCase() === pkgPath);
            if (!comp) {
                console.log('[Check Usage] Scope XML component not found:', scope.name);
                return;
            }
            const name = (_a = comp.componentName) === null || _a === void 0 ? void 0 : _a.text;
            v = name && this.map.get(`"${name.toLowerCase()}"`);
            if (!v) {
                console.log('[Check Usage] Component not found:', scope.name);
                return;
            }
        }
        scope.getOwnFiles().forEach(file => {
            if (!(0, brighterscript_1.isBrsFile)(file)) {
                return;
            }
            const pkgPath = normalizePath(file.pkgPath);
            v.edges.push({
                name: pkgPath,
                range: null,
                file
            });
            if (this.parsed.has(pkgPath)) {
                return;
            }
            this.parsed.add(pkgPath);
            const fv = {
                name: pkgPath,
                file,
                edges: []
            };
            this.vertices.push(fv);
            const map = this.map;
            this.map.set(pkgPath, fv);
            if (pkgPath === 'source/main.brs' || pkgPath === 'source/main.bs') {
                this.main = fv;
            }
            // find strings that look like referring to component names
            file.parser.references.functionExpressions.forEach(fun => {
                fun.body.walk((0, brighterscript_1.createVisitor)({
                    LiteralExpression: (e) => {
                        const { kind } = e.token;
                        if (kind === brighterscript_1.TokenKind.StringLiteral) {
                            const { text } = e.token;
                            if (text !== '""') {
                                const name = text.toLowerCase();
                                if (map.has(name)) {
                                    fv.edges.push({
                                        name,
                                        range: e.token.range,
                                        file
                                    });
                                }
                            }
                        }
                    }
                }), { walkMode: brighterscript_1.WalkMode.visitExpressions });
            });
        });
    }
    afterProgramValidate(_) {
        if (!this.main) {
            throw new Error('No `main.brs`');
        }
        this.walkGraph({ name: this.main.name });
        this.vertices.forEach(v => {
            var _a;
            if (!this.walked.has(v.name) && v.file) {
                if ((0, brighterscript_1.isBrsFile)(v.file)) {
                    v.file.addDiagnostics([{
                            severity: brighterscript_1.DiagnosticSeverity.Warning,
                            code: UnusedCode.UnusedScript,
                            message: `Script '${v.file.pkgPath}' does not seem to be used`,
                            range: brighterscript_1.Range.create(0, 0, 1, 0),
                            file: v.file
                        }]);
                }
                else if ((_a = v.file.componentName) === null || _a === void 0 ? void 0 : _a.range) {
                    v.file.addDiagnostics([{
                            severity: brighterscript_1.DiagnosticSeverity.Warning,
                            code: UnusedCode.UnusedComponent,
                            message: `Component '${v.file.pkgPath}' does not seem to be used`,
                            range: v.file.componentName.range,
                            file: v.file
                        }]);
                }
            }
        });
    }
}
exports.default = CheckUsage;
function normalizePath(s) {
    let p = s.toLowerCase();
    if (isWin) {
        p = p.replace('\\', '/');
    }
    return p;
}
function createComponentEdge(name, range = null, file = null) {
    return {
        name: `"${name.toLowerCase()}"`,
        range,
        file
    };
}
//# sourceMappingURL=index.js.map