"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const chai_1 = require("chai");
const brighterscript_1 = require("brighterscript");
const Linter_1 = require("../../Linter");
const index_1 = require("./index");
const index_2 = require("../../index");
const util_1 = require("../../util");
const testHelpers_spec_1 = require("../../testHelpers.spec");
const varTracking_1 = require("./varTracking");
describe('trackCodeFlow', () => {
    let linter;
    let lintContext;
    let program;
    const project1 = {
        rootDir: 'test/project1'
    };
    beforeEach(() => {
        linter = new Linter_1.default();
        program = new brighterscript_1.Program({});
        program.plugins.add((0, index_2.default)());
        program.plugins.emit('afterProgramCreate', program);
        linter.builder.plugins.add({
            name: 'test',
            afterProgramCreate: (program) => {
                lintContext = (0, util_1.createContext)(program);
                const trackCodeFlow = new index_1.default(lintContext);
                program.plugins.add(trackCodeFlow);
            }
        });
    });
    it('properly tracks code flow between try/catch', () => {
        program.setFile('source/main.brs', `
            sub main()
                try
                    text1 = "a"
                    text2 = "b"
                catch e
                    text1 = "c"
                end try
                print text1
                print text2
            end sub
        `);
        program.validate();
        (0, testHelpers_spec_1.expectDiagnostics)(program, [{
                code: varTracking_1.VarLintError.UnsafeInitialization,
                message: `Not all the code paths assign 'text2'`,
                range: brighterscript_1.util.createRange(9, 22, 9, 27)
            }]);
    });
    it('detects use of uninitialized vars', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/uninitialized-vars.brs'], rules: {
                'consistent-return': 'off',
                'unused-variable': 'off'
            }, diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `02:LINT1001:Using uninitialised variable 'a' when this file is included in scope 'source'`,
            `06:LINT1001:Using uninitialised variable 'a' when this file is included in scope 'source'`,
            `10:LINT1001:Using uninitialised variable 'a' when this file is included in scope 'source'`,
            `16:LINT1001:Using uninitialised variable 'a' when this file is included in scope 'source'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('does not mark consts as uninitialised vars', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/const.bs'], rules: {
                'unused-variable': 'error'
            }, diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    describe('does not mark enums as uninitialised vars', () => {
        it('in a regular file', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/enums.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
        it('inside a class', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/enum-in-class.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [
                '04:1136:enum must be declared at the root level or within a namespace'
            ];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
        it('inside a namespace', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/enum-in-namespace.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
    });
    describe('namespaced functions', () => {
        it('does not mark as uninitialised vars when used within namespace', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/namespace-functions.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
        it('does not mark as uninitialised vars when used in a class within namespace', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/namespace-functions-in-class.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
        it('does mark as uninitialised vars when used outside of namespace', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/namespace-functions-outside-namespace.bs'], rules: {
                    'unused-variable': 'error'
                } }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [
                `11:1140:Cannot find function 'one'`,
                `11:LINT1001:Using uninitialised variable 'one' when this file is included in scope 'source'`
            ];
            (0, chai_1.expect)(actual).deep.equal(expected);
        });
    });
    it('implements assign-all-paths', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/assign-all-paths.brs'], rules: {
                'assign-all-paths': 'error',
                'consistent-return': 'off',
                'unused-variable': 'off'
            }, diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `06:LINT1003:Not all the code paths assign 'b'`,
            `16:LINT1003:Not all the code paths assign 'b'`,
            `25:LINT1003:Not all the code paths assign 'b'`,
            `42:LINT1003:Not all the code paths assign 'b'`,
            `51:LINT1003:Not all the code paths assign 'b'`,
            `62:LINT1003:Not all the code paths assign 'b'`,
            `71:LINT1003:Not all the code paths assign 'b'`,
            `83:LINT1003:Not all the code paths assign 'b'`,
            `85:LINT1003:Not all the code paths assign 'b'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('report errors for classes', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/class-methods.bs'], rules: {
                'assign-all-paths': 'error',
                'consistent-return': 'off',
                'unused-variable': 'off',
                'unused-parameter': 'off'
            }, diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `18:LINT1003:Not all the code paths assign 'b'`,
            `27:LINT1003:Not all the code paths assign 'b'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements unsafe-path-loop', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unsafe-path-loop.brs'], rules: {
                'unsafe-path-loop': 'error',
                'consistent-return': 'off',
                'unused-variable': 'off'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `05:LINT1003:Not all the code paths assign 'a'`,
            `15:LINT1003:Not all the code paths assign 'b'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements unsafe-iterators', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unsafe-iterators.brs'], rules: {
                'unsafe-iterators': 'error',
                'consistent-return': 'off',
                'unused-variable': 'off'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `05:LINT1002:Using iterator variable 'i' outside loop`,
            `14:LINT1002:Using iterator variable 'a' outside loop`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('supports catch error variable within catch branch', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/catch-statement.brs'], rules: {
                'consistent-return': 'off',
                'assign-all-paths': 'error'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `02:LINT1001:Using uninitialised variable 'err' when this file is included in scope 'source'`,
            `08:LINT1001:Using uninitialised variable 'err' when this file is included in scope 'source'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements unreachable-code', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unreachable-code.brs'], rules: {
                'unreachable-code': 'error',
                'consistent-return': 'off',
                'unused-variable': 'off'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `04:LINT2001:Unreachable code`,
            `10:LINT2001:Unreachable code`,
            `26:LINT2001:Unreachable code`,
            `41:LINT2001:Unreachable code`,
            `50:LINT2001:Unreachable code`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements case-sensitivity', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/case-sensitivity.brs'], rules: {
                'case-sensitivity': 'error',
                'unused-variable': 'off'
            }, diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `03:LINT1004:Variable 'A' was previously set with a different casing as 'a'`,
            `04:LINT1004:Variable 'A' was previously set with a different casing as 'a'`,
            `05:LINT1004:Variable 'A' was previously set with a different casing as 'a'`,
            `06:LINT1004:Variable 'A' was previously set with a different casing as 'a'`,
            `11:LINT1004:Variable 'A' was previously set with a different casing as 'a'`,
            `15:LINT1004:Variable 'a' was previously set with a different casing as 'A'`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements consistent-return', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/consistent-return.brs'], rules: {
                'consistent-return': 'error',
                'unused-variable': 'off'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `04:1141:Void sub may not return a value`,
            `04:LINT2002:Sub as void should not return a value`,
            `11:1141:Void function may not return a value`,
            `11:LINT2002:Function as void should not return a value`,
            `15:1142:Non-void sub must return a value`,
            `15:LINT2006:Sub should consistently return a value`,
            `18:LINT2004:Not all code paths return a value`,
            `22:1142:Non-void function must return a value`,
            `22:LINT2006:Function should consistently return a value`,
            `25:LINT2004:Not all code paths return a value`,
            `32:LINT2004:Not all code paths return a value`,
            `39:LINT2004:Not all code paths return a value`,
            `45:LINT2004:Not all code paths return a value`,
            `49:LINT2004:Not all code paths return a value`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements unused-variable', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-variable.brs'], rules: {
                'unused-variable': 'error'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `02:LINT1005:Variable 'a' is set but value is never used`,
            `08:LINT1005:Variable 'a' is set but value is never used`,
            `12:LINT1005:Variable 'a' is set but value is never used`,
            `21:LINT1005:Variable 'd' is set but value is never used`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements unused-parameter', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-parameter.brs'], rules: {
                'unused-parameter': 'error'
            } }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `01:LINT1006:Parameter 'unusedParam' is set but value is never used`,
            `06:LINT1006:Parameter 'unusedParamNoLocal' is set but value is never used`,
            `09:LINT1006:Parameter 'unusedParamNoLocal' is set but value is never used`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    it('implements globals', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/uninitialized-vars.brs'], rules: {
                'unused-variable': 'error'
            }, globals: ['a'], diagnosticFilters: [1001] }));
        const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
        const expected = [
            `14:LINT1005:Variable 'a' is set but value is never used`
        ];
        (0, chai_1.expect)(actual).deep.equal(expected);
    });
    describe('fix', () => {
        beforeEach(() => {
            fs.copyFileSync(`${project1.rootDir}/source/case-sensitivity.brs`, `${project1.rootDir}/source/case-sensitivity-temp.brs`);
        });
        afterEach(() => {
            fs.unlinkSync(`${project1.rootDir}/source/case-sensitivity-temp.brs`);
        });
        it('fixes inconsistent case', async () => {
            const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/case-sensitivity-temp.brs'], rules: {
                    'case-sensitivity': 'error'
                }, fix: true }));
            const actual = (0, testHelpers_spec_1.fmtDiagnostics)(diagnostics);
            const expected = [
                `11:LINT1005:Variable 'A' is set but value is never used`
            ];
            (0, chai_1.expect)(actual).deep.equal(expected);
            (0, chai_1.expect)(lintContext.pendingFixes.size).equals(1);
            await lintContext.applyFixes();
            (0, chai_1.expect)(lintContext.pendingFixes.size).equals(0);
            const actualSrc = fs.readFileSync(`${project1.rootDir}/source/case-sensitivity-temp.brs`).toString();
            const expectedSrc = fs.readFileSync(`${project1.rootDir}/source/case-sensitivity-fixed.brs`).toString();
            (0, chai_1.expect)(actualSrc.replace(/\r?\n/g, '\n')).to.equal(expectedSrc.replace(/\r?\n/g, '\n'));
        });
    });
});
//# sourceMappingURL=index.spec.js.map