import * as fs from 'fs';
import { expect } from 'chai';
import { Program } from 'brighterscript';
import Linter from '../../Linter';
import TrackCodeFlow from './index';
import bslintFactory from '../../index';
import { createContext, PluginWrapperContext } from '../../util';

describe('trackCodeFlow fixAll', () => {
    let linter: Linter;
    let lintContext: PluginWrapperContext;
    let program: Program;
    const project1 = {
        rootDir: 'test/project1'
    };
    const tempFile = `${project1.rootDir}/source/unused-parameter-temp.brs`;
    const sourceFile = `${project1.rootDir}/source/unused-parameter.brs`;

    beforeEach(() => {
        linter = new Linter();
        program = new Program({});
        program.plugins.add(bslintFactory());
        program.plugins.emit('afterProgramCreate', program);

        linter.builder.plugins.add({
            name: 'test',
            afterProgramCreate: (program: Program) => {
                lintContext = createContext(program);
                const trackCodeFlow = new TrackCodeFlow(lintContext);
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
        await linter.run({
            ...project1,
            files: ['source/unused-parameter-temp.brs'],
            rules: {
                'unused-parameter': 'error'
            },
            fix: true,
            fixAll: true
        } as any);

        await lintContext.applyFixes();

        const content = fs.readFileSync(tempFile).toString();
        expect(content).to.contain('sub error1(_unusedParam)');
    });

    it('does not fix unused parameter when fixAll is false', async () => {
        await linter.run({
            ...project1,
            files: ['source/unused-parameter-temp.brs'],
            rules: {
                'unused-parameter': 'error'
            },
            fix: true,
            fixAll: false
        } as any);

        await lintContext.applyFixes();

        const content = fs.readFileSync(tempFile).toString();
        expect(content).to.contain('sub error1(unusedParam)');
    });

    it('does not fix unused parameter when fixAll is missing', async () => {
        await linter.run({
            ...project1,
            files: ['source/unused-parameter-temp.brs'],
            rules: {
                'unused-parameter': 'error'
            },
            fix: true
        } as any);

        await lintContext.applyFixes();

        const content = fs.readFileSync(tempFile).toString();
        expect(content).to.contain('sub error1(unusedParam)');
    });

    it('fixes unused parameter when fixAll is true and fix is not provided', async () => {
        await linter.run({
            ...project1,
            files: ['source/unused-parameter-temp.brs'],
            rules: {
                'unused-parameter': 'error'
            },
            fixAll: true
        } as any);

        await lintContext.applyFixes();

        const content = fs.readFileSync(tempFile).toString();
        expect(content).to.contain('sub error1(_unusedParam)');
    });
});
