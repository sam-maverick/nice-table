"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = void 0;
const wrap_ansi_1 = __importDefault(require("wrap-ansi"));
const string_width_1 = __importDefault(require("string-width"));
function createTable(items, keys, { horizontalAlignment = 'middle', verticalAlignment = 'middle', fullWidth = false, columnSizing = 'stretch', maxWidth = 80, indexColumn = false, throwIfTooSmall = true, stringify = String, } = {}) {
    let columnCount = keys.length;
    const columnNames = keys.map((key) => stringify(key));
    const tableContent = items.map((item) => keys.map((key) => stringify(item[key])));
    if (indexColumn) {
        columnNames.unshift('(index)');
        tableContent.forEach((row, i) => row.unshift(i.toString()));
        columnCount++;
    }
    const minimumWidth = 4 * columnCount + 1;
    if (maxWidth < minimumWidth) {
        const message = `The table does not fit. The width should be set to at least ${4 * columnCount + 1} (4 * ColumnCount + 1) for this table to fit (received width ${maxWidth}).`;
        if (throwIfTooSmall) {
            throw new Error(message);
        }
        else {
            return message;
        }
    }
    const availableColumnWidth = maxWidth - columnCount - 1; // each key/column has a │ on the left, and there is one │ at the end of each row
    const averageColumnWidth = Math.floor(availableColumnWidth / columnCount);
    const columnWidths = columnNames.map((columnName, i) => Math.max((0, string_width_1.default)(columnName), ...tableContent.map((row) => (0, string_width_1.default)(row[i]))) + 2);
    let overflow = columnWidths.reduce((a, b) => a + b, 0) - availableColumnWidth;
    switch (columnSizing) {
        case 'stretch': {
            if (overflow > 0) {
                shrinkColumns(columnWidths, averageColumnWidth, overflow);
                overflow = 0;
            }
            break;
        }
        case 'even': {
            const maxColumnWidth = Math.max(...columnWidths);
            for (let i = 0; i < columnWidths.length; i++) {
                columnWidths[i] = maxColumnWidth;
            }
            overflow = maxColumnWidth * columnCount - availableColumnWidth;
            if (overflow > 0) {
                shrinkColumns(columnWidths, averageColumnWidth, overflow);
                overflow = 0;
            }
            break;
        }
        default:
            throw new Error(`Unknown column sizing '${columnSizing}'`);
    }
    if (fullWidth && overflow < 0) {
        growColumns(columnWidths, averageColumnWidth, -overflow);
        overflow = 0;
    }
    for (const columnWidth of columnWidths) {
        if (columnWidth < 3) {
            throw new Error('Table does not fit. Please file a bug report as this error should not happen: https://github.com/timvandam/nice-table/issues/new');
        }
    }
    return [
        createTableTop(columnWidths),
        createTableColumnNames(columnNames, columnWidths, horizontalAlignment, verticalAlignment),
        createTableRows(tableContent, columnWidths, horizontalAlignment, verticalAlignment),
        createTableBottom(columnWidths),
    ]
        .filter((part) => part.trim().length > 0)
        .join('\n');
}
exports.createTable = createTable;
const TOP_LEFT = '┌';
const TOP_RIGHT = '┐';
const TOP_MIDDLE = '┬';
const BOTTOM_LEFT = '└';
const BOTTOM_RIGHT = '┘';
const BOTTOM_MIDDLE = '┴';
const LEFT_MIDDLE = '├';
const RIGHT_MIDDLE = '┤';
const MIDDLE = '┼';
const HORIZONTAL = '─';
const VERTICAL = '│';
function createTableTop(columnWidths) {
    return (TOP_LEFT + columnWidths.map((size) => HORIZONTAL.repeat(size)).join(TOP_MIDDLE) + TOP_RIGHT);
}
function createTableMiddleLine(columnWidths) {
    return (LEFT_MIDDLE + columnWidths.map((size) => HORIZONTAL.repeat(size)).join(MIDDLE) + RIGHT_MIDDLE);
}
function createTableBottom(columnWidths) {
    return (BOTTOM_LEFT +
        columnWidths.map((size) => HORIZONTAL.repeat(size)).join(BOTTOM_MIDDLE) +
        BOTTOM_RIGHT);
}
function centerText(str, width) {
    const strLength = (0, string_width_1.default)(str);
    const leftPadding = Math.floor((width - strLength) / 2);
    const rightPadding = width - strLength - leftPadding;
    return ' '.repeat(leftPadding) + str + ' '.repeat(rightPadding);
}
function createRow(cells, columnWidths, horizontalAlignment) {
    return (VERTICAL +
        columnWidths
            .map((columnWidth, i) => {
            const diff = columnWidth - (0, string_width_1.default)(cells[i]) - ' '.length;
            if (horizontalAlignment === 'left') {
                return ' ' + cells[i] + ' '.repeat(diff > 0 ? diff : 0);
            }
            else if (horizontalAlignment === 'right') {
                return (cells[i] + ' ').padStart(columnWidth, ' ');
            }
            else {
                return ' '.repeat(diff > 0 ? diff : 0) + cells[i] + ' ';
            }
        })
            .join(VERTICAL) +
        VERTICAL);
}
function createMultiLineRows(row, columnWidths, horizontalAlignment, verticalAlignment) {
    var _a;
    const cells = [];
    let rowHeight = 0;
    // Split single cells into multiple cells if they are too long
    for (let i = 0; i < columnWidths.length; i++) {
        const columnWidth = columnWidths[i];
        const cellLines = (0, wrap_ansi_1.default)(row[i], columnWidth - 2, {
            hard: true,
            trim: true,
            wordWrap: true,
        }).split('\n');
        cells.push(cellLines);
        rowHeight = Math.max(rowHeight, cellLines.length);
    }
    // Align cells vertically
    if (verticalAlignment !== 'top') {
        for (let i = 0; i < cells.length; i++) {
            const padding = (_a = {
                top: 0,
                middle: Math.floor((rowHeight - cells[i].length) / 2),
                bottom: rowHeight - cells[i].length,
            }[verticalAlignment]) !== null && _a !== void 0 ? _a : 0;
            cells[i].unshift(...Array(padding).fill(''));
        }
    }
    const cellRows = [];
    for (let i = 0; i < rowHeight; i++) {
        cellRows.push(cells.map((cell) => { var _a; return (_a = cell[i]) !== null && _a !== void 0 ? _a : ''; }));
    }
    return cellRows.map((row) => createRow(row, columnWidths, horizontalAlignment)).join('\n');
}
function createTableRows(tableContent, columnWidths, horizontalAlignment, verticalAlignment) {
    return tableContent
        .map((row) => createMultiLineRows(row, columnWidths, horizontalAlignment, verticalAlignment))
        .join('\n');
}
function createTableColumnNames(columnNames, columnWidths, horizontalAlignment, verticalAlignment) {
    return (createMultiLineRows(columnNames, columnWidths, horizontalAlignment, verticalAlignment) +
        '\n' +
        createTableMiddleLine(columnWidths));
}
/**
 * Shrink columns to fit the table width.
 * Can lead to negative widths columns if the minimum width is too low (taking $AvailableWidth / ColumnCount$ always works).
 */
function shrinkColumns(columnWidths, minimumWidth, overflow) {
    const bigColumnIndices = Array.from({ length: columnWidths.length }, (_, i) => i).filter((i) => columnWidths[i] > minimumWidth);
    let bigColumnsWidth = bigColumnIndices.reduce((totalWidth, columnIndex) => totalWidth + columnWidths[columnIndex], 0);
    const shrinkFactor = 1 - overflow / (bigColumnsWidth - bigColumnIndices.length * minimumWidth);
    for (const columnIndex of bigColumnIndices.slice(0, -1)) {
        const currentColumnWidth = columnWidths[columnIndex];
        const fixedWidth = Math.max(minimumWidth, Math.floor(shrinkFactor * currentColumnWidth));
        const widthReduction = currentColumnWidth - fixedWidth;
        columnWidths[columnIndex] = fixedWidth;
        overflow -= widthReduction;
        bigColumnsWidth -= widthReduction;
    }
    columnWidths[bigColumnIndices[bigColumnIndices.length - 1]] -= overflow;
}
/**
 * Grow small columns by a certain amount.
 */
function growColumns(columnWidths, minimumWidth, growth) {
    const smallColumnIndices = Array.from({ length: columnWidths.length }, (_, i) => i).filter((i) => columnWidths[i] < minimumWidth);
    let smallColumnsWidth = smallColumnIndices.reduce((totalWidth, columnIndex) => totalWidth + columnWidths[columnIndex], 0);
    const growFactor = 1 + growth / smallColumnsWidth;
    for (const columnIndex of smallColumnIndices.slice(0, -1)) {
        const currentColumnWidth = columnWidths[columnIndex];
        const fixedWidth = Math.floor(growFactor * currentColumnWidth);
        const widthGrowth = fixedWidth - currentColumnWidth;
        columnWidths[columnIndex] = fixedWidth;
        growth -= widthGrowth;
        smallColumnsWidth += widthGrowth;
    }
    columnWidths[smallColumnIndices[smallColumnIndices.length - 1]] += growth;
}
//# sourceMappingURL=index.js.map