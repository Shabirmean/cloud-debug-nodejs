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
assert.ok(process.env.GCLOUD_PROJECT, 'Need to have GCLOUD_PROJECT defined to be able to run this test');
assert.ok(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'Need to have GOOGLE_APPLICATION_CREDENTIALS defined to be able to run ' +
    'this test');
const controller_1 = require("../src/agent/controller");
const debuggee_1 = require("../src/debuggee");
const debug_1 = require("../src/client/stackdriver/debug");
const packageInfo = {
    name: 'SomeName',
    version: 'SomeVersion',
};
const agentVersion = `${packageInfo.name}/client/${packageInfo.version}`;
const debug = new debug_1.Debug({}, packageInfo);
mocha_1.describe('Controller', function () {
    this.timeout(60 * 1000);
    mocha_1.it('should register successfully', done => {
        const controller = new controller_1.Controller(debug);
        const debuggee = new debuggee_1.Debuggee({
            project: process.env.GCLOUD_PROJECT,
            uniquifier: 'test-uid-' + Date.now(),
            description: 'this is a system test',
            agentVersion,
        });
        controller.register(debuggee, (err, maybeBody) => {
            assert.ifError(err);
            assert.ok(maybeBody);
            const body = maybeBody;
            assert.ok(body.debuggee);
            assert.ok(body.debuggee.id);
            done();
        });
    });
    mocha_1.it('should list breakpoints', done => {
        const controller = new controller_1.Controller(debug);
        const debuggee = new debuggee_1.Debuggee({
            project: process.env.GCLOUD_PROJECT,
            uniquifier: 'test-uid-' + Date.now(),
            description: 'this is a system test',
            agentVersion,
        });
        // TODO: Determine if the body parameter should be used.
        controller.register(debuggee, err1 => {
            assert.ifError(err1);
            // TODO: Determine if the response parameter should be used.
            controller.listBreakpoints(debuggee, (err2, response, maybeBody) => {
                assert.ifError(err2);
                assert.ok(maybeBody);
                const body2 = maybeBody;
                assert.ok(body2.nextWaitToken);
                done();
            });
        });
    });
    mocha_1.it('should pass success on timeout', done => {
        this.timeout(100000);
        const controller = new controller_1.Controller(debug);
        const debuggee = new debuggee_1.Debuggee({
            project: process.env.GCLOUD_PROJECT,
            uniquifier: 'test-uid-' + Date.now(),
            description: 'this is a system test',
            agentVersion,
        });
        // TODO: Determine if the body parameter should be used.
        controller.register(debuggee, err => {
            assert.ifError(err);
            // First list should set the wait token
            // TODO: Determine if the response parameter should be used.
            controller.listBreakpoints(debuggee, (err1, response1, maybeBody1) => {
                assert.ifError(err1);
                assert.ok(maybeBody1);
                const body1 = maybeBody1;
                assert.ok(body1.nextWaitToken);
                // Second list should block until the wait timeout
                // TODO: Determine if the response parameter should be used.
                controller.listBreakpoints(debuggee, (err2, response2, maybeBody2) => {
                    assert.ifError(err2);
                    assert.ok(maybeBody2);
                    const body2 = maybeBody2;
                    assert.ok(body2.nextWaitToken);
                    // waitExpired will only be set if successOnTimeout was given
                    // correctly
                    assert.ok(body2.waitExpired);
                    done();
                });
            });
        });
    });
    // To be able to write the following test we need a service for adding a
    // breakpoint (need the debugger API). TODO.
    mocha_1.it('should update an active breakpoint');
});
//# sourceMappingURL=test-controller.js.map