"use strict";
// Copyright 2017 Google LLC
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
const assert = require("assert");
const mocha_1 = require("mocha");
const utils = require("../src/agent/util/utils");
const proxyquire = require("proxyquire");
const describeFn = utils.satisfies(process.version, '>=10')
    ? mocha_1.describe.skip
    : mocha_1.describe;
describeFn('state', () => {
    // Testing of state.js is driven through test-v8debugapi.js. There are
    // minimal unit tests here.
    mocha_1.it('should have assertions enabled', () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const state = require('../src/agent/state/legacy-state');
        // this test makes sure that the necessary environment variables to enable
        // asserts are present during testing. Use run-tests.sh, or export
        // CLOUD_DEBUG_ASSERTIONS=1 to make sure this test passes.
        if (!process.env.CLOUD_DEBUG_ASSERTIONS) {
            console.log('This test requires the enviornment variable ' +
                'CLOUD_DEBUG_ASSERTIONS to be set in order to pass');
        }
        assert.throws(() => {
            state.testAssert();
        });
    });
    mocha_1.it('should not throw if vm is not an object', () => {
        // test for
        // https://github.com/googleapis/cloud-debug-nodejs/issues/503
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const state = proxyquire('../src/agent/state/legacy-state', { vm: false });
        assert.ok(state);
    });
});
//# sourceMappingURL=test-state.js.map