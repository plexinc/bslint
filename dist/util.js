"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = exports.mergeConfigs = exports.normalizeConfig = exports.getDefaultSeverity = exports.getDefaultRules = void 0;
const jsonc_parser_1 = require("jsonc-parser");
const minimatch = require("minimatch");
const fs_1 = require("fs");
const path = require("path");
const brighterscript_1 = require("brighterscript");
const textEdit_1 = require("./textEdit");
const Linter_1 = require("./Linter");
function getDefaultRules() {
    return {
        'assign-all-paths': 'error',
        'unsafe-path-loop': 'error',
        'unsafe-iterators': 'error',
        'unreachable-code': 'info',
        'case-sensitivity': 'warn',
        'unused-variable': 'warn',
        'unused-parameter': 'warn',
        // 'no-stop': 'off',
        'consistent-return': 'error',
        // 'only-function': 'off',
        // 'only-sub': 'off',
        'inline-if-style': 'then',
        'block-if-style': 'no-then',
        'condition-style': 'no-group',
        'named-function-style': 'auto',
        'anon-function-style': 'auto',
        'aa-comma-style': 'no-dangling',
        'type-annotations': 'off',
        'no-print': 'off',
        'no-assocarray-component-field-type': 'off',
        'no-array-component-field-type': 'off',
        'no-regex-duplicates': 'off'
    };
}
exports.getDefaultRules = getDefaultRules;
function getDefaultSeverity() {
    return rulesToSeverity(getDefaultRules());
}
exports.getDefaultSeverity = getDefaultSeverity;
function normalizeConfig(options) {
    const baseConfig = {
        rules: getDefaultRules()
    };
    const projectConfig = mergeConfigs(loadConfig(options), { rules: options.rules });
    const result = mergeConfigs(baseConfig, projectConfig);
    if (result.fixAll) {
        result.fix = true;
    }
    return result;
}
exports.normalizeConfig = normalizeConfig;
function mergeConfigs(a, b) {
    return Object.assign(Object.assign(Object.assign({}, a), b), { rules: Object.assign(Object.assign({}, (a.rules || {})), (b.rules || {})) });
}
exports.mergeConfigs = mergeConfigs;
function loadConfig(options) {
    if (options.lintConfig) {
        const bsconfig = tryLoadConfig(options.lintConfig);
        if (bsconfig) {
            return Object.assign(Object.assign({}, options), bsconfig);
        }
        else {
            throw new Error(`Configuration file '${options.lintConfig}' not found`);
        }
    }
    if (options.project) {
        const bsconfig = tryLoadConfig(path.join(path.dirname(options.project), 'bslint.json'));
        if (bsconfig) {
            return Object.assign(Object.assign({}, options), bsconfig);
        }
    }
    if (options.rootDir) {
        const bsconfig = tryLoadConfig(path.join(options.rootDir, 'bslint.json'));
        if (bsconfig) {
            return Object.assign(Object.assign({}, options), bsconfig);
        }
    }
    const bsconfig = tryLoadConfig('./bslint.json');
    if (bsconfig) {
        return Object.assign(Object.assign({}, options), bsconfig);
    }
    return options;
}
function tryLoadConfig(filename) {
    if (!(0, fs_1.existsSync)(filename)) {
        return undefined;
    }
    const bserrors = [];
    const bsconfig = (0, jsonc_parser_1.parse)((0, fs_1.readFileSync)(filename).toString(), bserrors);
    if (bserrors.length) {
        throw new Error(`Invalid bslint configuration file '${filename}': ${bserrors}`);
    }
    return bsconfig;
}
function createContext(program) {
    const { rules, fix, fixAll, checkUsage, globals, ignores } = normalizeConfig(program.options);
    const ignorePatterns = (ignores || []).map(pattern => {
        return pattern.startsWith('**/') ? pattern : '**/' + pattern;
    });
    const pendingFixes = new Map();
    return {
        program: program,
        severity: rulesToSeverity(rules),
        todoPattern: rules['todo-pattern'] ? new RegExp(rules['todo-pattern']) : /TODO|todo|FIXME/,
        globals,
        ignores: (file) => {
            return !file || ignorePatterns.some(pattern => minimatch(file.pathAbsolute, pattern));
        },
        fix,
        fixAll,
        checkUsage,
        addFixes: (file, entry) => {
            if (!pendingFixes.has(file.pathAbsolute)) {
                pendingFixes.set(file.pathAbsolute, [entry]);
            }
            else {
                pendingFixes.get(file.pathAbsolute).push(entry);
            }
        },
        applyFixes: () => (0, Linter_1.addJob)((0, textEdit_1.applyFixes)(fix, pendingFixes)),
        pendingFixes
    };
}
exports.createContext = createContext;
function rulesToSeverity(rules) {
    return {
        assignAllPath: ruleToSeverity(rules['assign-all-paths']),
        unreachableCode: ruleToSeverity(rules['unreachable-code']),
        unsafePathLoop: ruleToSeverity(rules['unsafe-path-loop']),
        unsafeIterators: ruleToSeverity(rules['unsafe-iterators']),
        caseSensitivity: ruleToSeverity(rules['case-sensitivity']),
        unusedVariable: ruleToSeverity(rules['unused-variable']),
        unusedParameter: ruleToSeverity(rules['unused-parameter']),
        consistentReturn: ruleToSeverity(rules['consistent-return']),
        inlineIfStyle: rules['inline-if-style'],
        blockIfStyle: rules['block-if-style'],
        conditionStyle: rules['condition-style'],
        namedFunctionStyle: rules['named-function-style'],
        anonFunctionStyle: rules['anon-function-style'],
        aaCommaStyle: rules['aa-comma-style'],
        typeAnnotations: rules['type-annotations'],
        noPrint: ruleToSeverity(rules['no-print']),
        noTodo: ruleToSeverity(rules['no-todo']),
        noStop: ruleToSeverity(rules['no-stop']),
        eolLast: rules['eol-last'],
        colorFormat: rules['color-format'],
        colorCase: rules['color-case'],
        colorAlpha: rules['color-alpha'],
        colorAlphaDefaults: rules['color-alpha-defaults'],
        colorCertCompliant: rules['color-cert'],
        noAssocarrayComponentFieldType: ruleToSeverity(rules['no-assocarray-component-field-type']),
        noArrayComponentFieldType: ruleToSeverity(rules['no-array-component-field-type']),
        noRegexDuplicates: ruleToSeverity(rules['no-regex-duplicates'])
    };
}
function ruleToSeverity(rule) {
    switch (rule) {
        case 'error':
            return brighterscript_1.DiagnosticSeverity.Error;
        case 'warn':
            return brighterscript_1.DiagnosticSeverity.Warning;
        case 'info':
            return brighterscript_1.DiagnosticSeverity.Information;
        default:
            return brighterscript_1.DiagnosticSeverity.Hint;
    }
}
//# sourceMappingURL=util.js.map