export type HorizontalAlignment = 'left' | 'middle' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type ColumnSizing = 'stretch' | 'even';
export type TableOptions = {
    maxWidth: number;
    columnSizing: ColumnSizing;
    horizontalAlignment: HorizontalAlignment;
    verticalAlignment: VerticalAlignment;
    fullWidth: boolean;
    throwIfTooSmall: boolean;
    indexColumn: boolean;
    stringify: (value: unknown) => string;
};
export declare function createTable<T extends object>(items: T[], keys: (keyof T)[], { horizontalAlignment, verticalAlignment, fullWidth, columnSizing, maxWidth, indexColumn, throwIfTooSmall, stringify, }?: Partial<TableOptions>): string;
