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
const assert = require("assert");
const mocha_1 = require("mocha");
const nock = require("nock");
const debuggee_1 = require("../src/debuggee");
const teeny_request_1 = require("teeny-request");
// the tests in this file rely on the GCLOUD_PROJECT environment variable
// not being set
delete process.env.GCLOUD_PROJECT;
const controller_1 = require("../src/agent/controller");
// TODO: Fix fakeDebug to actually implement Debug.
const fakeDebug = {
    apiEndpoint: 'clouddebugger.googleapis.com',
    request: (options, cb) => {
        teeny_request_1.teenyRequest(options, (err, r) => {
            cb(err, r ? r.body : undefined, r);
        });
    },
};
const agentVersion = 'SomeName/client/SomeVersion';
const url = 'https://clouddebugger.googleapis.com';
const api = '/v2/controller';
nock.disableNetConnect();
mocha_1.describe('Controller API', () => {
    mocha_1.describe('register', () => {
        mocha_1.it('should get a debuggeeId', done => {
            const scope = nock(url)
                .post(api + '/debuggees/register')
                .reply(200, {
                debuggee: { id: 'fake-debuggee' },
                activePeriodSec: 600,
            });
            const debuggee = new debuggee_1.Debuggee({
                project: 'fake-project',
                uniquifier: 'fake-id',
                description: 'unit test',
                agentVersion,
            });
            const controller = new controller_1.Controller(fakeDebug);
            // TODO: Determine if this type signature is correct.
            controller.register(debuggee, (err, result) => {
                assert(!err, 'not expecting an error');
                assert.ok(result);
                assert.strictEqual(result.debuggee.id, 'fake-debuggee');
                scope.done();
                done();
            });
        });
        mocha_1.it('should get an agentId', done => {
            const scope = nock(url)
                .post(api + '/debuggees/register')
                .reply(200, {
                debuggee: { id: 'fake-debuggee' },
                agentId: 'fake-agent-id',
                activePeriodSec: 600,
            });
            const debuggee = new debuggee_1.Debuggee({
                project: 'fake-project',
                uniquifier: 'fake-id',
                description: 'unit test',
                agentVersion,
            });
            const controller = new controller_1.Controller(fakeDebug);
            // TODO: Determine if this type signature is correct.
            controller.register(debuggee, (err, result) => {
                assert(!err, 'not expecting an error');
                assert.ok(result);
                assert.strictEqual(result.agentId, 'fake-agent-id');
                scope.done();
                done();
            });
        });
        mocha_1.it('should not return an error when the debuggee isDisabled', done => {
            const scope = nock(url)
                .post(api + '/debuggees/register')
                .reply(200, {
                debuggee: { id: 'fake-debuggee', isDisabled: true },
                activePeriodSec: 600,
            });
            const debuggee = new debuggee_1.Debuggee({
                project: 'fake-project',
                uniquifier: 'fake-id',
                description: 'unit test',
                agentVersion,
            });
            const controller = new controller_1.Controller(fakeDebug);
            controller.register(debuggee, (err, result) => {
                // TODO: Fix this incorrect method signature.
                assert.ifError(err, 'not expecting an error');
                assert.ok(result);
                assert.strictEqual(result.debuggee.id, 'fake-debuggee');
                assert.ok(result.debuggee.isDisabled);
                scope.done();
                done();
            });
        });
    });
    mocha_1.describe('listBreakpoints', () => {
        // register before each test
        mocha_1.before(done => {
            nock(url)
                .post(api + '/debuggees/register')
                .reply(200, {
                debuggee: { id: 'fake-debuggee' },
                activePeriodSec: 600,
            });
            const debuggee = new debuggee_1.Debuggee({
                project: 'fake-project',
                uniquifier: 'fake-id',
                description: 'unit test',
                agentVersion,
            });
            const controller = new controller_1.Controller(fakeDebug);
            controller.register(debuggee, (err /*, result*/) => {
                assert.ifError(err);
                done();
            });
        });
        mocha_1.it('should deal with a missing breakpoints response', done => {
            const scope = nock(url)
                .get(api + '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true')
                .reply(200, { kind: 'whatever' });
            const debuggee = { id: 'fake-debuggee' };
            const controller = new controller_1.Controller(fakeDebug);
            // TODO: Fix debuggee to actually implement Debuggee
            // TODO: Determine if the response parameter should be used.
            controller.listBreakpoints(debuggee, (err, response, result) => {
                assert(!err, 'not expecting an error');
                // TODO: Handle the case where result is undefined
                assert(!result.breakpoints, 'should not have a breakpoints property');
                scope.done();
                done();
            });
        });
        mocha_1.describe('invalid responses', () => {
            const tests = ['', 'JSON, this is not', []];
            tests.forEach((invalidResponse, index) => {
                mocha_1.it('should pass test ' + index, done => {
                    const scope = nock(url)
                        .get(api + '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true')
                        .reply(200, invalidResponse);
                    const debuggee = { id: 'fake-debuggee' };
                    const controller = new controller_1.Controller(fakeDebug);
                    // TODO: Fix debuggee to actually implement Debuggee
                    // TODO: Determine if the response parameter should be used.
                    controller.listBreakpoints(debuggee, (err, response, result) => {
                        assert(!err, 'not expecting an error');
                        // TODO: Handle the case where result is undefined
                        assert(!result.breakpoints, 'should not have breakpoints property');
                        scope.done();
                        done();
                    });
                });
            });
        });
        mocha_1.it('should throw error on http errors', done => {
            const scope = nock(url)
                .get(api + '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true')
                .reply(403);
            // TODO: Fix debuggee to actually implement Debuggee
            const debuggee = { id: 'fake-debuggee' };
            const controller = new controller_1.Controller(fakeDebug);
            // TODO: Determine if the response parameter should be used.
            controller.listBreakpoints(debuggee, (err, response, result) => {
                assert(err instanceof Error, 'expecting an error');
                assert(!result, 'should not have a result');
                scope.done();
                done();
            });
        });
        mocha_1.it('should work with waitTokens', done => {
            const scope = nock(url)
                .get(api + '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true')
                .reply(200, { waitExpired: true });
            // TODO: Fix debuggee to actually implement Debuggee
            const debuggee = { id: 'fake-debuggee' };
            const controller = new controller_1.Controller(fakeDebug);
            // TODO: Determine if the result parameter should be used.
            controller.listBreakpoints(debuggee, (err, response) => {
                // TODO: Fix this incorrect method signature.
                assert.ifError(err, 'not expecting an error');
                // TODO: Fix this error that states `body` is not a property
                //       of `ServerResponse`.
                assert(response.body.waitExpired, 'should have expired set');
                scope.done();
                done();
            });
        });
        mocha_1.it('should work with agentId provided from registration', done => {
            const scope = nock(url)
                .post(api + '/debuggees/register')
                .reply(200, {
                debuggee: { id: 'fake-debuggee' },
                agentId: 'fake-agent-id',
                activePeriodSec: 600,
            })
                .get(api +
                '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true&agentId=fake-agent-id')
                .reply(200, { waitExpired: true });
            const debuggee = new debuggee_1.Debuggee({
                project: 'fake-project',
                uniquifier: 'fake-id',
                description: 'unit test',
                agentVersion,
            });
            const controller = new controller_1.Controller(fakeDebug);
            controller.register(debuggee, (err1 /*, response1*/) => {
                assert.ifError(err1);
                const debuggeeWithId = { id: 'fake-debuggee' };
                // TODO: Determine if the result parameter should be used.
                controller.listBreakpoints(debuggeeWithId, (err2 /*, response2*/) => {
                    assert.ifError(err2);
                    scope.done();
                    done();
                });
            });
        });
        // TODO: Fix this so that each element of the array is actually an
        //       array of Breakpoints.
        const testsBreakpoints = [
            [],
            [{ id: 'breakpoint-0', location: { path: 'foo.js', line: 18 } }],
        ];
        testsBreakpoints.forEach((breakpoints, index) => {
            mocha_1.it('should pass test ' + index, done => {
                const scope = nock(url)
                    .get(api + '/debuggees/fake-debuggee/breakpoints?successOnTimeout=true')
                    .reply(200, { breakpoints });
                // TODO: Fix debuggee to actually implement Debuggee
                const debuggee = { id: 'fake-debuggee' };
                const controller = new controller_1.Controller(fakeDebug);
                // TODO: Determine if the response parameter should be used.
                controller.listBreakpoints(debuggee, (err, response, result) => {
                    assert(!err, 'not expecting an error');
                    assert.ok(result);
                    assert(result.breakpoints, 'should have a breakpoints property');
                    const bps = result.breakpoints;
                    assert.deepStrictEqual(bps, breakpoints, 'breakpoints mismatch');
                    scope.done();
                    done();
                });
            });
        });
    });
    mocha_1.describe('updateBreakpoint', () => {
        mocha_1.it('should PUT to server when a breakpoint is updated', done => {
            // TODO: Fix breakpoint to actually Breakpoint
            const breakpoint = {
                id: 'breakpoint-0',
                location: { path: 'foo.js', line: 99 },
            };
            // A cast for the second argument to put() is necessary for nock 11
            // because the type definitions state that the second argument cannot
            // be an Object even though the nock code itself seems to handle an
            // Object.  Further, the tests pass when using the cast.
            // This issue is being tracked in the nock repo at
            // https://github.com/nock/nock/issues/1731.
            const scope = nock(url)
                .put(api + '/debuggees/fake-debuggee/breakpoints/breakpoint-0', {
                debuggeeId: 'fake-debuggee',
                breakpoint,
            })
                .reply(200, {
                kind: 'debugletcontroller#updateActiveBreakpointResponse',
            });
            // TODO: Fix debuggee to actually implement Debuggee
            const debuggee = { id: 'fake-debuggee' };
            const controller = new controller_1.Controller(fakeDebug);
            controller.updateBreakpoint(debuggee, breakpoint, (err, result) => {
                assert(!err, 'not expecting an error');
                assert.strictEqual(result.kind, 'debugletcontroller#updateActiveBreakpointResponse');
                scope.done();
                done();
            });
        });
    });
});
//# sourceMappingURL=test-controller.js.map