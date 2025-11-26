export declare type HorizontalAlignment = 'left' | 'middle' | 'right';
export declare type VerticalAlignment = 'top' | 'middle' | 'bottom';
export declare type ColumnSizing = 'stretch' | 'even';
export declare type TableOptions = {
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
