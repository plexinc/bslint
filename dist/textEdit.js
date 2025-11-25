"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFixesToEvent = exports.applyFixes = exports.applyEdits = exports.rangeToOffset = exports.getLineOffsets = exports.comparePos = exports.compareRanges = exports.insertText = exports.replaceText = void 0;
const fs_1 = require("fs");
const fs_extra_1 = require("fs-extra");
const brighterscript_1 = require("brighterscript");
const CodeActionUtil_1 = require("brighterscript/dist/CodeActionUtil");
function replaceText(range, text, expectedText) {
    return {
        type: 'replace',
        range,
        text,
        expectedText
    };
}
exports.replaceText = replaceText;
function insertText(pos, text) {
    return {
        type: 'insert',
        range: brighterscript_1.Range.create(pos, pos),
        text
    };
}
exports.insertText = insertText;
function compareRanges(a, b) {
    if (!a || !b || !a.range || !b.range) {
        return 0;
    }
    const result = comparePos(a.range.start, b.range.start);
    return result === 0 ? comparePos(a.range.end, b.range.end) : result;
}
exports.compareRanges = compareRanges;
function comparePos(a, b) {
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
exports.comparePos = comparePos;
function getLineOffsets(src) {
    if (!src) {
        return [];
    }
    const offsets = [];
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
exports.getLineOffsets = getLineOffsets;
function rangeToOffset(lineOffsets, range) {
    const { start, end } = range;
    if (isNaN(lineOffsets[start.line]) || isNaN(lineOffsets[end.line])) {
        return null;
    }
    return {
        start: lineOffsets[start.line] + start.character,
        end: lineOffsets[end.line] + end.character
    };
}
exports.rangeToOffset = rangeToOffset;
function applyEdits(src, entries) {
    const lineOffsets = getLineOffsets(src);
    // flatten while keeping diagnostic reference
    const editsWithDiag = entries.flatMap(entry => entry.changes.map(edit => ({ edit, diagnostic: entry.diagnostic })));
    const sortedEdits = [...editsWithDiag].sort((a, b) => compareRanges(a.edit, b.edit)).reverse();
    let newSrc = src;
    const skippedEdits = [];
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
exports.applyEdits = applyEdits;
async function applyFixes(fix, pendingFixes) {
    if (!fix || !pendingFixes || pendingFixes.size === 0) {
        return;
    }
    for (const file of pendingFixes.keys()) {
        const entries = pendingFixes.get(file);
        if ((entries === null || entries === void 0 ? void 0 : entries.length) && (0, fs_1.existsSync)(file)) {
            const src = (await (0, fs_extra_1.readFile)(file)).toString();
            const { newSrc, skippedEdits } = applyEdits(src, entries);
            if (skippedEdits.length > 0) {
                skippedEdits.forEach((skipped) => {
                    console.warn(`Skipped fix in ${file} at range [${skipped.startOffset}, ${skipped.endOffset}]: ` +
                        `expected "${skipped.edit.expectedText}", found "${skipped.foundText}"\n` +
                        `Diagnostic: ${skipped.diagnostic.message}`);
                });
            }
            else if (newSrc !== src) {
                await (0, fs_extra_1.writeFile)(file, newSrc);
            }
        }
        pendingFixes.delete(file);
    }
}
exports.applyFixes = applyFixes;
function addFixesToEvent(event) {
    return (file, entry) => {
        const changes = entry.changes.map(change => ({
            type: 'replace',
            filePath: file.pathAbsolute,
            range: change.range,
            newText: change.text
        }));
        const action = {
            title: entry.diagnostic.message,
            diagnostics: [entry.diagnostic],
            kind: CodeActionUtil_1.CodeActionKind.QuickFix,
            isPreferred: true,
            changes
        };
        event.codeActions.push(CodeActionUtil_1.codeActionUtil.createCodeAction(action));
    };
}
exports.addFixesToEvent = addFixesToEvent;
//# sourceMappingURL=textEdit.js.map