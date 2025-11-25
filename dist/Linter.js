"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJob = void 0;
const brighterscript_1 = require("brighterscript");
const pendingJobs = [];
// allow some asynchronous jobs to run after the compiler has finished its work
function addJob(job) {
    pendingJobs.push(job);
    return job;
}
exports.addJob = addJob;
class Linter {
    constructor() {
        this.builder = new brighterscript_1.ProgramBuilder();
    }
    async run(config) {
        try {
            const options = Object.assign(Object.assign({}, config), { createPackage: false, copyToStaging: false });
            await this.builder.run(options);
            await Promise.all(pendingJobs);
            return this.builder.getDiagnostics();
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    }
}
exports.default = Linter;
//# sourceMappingURL=Linter.js.map