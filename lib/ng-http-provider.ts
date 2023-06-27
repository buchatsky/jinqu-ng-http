import { HttpClient, HttpErrorResponse, HttpResponse, HttpResponseBase } from "@angular/common/http";
import { AjaxOptions, AjaxResponse, IAjaxProvider, mergeAjaxOptions, Value } from "jinqu";
import { IJsonConverter } from "./json-converter";

export class AngularHttpProvider<TConverter extends IJsonConverter | void = void> implements IAjaxProvider<HttpResponseBase> {

    public static readonly defaultOptions: AjaxOptions = {
        headers: {
            "Accept": "application/json; charset=utf-8",
            "Content-Type": "application/json; charset=utf-8",
        },
        method: "GET",
    };

    constructor(protected http: HttpClient, protected jsonConverter?: TConverter) { }

    public ajax<T>(o: AjaxOptions): Promise<Value<T> & AjaxResponse<HttpResponseBase>> {
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
            .then((response?: HttpResponse<Blob>) => {
                if (!response) {
                    return Promise.reject(new Error("Request failed"));
                }

                // body stream read
                return response.body ?
                    response.body.text().then((value: string) => {
                        if (response.headers.get("content-type")?.split(';')[0] === "application/json") {
                            const reviver = this.jsonConverter? this.jsonConverter.revive : void 0;
                            value = JSON.parse(value, reviver);
                        }
                        return { value, response };
                    }) :
                    { response };
            },
            (error: HttpErrorResponse) => {
                if (error.status !== 0) {
                    // backend error
                    if (error.error && typeof error.error === "object") {
                        return (error.error as Blob).text().then(strBody => {
                            // error object
                            let objBody = void 0;
                            if (error.headers.get("content-type")?.split(';')[0] === "application/json") {
                                objBody = JSON.parse(strBody);
                            }
                            throw new HttpErrorResponse({
                                error: objBody ? objBody : strBody,
                                headers: error.headers,
                                status: error.status,
                                statusText: error.statusText,
                                url: error.url ? error.url : void 0
                            });
                        });
                    }
                }
                throw error;
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
