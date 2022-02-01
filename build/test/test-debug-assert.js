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
const realAssert = require("assert");
const debug_assert_1 = require("../src/agent/util/debug-assert");
const mocha_1 = require("mocha");
mocha_1.describe('debug-assert', () => {
    mocha_1.it('should fire assertions when enabled', () => {
        realAssert.throws(() => {
            const assert = debug_assert_1.debugAssert(true);
            assert.strictEqual(1, 2);
        });
    });
    mocha_1.describe('disabled', () => {
        const assert = debug_assert_1.debugAssert(false);
        mocha_1.it('should not fire assertions when disabled', () => {
            assert.strictEqual(1, 2);
        });
        mocha_1.it.skip('should cover the full assert API', () => {
            Object.keys(realAssert).forEach(key => {
                realAssert.strictEqual(typeof assert[key], 'function', `${key} does not exist on the debug assert library`);
            });
        });
    });
});
//# sourceMappingURL=test-debug-assert.js.map