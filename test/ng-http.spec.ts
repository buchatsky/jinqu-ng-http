import { HttpClient } from '@angular/common/http';
// waitForAsync is used if the test body contains async calls, no need in Jasmine's done()
import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AngularHttpProvider } from '../index';
//import { AngularHttpProvider } from '../lib/ng-http-provider';

const emptyResponse = {};

describe('HttpClient tests', () => {

    let httpMock: HttpTestingController;
    let http: HttpClient;
    let fetchProvider: AngularHttpProvider;

    //beforeEach(waitForAsync(() => {
    beforeEach((() => {
        //TestBed.resetTestEnvironment();

        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        http = TestBed.inject(HttpClient);
        fetchProvider = new AngularHttpProvider(http);
    }));

    //afterEach(waitForAsync(() => {
    afterEach((() => {
        httpMock.verify();
    }));

    //it('should get http headers & value', waitForAsync(() => {
    it('should get http headers & value', ((done) => {
        const url = 'Companies';

        fetchProvider.ajax({
            url: url
        })
            .then(r => {
                expect(r.value).toEqual(emptyResponse);
                expect(r.response.headers.get('content-type')).toEqual('application/json');
                expect(r.response.headers.get('content-length')).toEqual('2');
                expect(reqMock.request.method).toEqual('GET');

                done();
            });

        const reqMock = httpMock.expectOne({
            method: 'GET',
            url: url
        });
        reqMock.flush(
            new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' }),
            { headers: { 'content-length': '2' } }
        );
    }));

    //it('should return null', waitForAsync(() => {
    it('should return null', ((done) => {
        const url = 'Companies';

        fetchProvider.ajax({
            url: url,
        })
            .then(r => {
                expect(r.value).toBeNull();

                done();
            });

        const reqMock = httpMock.expectOne({
            method: 'GET',
            url: url
        });
        reqMock.flush(
            new Blob([JSON.stringify(null)], { type: 'application/json' })
        );
    }));

    //it('should throw when timeout elapsed', waitForAsync(() => {
    it('should throw when timeout elapsed', ((done) => {
        const url = 'Companies';

        let prom = fetchProvider.ajax({
            url: url,
            timeout: 1
        })
        .finally(() => {
            done();
        });

        expectAsync(prom).toBeRejectedWithError('Request timed out');

        const reqMock = httpMock.expectOne({
            method: 'GET',
            url: url
        });
        setTimeout(() => {
            reqMock.flush(
                new Blob([JSON.stringify(emptyResponse)], { type: 'application/json' })
            );
        }, 10);        
    }));
});
