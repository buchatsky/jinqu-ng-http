//import { IJsonConverter } from '../index';

export class JsonTestConverter /*implements IJsonConverter*/ {
    public static replace(/*this: any,*/key: string, value: any): any {
        if (typeof value === 'string' && key === "fld2") {
            return 'orange';
        } else {
            return value;
        }
    }
}
