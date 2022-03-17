# jinqu-ng-http
Jinqu Angular HttpClient Ajax provider
for the [jinqu-odata](https://github.com/jin-qu/jinqu-odata) ODataService.<br/>
Usage:<br/>
```
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ODataService, IODataQuery, ODataQuery } from 'jinqu-odata';

import { AngularHttpProvider } from 'jinqu-ng-http';
import { Product } from '../model/all-models';

@Injectable()
export class NorthwindContext extends ODataService {
  constructor(http: HttpClient) {
    super('api/', new AngularHttpProvider(http));
  }

  get products(): IODataQuery<Product> { return this.createQuery<Product>('products'); }
}
```
<h3>Date/Time values</h3>
By default jinqu-odata represents OData Date and DateTimeOffset values as strings. You may want to represent them as Date objects in your data model.
JSON.stringify() automatically converts Date objects to ISO 8601 format with zero timezone when data is being sent, but JSON.parse() leaves dates as
strings on reception.
You may pass one of the predefined JSON converter static classes (JsonDateOnlyConverter, JsonDateTimeOffsetConverter or JsonDateConverter) as the
second parameter to the AngularHttpProvider constructor, e.g.
```
import { AngularHttpProvider, JsonDateConverter } from 'jinqu-ng-http';
...
const ngHttpProv = new AngularHttpProvider(http, JsonDateConverter);
```
Built-in converters makes conversion from string to Date object if a property value matches the respective RegExp mask:
- JsonDateOnlyConverter: convertes OData Date values (e.g. '2012-12-03');
- JsonDateTimeOffsetConverter: convertes DateTimeOffset values (e.g. '2012-12-03T07:16:23Z');
- JsonDateConverter: covers both cases.

You may want to use [ts-odata-model-gen](https://github.com/buchatsky/ts-odata-model-gen) with --useDateProps option to generate data models with
Edm.Date and Edm.DateTimeOffset fields as Date objects from OData service $metadata endpoint.

<h3>Custom converter</h3>
You can also write your own implementation of IJsonConverter interface in order to take full control over any data conversion upon sending or receiving:
```
export class SomeJsonConverter {
    // receive
    public static revive(key: string, value: any): any {
        if (typeof value === 'string' && value === "orange") {
            return "potatoes";
        } else {
            return value;
        }
    }
    // send
    public static replace(key: string, value: any): any {
        if (typeof value === 'string' && key === "product") {
            return 'orange';
        } else {
            return value;
        }
    }
}
```
SomeJsonConverter.revive and SomeJsonConverter.replace will be passed as the second argument to JSON.parse() and JSON.stringify() respectively.