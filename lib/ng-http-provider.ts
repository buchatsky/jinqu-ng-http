import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { AjaxOptions, AjaxResponse, IAjaxProvider, mergeAjaxOptions, Value } from "jinqu";

export const enum DateToObj {
    None = 0,
    Date = 1,
    DateTime = 2,
    DateTimeOffset = 4,
    All = 7
}

export class AngularHttpProvider implements IAjaxProvider<Response> {

    public static DateMask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])$/;
    public static DateTimeMask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?$/;
    public static DateTimeOffsetMask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?([+-]([01]\d|2[0-3]):[0-5]\d|Z)$/;
    public static AllMask = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?([+-]([01]\d|2[0-3]):[0-5]\d|Z))?$/;

    public static readonly defaultOptions: AjaxOptions = {
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        method: "GET",
    };

    constructor(protected http: HttpClient, protected dateToObj?: DateToObj) { }

    public ajax<T>(o: AjaxOptions): Promise<Value<T> & AjaxResponse<Response>> {
        if (o.params && o.params.length) {
            o.url += "?" + o.params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&");
        }

        const d = Object.assign({}, AngularHttpProvider.defaultOptions);
        o = mergeAjaxOptions(d, o);

        // credentials (present in fetch RequestInit, absent in AjaxOptions)
        //let ngWithCredentials = o.credentials && o.credentials == "include" ? true : false;

        const promise = this.http.request(o.method as string, o.url as string, {
            body: JSON.stringify(o.data),
            headers: o.headers,
            observe: 'response',
            reportProgress: false,
            responseType: 'blob',
            //withCredentials: ngWithCredentials
        }).toPromise()
            .then((ngResponse?: HttpResponse<Blob>) => {
                if (!ngResponse) {
                    return Promise.reject(new Error("Request failed"));
                }
                // vanilla
                /*const respHeaders = new Headers();
                ngResponse.headers.keys().forEach((key: string) => {
                    respHeaders.append(key, ngResponse.headers.get(key)!);
                });
                */
                // hackish
                const respHeaders = ngResponse.headers.keys().reduce(((ret, key: string) => (ret[key] = ngResponse.headers.get(key)) && ret), {} as any);

                const response = new Response(ngResponse.body, {
                    headers: respHeaders,
                    status: ngResponse.status,
                    statusText: ngResponse.statusText
                });

                // body stream read
                return response.body ?
                    response.text().then((txtVal: string) => {
                        const reviver = this.dateToObj ? (key: string, val: any) => {
                            if (typeof val === 'string' && this.matchDate(val)) {
                                return new Date(val);
                            } else {
                                return val;
                            }
                        } : void 0;

                        const value = JSON.parse(txtVal, reviver);
                        return { value, response };
                    }) :
                    { response };

                // body stream NOT read
                /*return ngResponse.body?.text()
                    .then((txtVal: string) => ({ value: JSON.parse(txtVal), response });
                */
            });

        if (!o.timeout) {
            return promise as any;
        }

        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), o.timeout),
            ),
        ]) as any;
    }

    protected matchDate(value: string): boolean {
        let ret: boolean = false;
        if (this.dateToObj === DateToObj.All) {
            ret = AngularHttpProvider.AllMask.test(value);
        } else {
            // tslint:disable-next-line: no-bitwise
            if (!ret && this.dateToObj! & DateToObj.Date) {
                ret = ret || AngularHttpProvider.DateMask.test(value);
            }
            // tslint:disable-next-line: no-bitwise
            if (!ret && this.dateToObj! & DateToObj.DateTimeOffset) {
                ret = ret || AngularHttpProvider.DateTimeOffsetMask.test(value);
            }
            // tslint:disable-next-line: no-bitwise
            if (!ret && this.dateToObj! & DateToObj.DateTime) {
                ret = ret || AngularHttpProvider.DateTimeMask.test(value);
            }
        }
        return ret;
    }
}
