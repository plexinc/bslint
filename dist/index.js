"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Linter = void 0;
const Linter_1 = require("./Linter");
exports.Linter = Linter_1.default;
const checkUsage_1 = require("./plugins/checkUsage");
const codeStyle_1 = require("./plugins/codeStyle");
const trackCodeFlow_1 = require("./plugins/trackCodeFlow");
const util_1 = require("./util");
function factory() {
    const contextMap = new WeakMap();
    return {
        name: 'bslint',
        afterProgramCreate: (program) => {
            const context = (0, util_1.createContext)(program);
            contextMap.set(program, context);
            const trackCodeFlow = new trackCodeFlow_1.default(context);
            program.plugins.add(trackCodeFlow);
            const codeStyle = new codeStyle_1.default(context);
            program.plugins.add(codeStyle);
            if (context.checkUsage) {
                const checkUsage = new checkUsage_1.default(context);
                program.plugins.add(checkUsage);
            }
        },
        afterProgramValidate: async (program) => {
            const context = contextMap.get(program);
            await context.applyFixes();
        }
    };
}
exports.default = factory;
//# sourceMappingURL=index.js.map