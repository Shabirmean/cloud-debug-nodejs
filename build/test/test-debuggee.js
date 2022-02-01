"use strict";
// Copyright 2016 Google LLC
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
const debuggee_1 = require("../src/debuggee");
const agentVersion = 'SomeName/client/SomeVersion';
mocha_1.describe('Debuggee', () => {
    mocha_1.it('should create a Debuggee instance on valid input', () => {
        const debuggee = new debuggee_1.Debuggee({
            project: 'project',
            uniquifier: 'uid',
            description: 'unit test',
            agentVersion,
        });
        assert.ok(debuggee instanceof debuggee_1.Debuggee);
    });
    mocha_1.it('should create a Debuggee on a call without new', () => {
        const debuggee = new debuggee_1.Debuggee({
            project: 'project',
            uniquifier: 'uid',
            description: 'unit test',
            agentVersion,
        });
        assert.ok(debuggee instanceof debuggee_1.Debuggee);
    });
    mocha_1.it('should throw on invalid input', () => {
        assert.throws(() => {
            return new debuggee_1.Debuggee({ agentVersion });
        });
        assert.throws(() => {
            return new debuggee_1.Debuggee({ project: '5', agentVersion });
        });
        assert.throws(() => {
            return new debuggee_1.Debuggee({ project: undefined, agentVersion });
        });
        assert.throws(() => {
            return new debuggee_1.Debuggee({ project: 'test', agentVersion });
        });
        assert.throws(() => {
            new debuggee_1.Debuggee({
                project: 'test',
                uniquifier: undefined,
                agentVersion,
            });
            assert.throws(() => {
                return new debuggee_1.Debuggee({ project: 'test', uniquifier: 'uid', agentVersion });
            });
        });
    });
});
//# sourceMappingURL=test-debuggee.js.map