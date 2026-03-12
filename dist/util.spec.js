"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const jsonc_parser_1 = require("jsonc-parser");
const fs_1 = require("fs");
const chai_1 = require("chai");
const brighterscript_1 = require("brighterscript");
describe('normalizeConfig', () => {
    const cwd = process.cwd();
    const bslint1Base = (0, jsonc_parser_1.parse)((0, fs_1.readFileSync)('test/project1/bslint.json').toString());
    const bslint1Defaults = (0, util_1.mergeConfigs)({ rules: (0, util_1.getDefaultRules)() }, bslint1Base);
    afterEach(() => {
        process.chdir(cwd);
    });
    it('should load specified config', () => {
        const options = {
            lintConfig: 'test/project1/bslint.json'
        };
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual).deep.equal(Object.assign(Object.assign({}, options), bslint1Defaults));
    });
    it('should use `cwd` to locate the config', () => {
        const options = {
            cwd: 'test/project1',
            lintConfig: 'bslint.json'
        };
        process.chdir(options.cwd);
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual).deep.equal(Object.assign(Object.assign({}, options), bslint1Defaults));
    });
    it('should look for the default config file in the bsconfig.json location', () => {
        const options = {
            project: 'test/project1/bsconfig.json'
        };
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual).deep.equal(Object.assign(Object.assign({}, options), bslint1Defaults));
    });
    it('should look for the default config file in the rootDir location', () => {
        const options = {
            rootDir: 'test/project1'
        };
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual).deep.equal(Object.assign(Object.assign({}, options), bslint1Defaults));
    });
    it('should find the default config file in the current location', () => {
        const options = {
            cwd: 'test/project1'
        };
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual).deep.equal(Object.assign(Object.assign({}, options), bslint1Defaults));
    });
    it('should combine rules', () => {
        const options = {
            cwd: 'test/project1',
            rules: {
                'unreachable-code': 'error',
                'consistent-return': 'off'
            }
        };
        const actual = (0, util_1.normalizeConfig)(options);
        (0, chai_1.expect)(actual.rules['unreachable-code']).equals('error');
        (0, chai_1.expect)(actual.rules['consistent-return']).equals('off');
    });
});
describe('resolveContext', () => {
    it('should support no ignores', () => {
        const program = new brighterscript_1.Program({});
        const context = (0, util_1.createContext)(program);
        const file = new brighterscript_1.BrsFile('test/project1/source/unused-variable.brs', 'pkg://unused-variable.brs', program);
        (0, chai_1.expect)(context.ignores(null)).equals(true);
        (0, chai_1.expect)(context.ignores(file)).equals(false);
    });
    it('should allow ignoring specific files', () => {
        const program = new brighterscript_1.Program({
            ignores: ['unused-variable.brs']
        });
        const context = (0, util_1.createContext)(program);
        const file1 = new brighterscript_1.BrsFile('test/project1/source/unused-variable.brs', 'pkg://unused-variable.brs', program);
        const file2 = new brighterscript_1.BrsFile('test/project1/source/block-if.brs', 'pkg://block-if.brs', program);
        (0, chai_1.expect)(context.ignores(null)).equals(true);
        (0, chai_1.expect)(context.ignores(file1)).equals(true);
        (0, chai_1.expect)(context.ignores(file2)).equals(false);
    });
    it('should allow ignoring globbed files', () => {
        const program = new brighterscript_1.Program({
            ignores: ['source/**/unused*', '**/*.spec.brs']
        });
        const context = (0, util_1.createContext)(program);
        const file1 = new brighterscript_1.BrsFile('test/project1/source/unused-variable.brs', 'pkg://unused-variable.brs', program);
        const file2 = new brighterscript_1.BrsFile('test/project1/source/block-if.brs', 'pkg://block-if.brs', program);
        const file3 = new brighterscript_1.BrsFile('test/project1/source/block-if.spec.brs', 'pkg://block-if.spec.brs', program);
        (0, chai_1.expect)(context.ignores(null)).equals(true);
        (0, chai_1.expect)(context.ignores(file1)).equals(true);
        (0, chai_1.expect)(context.ignores(file2)).equals(false);
        (0, chai_1.expect)(context.ignores(file3)).equals(true);
    });
});
//# sourceMappingURL=util.spec.js.map