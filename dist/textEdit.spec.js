"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const textEdit_1 = require("./textEdit");
describe('sortByRange', () => {
    it('Does not crash with invalid entries', () => {
        const aOK = { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 0) };
        const bOK = { range: vscode_languageserver_types_1.Range.create(1, 0, 1, 0) };
        const aKO = { range: null };
        const bKO = { range: null };
        const aKO2 = { range: {} };
        const bKO2 = { range: {} };
        const aKO3 = { range: { start: {} } };
        const bKO3 = { range: { start: {} } };
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(null, null)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(aOK, null)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(null, bOK)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(aKO, null)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(null, bKO)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(aKO2, null)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(null, bKO2)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(aKO3, null)).equals(0);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(null, bKO3)).equals(0);
    });
    it('Same range returns 0', () => {
        const a = { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 0) };
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(a, a)).equals(0);
    });
    it('Sort by lines', () => {
        const a = { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 0) };
        const b = { range: vscode_languageserver_types_1.Range.create(1, 0, 1, 0) };
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(a, b)).equals(-1);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(b, a)).equals(1);
    });
    it('Sort by column', () => {
        const a = { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 0) };
        const b = { range: vscode_languageserver_types_1.Range.create(0, 1, 0, 1) };
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(a, b)).equals(-1);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(b, a)).equals(1);
    });
    it('Sort by length', () => {
        const a = { range: vscode_languageserver_types_1.Range.create(0, 0, 1, 0) };
        const b = { range: vscode_languageserver_types_1.Range.create(0, 0, 1, 1) };
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(a, b)).equals(-1);
        (0, chai_1.expect)((0, textEdit_1.compareRanges)(b, a)).equals(1);
    });
});
describe('getLineOffsets', () => {
    it('Handle empty source', () => {
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)(null)).deep.equals([]);
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('')).deep.equals([]);
    });
    it('Finds simple offsets', () => {
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\nb\nc')).deep.equals([0, 2, 4]);
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\r\nb\r\nc')).deep.equals([0, 3, 6]);
    });
    it('Handles final linebreak', () => {
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\nb\nc\n')).deep.equals([0, 2, 4, 6]);
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\r\nb\r\nc\r\n')).deep.equals([0, 3, 6, 9]);
    });
    it('Handles initial linebreak', () => {
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('\na\nb\nc')).deep.equals([0, 1, 3, 5]);
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('\r\na\r\nb\r\nc')).deep.equals([0, 2, 5, 8]);
    });
    it('Handles inconsistent linebreaks', () => {
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\nb\r\nc')).deep.equals([0, 2, 5]);
        (0, chai_1.expect)((0, textEdit_1.getLineOffsets)('a\r\nb\nc')).deep.equals([0, 3, 5]);
    });
});
describe('applyEdits', () => {
    it('Edits in the right order', () => {
        const edits = [
            {
                diagnostic: { code: 0, message: 'dummy' },
                changes: [
                    { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 6), text: 'replaced line 1!' },
                    { range: vscode_languageserver_types_1.Range.create(1, 5, 1, 6), text: '(2)' }
                ]
            }
        ];
        const { newSrc } = (0, textEdit_1.applyEdits)('line 1\nline 2', edits);
        (0, chai_1.expect)(newSrc).equals('replaced line 1!\nline (2)');
    });
    it('Edits in the reverse order', () => {
        const edits = [
            {
                diagnostic: { code: 0, message: 'dummy' },
                changes: [
                    { range: vscode_languageserver_types_1.Range.create(1, 5, 1, 6), text: '(2)' },
                    { range: vscode_languageserver_types_1.Range.create(0, 0, 0, 6), text: 'replaced line 1!' }
                ]
            }
        ];
        const { newSrc } = (0, textEdit_1.applyEdits)('line 1\nline 2', edits);
        (0, chai_1.expect)(newSrc).equals('replaced line 1!\nline (2)');
    });
});
//# sourceMappingURL=textEdit.spec.js.map