import 'zone.js';  // Included with Angular CLI.
import 'zone.js/dist/zone';  // Included with Angular CLI.
import 'zone.js/dist/mocha-patch';
//import 'zone.js/dist/proxy';
import 'zone.js/dist/zone-testing';

import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { HttpClient } from '@angular/common/http';
import { TestBed, waitForAsync/*, fakeAsync*/ } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import 'mocha';
import { expect } from 'chai';
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
//import fetchMock = require('fetch-mock');
//import 'whatwg-fetch';

import { AngularHttpProvider } from '..';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

chai.use(chaiAsPromised)
const emptyResponse = {};

describe('Fetch tests', () => {

/*    TestBed.configureTestingModule({
        imports: [ HttpClientTestingModule ]
    });//.compileComponents();
*/
    let httpMock: HttpTestingController;
    let http: HttpClient;

    beforeEach(waitForAsync(() => {
    //beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ]
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        http = TestBed.inject(HttpClient);
    }));

/*    afterEach(() => {
        httpMock.verify();
    });
*/
    it('should set url', (() => {
    //it('should set url', async () => {
    //it('should set url', waitForAsync(async() => {
    //it('should set url', fakeAsync(() => {
    //it('should set url', waitForAsync(() => {
        httpMock = TestBed.inject(HttpTestingController);
        http = TestBed.inject(HttpClient);

        const query = {
            '$where': 'o => o.id > 5',
            '$orderBy': 'o => o.id',
            '$skip': '10',
            '$take': '10'
        };
        const url = 'Companies?' + Object.keys(query).map((key) => `${key}=${encodeURIComponent(query[key])}`).join("&");
        const req = httpMock.expectOne(url);
        expect(req.request.method).eq("GET"); // ??
        req.flush(emptyResponse);

        const fetchProvider = new AngularHttpProvider(http);
/*        const r = await fetchProvider.ajax({
            url: 'Companies',
            params: [
                { key: '$where', value: 'o => o.id > 5' },
                { key: '$orderBy', value: 'o => o.id' },
                { key: '$skip', value: '10' },
                { key: '$take', value: '10' }
            ]
        });

        expect(r.value).deep.equal(emptyResponse);
        expect(req.request.method).to.equal('GET');
*/
        fetchProvider.ajax({
            url: 'Companies',
            params: [
                { key: '$where', value: 'o => o.id > 5' },
                { key: '$orderBy', value: 'o => o.id' },
                { key: '$skip', value: '10' },
                { key: '$take', value: '10' }
            ]
        }).then(r => {
            expect(r.value).deep.equal(emptyResponse);
            expect(req.request.method).to.equal('GET');
        })

        //fetchMock.restore();
        //httpMock.verify();
    }));
/*
    it('should return null', async () => {
        fetchMock.get(
            'Companies',
            {
                body: 'null'
            },
            {
                method: 'GET',
                overwriteRoutes: false
            }
        );

        const fetchProvider = new AngularHttpProvider(http);
        const r = await fetchProvider.ajax({
            url: 'Companies'
        });

        expect(r.value).to.be.null;

        fetchMock.restore();
    });

    it('should throw when timeout elapsed', async () => {
        fetchMock.get(
            'Companies',
            new Promise((r, _) => setTimeout(() => r(emptyResponse), 10)),
            {
                method: 'GET',
                overwriteRoutes: false
            }
        );

        const fetchProvider = new AngularHttpProvider(http);

        try {
            await fetchProvider.ajax({
                url: 'Companies',
                timeout: 1
            });
            expect.fail('Should have failed because of timeout');
        }
        catch (e) {
            expect(e).to.has.property('message', 'Request timed out');
        }

        fetchMock.restore();
    });
*/
});
