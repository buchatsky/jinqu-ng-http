// This file is required by karma.conf.js
import 'zone.js';
import 'zone.js/testing';
//import 'reflect-metadata';

import { getTestBed } from '@angular/core/testing';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: { destroyAfterEach: true }
  }
);

const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);