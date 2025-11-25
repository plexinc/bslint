"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Linter_1 = require("../../Linter");
const util_1 = require("../../util");
const index_1 = require("./index");
const testHelpers_spec_1 = require("../../testHelpers.spec");
describe('checkUsage', () => {
    let linter;
    let lintContext;
    const project1 = {
        rootDir: 'test/project1'
    };
    beforeEach(() => {
        linter = new Linter_1.default();
        linter.builder.plugins.add({
            name: 'test',
            afterProgramCreate: (program) => {
                lintContext = (0, util_1.createContext)(program);
                const checkUsage = new index_1.default(lintContext);
                program.plugins.add(checkUsage);
            }
        });
    });
    it('detects component refered by name in main.brs', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: [
                'source/main.brs',
                'components/parent.brs', 'components/parent.xml'
            ], rules: {} }));
        (0, testHelpers_spec_1.expectDiagnosticsFmt)(diagnostics, []);
    });
    it('detects component refered as child', async () => {
        const diagnostics = await linter.run(Object.assign(Object.assign({}, project1), { files: [
                'source/main.brs',
                'components/parent.brs', 'components/parent.xml',
                'components/child1.brs', 'components/child1.xml',
                'components/child2.brs', 'components/child2.xml'
            ], rules: {} }));
        (0, testHelpers_spec_1.expectDiagnosticsFmt)(diagnostics, [
            `01:LINT4002:Script 'components${path.sep}child2.brs' does not seem to be used`,
            `02:LINT4001:Component 'components${path.sep}child2.xml' does not seem to be used`
        ]);
    });
});
//# sourceMappingURL=index.spec.js.map