import { BscFile, BsDiagnostic, OnGetCodeActionsEvent, Position, Range } from 'brighterscript';
export interface TextEdit {
    range: Range;
    text: string;
    expectedText?: string;
}
export interface ChangeEntry {
    diagnostic: BsDiagnostic;
    changes: TextEdit[];
}
export declare function replaceText(range: Range, text: string, expectedText?: string): {
    type: string;
    range: Range;
    text: string;
    expectedText: string;
};
export declare function insertText(pos: Position, text: string): {
    type: string;
    range: Range;
    text: string;
};
export declare function compareRanges(a: {
    range: Range;
}, b: {
    range: Range;
}): number;
export declare function comparePos(a: Position, b: Position): 0 | 1 | -1;
export declare function getLineOffsets(src: string): number[];
export declare function rangeToOffset(lineOffsets: number[], range: Range): {
    start: number;
    end: number;
};
export interface SkippedEditInfo {
    edit: TextEdit;
    diagnostic: BsDiagnostic;
    startOffset: number;
    endOffset: number;
    foundText: string;
}
export declare function applyEdits(src: string, entries: ChangeEntry[]): {
    newSrc: string;
    skippedEdits: SkippedEditInfo[];
};
export declare function applyFixes(fix: boolean, pendingFixes: Map<string, ChangeEntry[]>): Promise<void>;
export declare function addFixesToEvent(event: OnGetCodeActionsEvent): (file: BscFile, entry: ChangeEntry) => void;
