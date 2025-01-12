"use strict";
// Copyright 2015 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    // FIXME(ofrobots): presently this is dependent what cwd() is at the time this
    // file is first required. We should make the default config static.
    workingDirectory: process.cwd(),
    allowRootAsWorkingDirectory: false,
    description: undefined,
    allowExpressions: false,
    // FIXME(ofrobots): today we prioritize GAE_MODULE_NAME/GAE_MODULE_VERSION
    // over the user specified config. We should reverse that.
    serviceContext: {
        service: undefined,
        version: undefined,
        minorVersion_: undefined,
        enableCanary: undefined,
        allowCanaryOverride: undefined,
    },
    appPathRelativeToRepository: undefined,
    javascriptFileExtensions: ['.js'],
    pathResolver: undefined,
    logLevel: 1,
    breakpointUpdateIntervalSec: 10,
    breakpointExpirationSec: 60 * 60 * 24,
    capture: {
        includeNodeModules: false,
        maxFrames: 20,
        maxExpandFrames: 5,
        maxProperties: 10,
        maxDataSize: 20000,
        maxStringLength: 100,
    },
    log: { maxLogsPerSecond: 50, logDelaySeconds: 1, logFunction: console.log },
    internal: {
        registerDelayOnFetcherErrorSec: 300,
        maxRegistrationRetryDelay: 40,
    },
    forceNewAgent_: false,
    testMode_: false,
    resetV8DebuggerThreshold: 30,
};
//# sourceMappingURL=config.js.map