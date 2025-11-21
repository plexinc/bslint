import { BscFile, BsDiagnostic, Range } from 'brighterscript';
import { ChangeEntry, replaceText } from '../../textEdit';
import { VarLintError } from './varTracking';

export function extractFixes(
    addFixes: (file: BscFile, changes: ChangeEntry) => void,
    diagnostics: BsDiagnostic[],
    fixAll?: boolean
): BsDiagnostic[] {
    return diagnostics.filter(diagnostic => {
        if (diagnostic.data?.isExperimental && !fixAll) {
            return true;
        }
        const fix = getFixes(diagnostic, fixAll);
        if (fix) {
            addFixes(diagnostic.file, fix);
            return false;
        }
        return true;
    });
}

export function getFixes(diagnostic: BsDiagnostic, fixAll?: boolean): ChangeEntry {
    switch (diagnostic.code) {
        case VarLintError.CaseMismatch:
            return fixCasing(diagnostic);
        case VarLintError.UnusedParameter:
            return fixUnusedParameter(diagnostic);
        default:
            return null;
    }
}

function fixCasing(diagnostic: BsDiagnostic) {
    const data: { name: string; range: Range } = diagnostic.data;
    return {
        diagnostic,
        changes: [
            replaceText(data.range, data.name)
        ]
    };
}

function fixUnusedParameter(diagnostic: BsDiagnostic) {
    const data: { name: string; range: Range } = diagnostic.data;
    const newName = `_${data.name}`;
    return {
        diagnostic,
        changes: [
            replaceText(data.range, newName, data.name)
        ]
    };
}
