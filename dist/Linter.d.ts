import { BsLintConfig } from './index';
import { ProgramBuilder } from 'brighterscript';
export declare function addJob(job: Promise<void>): Promise<void>;
export default class Linter {
    builder: ProgramBuilder;
    constructor();
    run(config: BsLintConfig): Promise<import("brighterscript").BsDiagnostic[]>;
}
