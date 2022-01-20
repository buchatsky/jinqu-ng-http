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
