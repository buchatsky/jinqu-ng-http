// This file is required by karma.conf.js
import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';

import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  //{
  //  teardown: { destroyAfterEach: false }
  //}
);
