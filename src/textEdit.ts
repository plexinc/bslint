import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs-extra';
import { BscFile, BsDiagnostic, OnGetCodeActionsEvent, Position, Range } from 'brighterscript';
import { CodeActionKind, codeActionUtil } from 'brighterscript/dist/CodeActionUtil';

interface LintCodeAction {
    type: 'replace';
    filePath: string;
    range: Range;
    newText: string;
}

export interface TextEdit {
    range: Range;
    text: string;
    expectedText?: string;
}

export interface ChangeEntry {
    diagnostic: BsDiagnostic;
    changes: TextEdit[];
}

export function replaceText(range: Range, text: string, expectedText?: string) {
    return {
        type: 'replace',
        range,
        text,
        expectedText
    };
}

export function insertText(pos: Position, text: string) {
    return {
        type: 'insert',
        range: Range.create(pos, pos),
        text
    };
}

export function compareRanges(a: { range: Range }, b: { range: Range }): number {
    if (!a || !b || !a.range || !b.range) {
        return 0;
    }
    const result = comparePos(a.range.start, b.range.start);
    return result === 0 ? comparePos(a.range.end, b.range.end) : result;
}

export function comparePos(a: Position, b: Position) {
    if (!a || !b || isNaN(a.line) || isNaN(b.line)) {
        return 0;
    }
    if (a.line < b.line) {
        return -1;
    }
    if (a.line > b.line) {
        return 1;
    }
    if (isNaN(a.character) || isNaN(b.character)) {
        return 0;
    }
    if (a.character < b.character) {
        return -1;
    }
    if (a.character > b.character) {
        return 1;
    }
    return 0;
}

export function getLineOffsets(src: string) {
    if (!src) {
        return [];
    }
    const offsets: number[] = [];
    const reNL = /(\r\n|\n)/g;
    let m = reNL.exec(src);
    let index = 0;
    while (m) {
        offsets.push(index);
        index = m.index + m[0].length;
        m = reNL.exec(src);
    }
    offsets.push(index);
    return offsets;
}

export function rangeToOffset(lineOffsets: number[], range: Range) {
    const { start, end } = range;
    if (isNaN(lineOffsets[start.line]) || isNaN(lineOffsets[end.line])) {
        return null;
    }
    return {
        start: lineOffsets[start.line] + start.character,
        end: lineOffsets[end.line] + end.character
    };
}

export interface SkippedEditInfo {
    edit: TextEdit;
    diagnostic: BsDiagnostic;
    startOffset: number;
    endOffset: number;
    foundText: string;
}

export function applyEdits(src: string, entries: ChangeEntry[]) {
    const lineOffsets = getLineOffsets(src);
    // flatten while keeping diagnostic reference
    const editsWithDiag = entries.flatMap(entry => entry.changes.map(edit => ({ edit, diagnostic: entry.diagnostic })));

    const sortedEdits = [...editsWithDiag].sort((a, b) => compareRanges(a.edit, b.edit)).reverse();

    let newSrc = src;
    const skippedEdits: SkippedEditInfo[] = [];

    for (const { edit, diagnostic } of sortedEdits) {
        const offsets = rangeToOffset(lineOffsets, edit.range);
        if (!offsets) {
            continue;
        }

        if (edit.expectedText) {
            const currentText = newSrc.slice(offsets.start, offsets.end);
            if (currentText !== edit.expectedText) {
                skippedEdits.push({
                    edit,
                    diagnostic,
                    startOffset: offsets.start,
                    endOffset: offsets.end,
                    foundText: currentText
                });
                continue;
            }
        }

        newSrc = newSrc.slice(0, offsets.start) + edit.text + newSrc.slice(offsets.end);
    }

    return { newSrc, skippedEdits };
}

export async function applyFixes(
    fix: boolean,
    pendingFixes: Map<string, ChangeEntry[]>
) {
    if (!fix || !pendingFixes || pendingFixes.size === 0) {
        return;
    }

    for (const file of pendingFixes.keys()) {
        const entries = pendingFixes.get(file);
        if (entries?.length && existsSync(file)) {
            const src = (await readFile(file)).toString();
            const { newSrc, skippedEdits } = applyEdits(src, entries);

            if (skippedEdits.length > 0) {
                skippedEdits.forEach((skipped) => {
                    console.warn(
                        `Skipped fix in ${file} at range [${skipped.startOffset}, ${skipped.endOffset}]: ` +
                        `expected "${skipped.edit.expectedText}", found "${skipped.foundText}"\n` +
                        `Diagnostic: ${skipped.diagnostic.message}`
                    );
                });
            } else if (newSrc !== src) {
                await writeFile(file, newSrc);
            }
        }

        pendingFixes.delete(file);
    }
}

export function addFixesToEvent(event: OnGetCodeActionsEvent) {
    return (file: BscFile, entry: ChangeEntry) => {
        const changes: LintCodeAction[] = entry.changes.map(change => ({
            type: 'replace',
            filePath: file.pathAbsolute,
            range: change.range,
            newText: change.text
        }));
        const action = {
            title: entry.diagnostic.message,
            diagnostics: [entry.diagnostic],
            kind: CodeActionKind.QuickFix,
            isPreferred: true,
            changes
        };
        event.codeActions.push(codeActionUtil.createCodeAction(action));
    };
}
