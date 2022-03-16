import { HttpClient } from '@angular/common/http';
// waitForAsync is used if the test body contains async calls, no need in Jasmine's done()
import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AngularHttpProvider, JsonDateConverter, JsonDateOnlyConverter, JsonDateTimeOffsetConverter } from '../index';
import { JsonTestConverter } from './fixture';

const emptyResponse = {};

describe('HttpClient tests', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    //let fetchProvider: AngularHttpProvider;

    // must be waitForAsync'ed if tests are waitForAsync'ed
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            //providers: [ AngularHttpProvider ] // if @Inject'ed
        });

        httpMock = TestBed.inject(HttpTestingController);
        http = TestBed.inject(HttpClient);
        //fetchProvider = new AngularHttpProvider(http);
    }));

    // must be waitForAsync'ed if tests are waitForAsync'ed
    afterEach(waitForAsync(() => {
        httpMock.verify();
    }));

    it('should get http headers & value', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual(emptyResponse);
                expect(r.response.headers.get('content-type')).toEqual('application/json');
                expect(r.response.headers.get('content-length')).toEqual('2');
                expect(reqMock.request.method).toEqual('GET');
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' }),
            { headers: { 'content-length': '2' } }
        );
    }));

    it('should return null value', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toBeNull();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(null)], { type: 'application/json' })
        );

    }));

    it('should return undefined value', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ method: 'PUT', url })
            .then(r => {
                expect(r.value).toBeUndefined();
            });

        const reqMock = httpMock.expectOne({ method: 'PUT', url });
        reqMock.flush(null, { status: 204, statusText: 'No Content' });
    }));

    it('should throw when timeout elapsed', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        const prom = fetchProvider.ajax({
            url,
            timeout: 1
        });
        expectAsync(prom).toBeRejectedWithError('Request timed out');

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        setTimeout(() => {
            reqMock.flush(
                new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' })
            );
        }, 10);
    }));

    it('should revive any Date in response', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http, JsonDateConverter);

        const url = 'Companies(123)';
        const resIn = {
            id: 123,
            dateOnly: '2012-07-31',
            dtOffset: '2017-11-08T21:33:01.009+02:00',
            dtInvalid: '2012-13-31'
        };
        const resOut = {
            id: resIn.id,
            dateOnly: new Date(resIn.dateOnly),
            dtOffset: new Date(resIn.dtOffset),
            dtInvalid: resIn.dtInvalid
        };

        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual(resOut);
                expect(reqMock.request.method).toEqual('GET');
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' })
        );
    }));

    it('should revive Date only in response', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http, JsonDateOnlyConverter);

        const url = 'Companies(123)';
        const resIn = {
            id: 123,
            dateOnly: '2012-07-31',
            dtOffset: '2017-11-08T21:33:01.009+02:00',
            dtInvalid: '2012-13-31'
        };
        const resOut = {
            id: resIn.id,
            dateOnly: new Date(resIn.dateOnly),
            dtOffset: resIn.dtOffset,
            dtInvalid: resIn.dtInvalid
        };

        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual(resOut);
                expect(reqMock.request.method).toEqual('GET');
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' })
        );
    }));

    it('should revive DateTimeOffset only in response', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http, JsonDateTimeOffsetConverter);

        const url = 'resource(123)';
        const resIn = {
            id: 123,
            dateOnly: '2012-07-31',
            dtOffset: '2017-11-08T21:33:01.009+02:00',
            dtInvalid: '2012-13-31'
        };
        const resOut = {
            id: resIn.id,
            dateOnly: resIn.dateOnly,
            dtOffset: new Date(resIn.dtOffset),
            dtInvalid: resIn.dtInvalid
        };

        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual(resOut);
                expect(reqMock.request.method).toEqual('GET');
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' })
        );
    }));

    it('should replace fld2 in request', waitForAsync(() => {
        const fetchProvider = new AngularHttpProvider(http, JsonTestConverter);

        const url = 'resource(123)';
        const resIn = {
            id: 123,
            fld1: 'Joan',
            fld2: 'apple',
        };
        const resOut = {
            id: 123,
            fld1: 'Joan',
            fld2: 'orange',
        };

        fetchProvider.ajax({ url, method: 'POST', data: resIn })
            .then(r => {
                expect(r.value).toEqual(void 0);
                expect(reqMock.request.body).toEqual(JSON.stringify(resOut));
                expect(reqMock.request.method).toEqual('POST');
            });

        const reqMock = httpMock.expectOne({ method: 'POST', url });
        reqMock.flush(null);
    }));

});
