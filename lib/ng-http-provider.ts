import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { AjaxOptions, AjaxResponse, IAjaxProvider, mergeAjaxOptions, Value } from "jinqu";
import { IJsonConverter } from "./json-converter";

export class AngularHttpProvider<TConverter extends IJsonConverter | void = void> implements IAjaxProvider<Response> {

    public static readonly defaultOptions: AjaxOptions = {
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        method: "GET",
    };

    constructor(protected http: HttpClient, protected jsonConverter?: TConverter) { }

    public ajax<T>(o: AjaxOptions): Promise<Value<T> & AjaxResponse<Response>> {
        if (o.params && o.params.length) {
            o.url += "?" + o.params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&");
        }

        const d = Object.assign({}, AngularHttpProvider.defaultOptions);
        o = mergeAjaxOptions(d, o);

        // credentials (present in fetch RequestInit, absent in AjaxOptions)
        //let ngWithCredentials = o.credentials && o.credentials == "include" ? true : false;

        let txtData: string | undefined;
        if (o.data !== void 0) {
            const replacer = this.jsonConverter? this.jsonConverter.replace : void 0;
            txtData = JSON.stringify(o.data, replacer);
        }

        const promise = this.http.request(o.method as string, o.url as string, {
            body: txtData,
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
                        const reviver = this.jsonConverter? this.jsonConverter.revive : void 0;
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
}
