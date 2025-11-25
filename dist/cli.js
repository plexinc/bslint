#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yargs = require("yargs");
const brighterscript_1 = require("brighterscript");
const _1 = require(".");
const util_1 = require("./util");
const options = yargs
    .usage('$0', 'Bright(er)Script code linter')
    .option('cwd', { type: 'string', description: 'Override the current working directory.' })
    .option('files', {
    type: 'array',
    description: 'The list of files (or globs) to include in your project. Be sure to wrap these in double quotes when using globs.'
})
    .option('project', { type: 'string', description: 'Path to a bsconfig.json project file.' })
    .option('rootDir', {
    type: 'string',
    description: 'Path to the root of your project files (where the manifest lives). Defaults to current directory.'
})
    .option('lintConfig', { type: 'string', description: 'Path to a bslint.json configuration file.' })
    .option('fix', { type: 'boolean', description: 'Automatically fix minor issues (experimental)' })
    .option('fix-all', { type: 'boolean', description: 'Automatically fix all issues, including advanced code changes (experimental)' })
    .option('checkUsage', { type: 'boolean', description: 'Look for potentially unused components and scripts' })
    .option('watch', { type: 'boolean', defaultDescription: 'false', description: 'Watch input files.' }).argv;
async function run(options) {
    if (options.cwd) {
        process.chdir(options.cwd);
    }
    if (options.watch) {
        options.fix = false;
        options.fixAll = false;
    }
    const config = (0, util_1.normalizeConfig)(options);
    const linter = new _1.Linter();
    const diagnostics = await linter.run(config);
    // if this is a single run (i.e. not watch mode) and there are error diagnostics, return an error code
    const hasError = !!diagnostics.find((x) => x.severity === brighterscript_1.DiagnosticSeverity.Error);
    if (!config.watch && hasError) {
        process.exit(1);
    }
}
run(options).catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=cli.js.map