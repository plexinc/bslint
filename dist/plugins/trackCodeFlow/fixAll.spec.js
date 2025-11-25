"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const chai_1 = require("chai");
const brighterscript_1 = require("brighterscript");
const Linter_1 = require("../../Linter");
const index_1 = require("./index");
const index_2 = require("../../index");
const util_1 = require("../../util");
describe('trackCodeFlow fixAll', () => {
    let linter;
    let lintContext;
    let program;
    const project1 = {
        rootDir: 'test/project1'
    };
    const tempFile = `${project1.rootDir}/source/unused-parameter-temp.brs`;
    const sourceFile = `${project1.rootDir}/source/unused-parameter.brs`;
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
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        fs.copyFileSync(sourceFile, tempFile);
    });
    afterEach(() => {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
    });
    it('fixes unused parameter when fixAll is true', async () => {
        await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-parameter-temp.brs'], rules: {
                'unused-parameter': 'error'
            }, fix: true, fixAll: true }));
        await lintContext.applyFixes();
        const content = fs.readFileSync(tempFile).toString();
        (0, chai_1.expect)(content).to.contain('sub error1(_unusedParam)');
    });
    it('does not fix unused parameter when fixAll is false', async () => {
        await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-parameter-temp.brs'], rules: {
                'unused-parameter': 'error'
            }, fix: true, fixAll: false }));
        await lintContext.applyFixes();
        const content = fs.readFileSync(tempFile).toString();
        (0, chai_1.expect)(content).to.contain('sub error1(unusedParam)');
    });
    it('does not fix unused parameter when fixAll is missing', async () => {
        await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-parameter-temp.brs'], rules: {
                'unused-parameter': 'error'
            }, fix: true }));
        await lintContext.applyFixes();
        const content = fs.readFileSync(tempFile).toString();
        (0, chai_1.expect)(content).to.contain('sub error1(unusedParam)');
    });
    it('fixes unused parameter when fixAll is true and fix is not provided', async () => {
        await linter.run(Object.assign(Object.assign({}, project1), { files: ['source/unused-parameter-temp.brs'], rules: {
                'unused-parameter': 'error'
            }, fixAll: true }));
        await lintContext.applyFixes();
        const content = fs.readFileSync(tempFile).toString();
        (0, chai_1.expect)(content).to.contain('sub error1(_unusedParam)');
    });
});
//# sourceMappingURL=fixAll.spec.js.map