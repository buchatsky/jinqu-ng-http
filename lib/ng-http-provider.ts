import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { AjaxOptions, AjaxResponse, IAjaxProvider, mergeAjaxOptions, Value } from "jinqu";

export class AngularHttpProvider implements IAjaxProvider<Response> {

    public static readonly defaultOptions: AjaxOptions = {
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        method: "GET",
    };

    constructor(protected http: HttpClient) { }

    public ajax<T>(o: AjaxOptions): Promise<Value<T> & AjaxResponse<Response>> {
        if (o.params && o.params.length) {
            o.url += "?" + o.params.map((p) => `${p.key}=${encodeURIComponent(p.value)}`).join("&");
        }

        const d = Object.assign({}, AngularHttpProvider.defaultOptions);
        o = mergeAjaxOptions(d, o);

        // credentials (present in fetch RequestInit, absent in AjaxOptions)
        //let ngWithCredentials = o.credentials && o.credentials == "include" ? true : false;

        const promise = this.http.request(<string>o.method, <string>o.url, {
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
                /*let respHeaders = new Headers();
                ngResponse.headers.keys().forEach((key: string) => {
                    respHeaders.append(key, ngResponse.headers.get(key)!);
                });
                */
                // hackish
                let respHeaders = ngResponse.headers.keys().reduce(((ret, key: string) => (ret[key] = ngResponse.headers.get(key)) && ret), <any>{});

                let response = new Response(ngResponse.body, {
                    headers: respHeaders,
                    status: ngResponse.status,
                    statusText: ngResponse.statusText
                });

                // body stream read
                return response.json()
                    .then((value: T) => ({ value, response }));
                    
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
