import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { 
    AngularHttpProvider, 
    JsonDateConverter, 
    JsonDateOnlyConverter, 
    JsonDateTimeOffsetConverter
} from '../index';
import { JsonTestConverter } from './fixture';

const emptyResponse = {};

describe('HttpClient tests', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    //let fetchProvider: AngularHttpProvider;

    beforeEach(() => {
        //jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            //providers: [ AngularHttpProvider ] // if @Inject'ed
        });

        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        //fetchProvider = new AngularHttpProvider(http);
    });

    afterEach((() => {
        httpMock.verify();
    }));

    it('should get http headers & json value', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual(emptyResponse);
                expect(r.response.headers.get('content-type')).toEqual('application/json');
                expect(r.response.headers.get('content-length')).toEqual('2');
                expect(reqMock.request.method).toEqual('GET');
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' }),
            { headers: { 'content-length': '2', 'content-type': 'application/json' } }
        );
    });

    it('should get a string value', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);
        const blob = new Blob(['qwerty']);

        const url = 'Companies(3)/GetReport()';
        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toEqual('qwerty');
                expect(r.response.headers.get('content-type')).toEqual('text/plain');
                expect(r.response.headers.get('content-length')).toEqual('6');
                expect(reqMock.request.method).toEqual('GET');
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob(['qwerty'], { type: 'text/plain' }),
            { headers: { 'content-length': '6', 'content-type': 'text/plain' } }
        );
    });

    it('should return null value', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ url })
            .then(r => {
                expect(r.value).toBeNull();
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(null)], { type: 'application/json' }),
            { headers: { 'content-length': '4', 'content-type': 'application/json' } }
        );

    });

    it('should return undefined value', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        fetchProvider.ajax({ method: 'PUT', url })
            .then(r => {
                expect(r.value).toBeUndefined();
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'PUT', url });
        reqMock.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should throw when timeout elapsed', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        const prom = fetchProvider.ajax({
            url,
            timeout: 1
        });
        expectAsync(prom).toBeRejectedWithError('Request timed out')
            .then(() => {
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        setTimeout(() => {
            reqMock.flush(
                new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' })
            );
        }, 10);
    });

    it('should revive any Date in response', (done: DoneFn) => {
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
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' }),
            { headers: { 'content-type': 'application/json' } }
        );
    });

    it('should revive Date only in response', (done: DoneFn) => {
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
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' }),
            { headers: { 'content-type': 'application/json' } }
        );
    });

    it('should revive DateTimeOffset only in response', (done: DoneFn) => {
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
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resIn)], {  type: 'application/json' }),
            { headers: { 'content-type': 'application/json' } }
        );
    });

    it('should replace fld2 in request', (done: DoneFn) => {
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
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'POST', url });
        reqMock.flush(null);
    });

    it('should get odata error', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http);

        const url = 'Companies';
        const resErr = {
            "error":{
                "code":"400.101",
                "message":"Field is required"
            }
        };

        fetchProvider.ajax({ url })
        .catch(e => {
            expect(e.status).toEqual(400);
            expect(e.error.error.code).toEqual("400.101");
            expect(e.error.error.message).toEqual("Field is required");
            done();
        });

        const reqMock = httpMock.expectOne({ method: 'GET', url });
        reqMock.flush(
            new Blob([JSON.stringify(resErr)], {  type: 'application/json' }), { 
                status: 400, 
                statusText: 'Bad Request', 
                headers: { 'content-type': 'application/json' } 
            }
        );
    });

    it('should preserve timezone in request', (done: DoneFn) => {
        const fetchProvider = new AngularHttpProvider(http, JsonDateTimeOffsetConverter);

        const url = 'resource(123)';
        const resIn = {
            id: 123,
            dt: new Date(2022, 1, 24, 4, 31),
        };
        const resOut = {
            id: 123,
            //dt: dateToISOLocalString(resIn.dt),
            dt: '2022-02-24T04:31:00.000+02:00',
        };

        fetchProvider.ajax({ url, method: 'POST', data: resIn })
            .then(r => {
                expect(r.value).toEqual(void 0);
                expect(reqMock.request.body).toEqual(JSON.stringify(resOut));
                expect(reqMock.request.method).toEqual('POST');
                done();
            });

        const reqMock = httpMock.expectOne({ method: 'POST', url });
        reqMock.flush(null);
    });

});
