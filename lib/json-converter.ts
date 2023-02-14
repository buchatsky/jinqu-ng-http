import { dateToISOLocalString } from "./date-utils";

export interface IJsonConverter {
    // from JSON
    revive?(this: any, key: string, val: any): any;
    // to JSON
    replace?(this: any, key: string, value: any): any;
}

export class JsonDateOnlyConverter /*implements IJsonConverter*/ {
    protected static Mask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/;

    public static revive(this: any, key: string, value: any): any {
        if (typeof value === 'string' && JsonDateOnlyConverter.Mask.test(value)) {
            return new Date(value);
        } else {
            return value;
        }
    }
}

// tslint:disable-next-line: max-classes-per-file
export class JsonDateTimeOffsetConverter /*implements IJsonConverter*/ {
    protected static Mask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?([+-]([01]\d|2[0-3]):[0-5]\d|Z)$/;

    public static revive(this: any, key: string, value: any): any {
        if (typeof value === 'string' && JsonDateTimeOffsetConverter.Mask.test(value)) {
            return new Date(value);
        } else {
            return value;
        }
    }

    public static replace(this: any, key: string, value: any): any {
        let origValue = this[key];
        if (origValue instanceof Date && !isNaN(origValue.valueOf())) {
            return dateToISOLocalString(origValue);
        } else {
            return value;
        }
    }
}

// tslint:disable-next-line: max-classes-per-file
export class JsonDateConverter /*implements IJsonConverter*/ {
    protected static Mask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?([+-]([01]\d|2[0-3]):[0-5]\d|Z))?$/;

    public static revive(this: any, key: string, value: any): any {
        if (typeof value === 'string' && JsonDateConverter.Mask.test(value)) {
            return new Date(value);
        } else {
            return value;
        }
    }
}
