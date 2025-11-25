import { BscFile, CallableContainerMap, Program, Scope } from 'brighterscript';
import { PluginContext } from '../../util';
export declare enum UnusedCode {
    UnusedComponent = "LINT4001",
    UnusedScript = "LINT4002"
}
export default class CheckUsage {
    name: string;
    private vertices;
    private map;
    private parsed;
    private walked;
    private main;
    constructor(_: PluginContext);
    private walkChildren;
    private walkGraph;
    afterFileValidate(file: BscFile): void;
    afterScopeValidate(scope: Scope, files: BscFile[], _: CallableContainerMap): void;
    afterProgramValidate(_: Program): void;
}
