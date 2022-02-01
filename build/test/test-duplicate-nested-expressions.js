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
const extend = require("extend");
const config_1 = require("../src/agent/config");
const debuglet_1 = require("../src/agent/debuglet");
const scanner = require("../src/agent/io/scanner");
const SourceMapper = require("../src/agent/io/sourcemapper");
const debugapi = require("../src/agent/v8/debugapi");
const consoleLogLevel = require("console-log-level");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const foo = require('./test-duplicate-nested-expressions-code.js');
// TODO: Determine why this must be named `_stateIsClean`.
function stateIsClean2(api) {
    assert.strictEqual(api.numBreakpoints_(), 0, 'there should be no breakpoints active');
    assert.strictEqual(api.numListeners_(), 0, 'there should be no listeners active');
    return true;
}
mocha_1.describe(__filename, () => {
    const config = extend({}, config_1.defaultConfig, {
        workingDirectory: __dirname,
        forceNewAgent_: true,
    });
    const logger = consoleLogLevel({
        level: debuglet_1.Debuglet.logLevelToName(config.logLevel),
    });
    let api;
    mocha_1.beforeEach(done => {
        if (!api) {
            scanner.scan(config.workingDirectory, /.js$/).then(async (fileStats) => {
                assert.strictEqual(fileStats.errors().size, 0);
                const jsStats = fileStats.selectStats(/.js$/);
                const mapFiles = fileStats.selectFiles(/.map$/, process.cwd());
                const mapper = await SourceMapper.create(mapFiles, logger);
                // TODO: Handle the case when mapper is undefined
                // TODO: Handle the case when v8debugapi.create returns null
                api = debugapi.create(logger, config, jsStats, mapper);
                assert.ok(api, 'should be able to create the api');
                done();
            });
        }
        else {
            assert(stateIsClean2(api));
            done();
        }
    });
    mocha_1.afterEach(() => {
        assert(stateIsClean2(api));
    });
    mocha_1.it('Should read the argument before the name is confounded', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-123',
            location: { path: 'test-duplicate-nested-expressions-code.js', line: 4 },
        };
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                const frame = brk.stackFrames[0];
                const args = frame.arguments;
                const locals = frame.locals;
                assert.strictEqual(args.length, 0, 'There should be zero arguments');
                assert.strictEqual(locals.length, 1, 'There should be one locals');
                assert.deepStrictEqual(locals[0], { name: 'a', value: 'test' });
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(foo.bind(null, 'test'));
        });
    });
    mocha_1.it('Should read an argument after the name is confounded', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-1234',
            location: { path: 'test-duplicate-nested-expressions-code.js', line: 5 },
        };
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                const frame = brk.stackFrames[0];
                const args = frame.arguments;
                const locals = frame.locals;
                assert.strictEqual(args.length, 0, 'There should be zero arguments');
                assert.strictEqual(locals.length, 1, 'There should be one local');
                assert.deepStrictEqual(locals[0], { name: 'a', value: '10' });
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(foo.bind(null, 'test'));
        });
    });
    mocha_1.it('Should read an argument value after its value is modified', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-1234',
            location: { path: 'test-duplicate-nested-expressions-code.js', line: 6 },
        };
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                const frame = brk.stackFrames[0];
                const args = frame.arguments;
                const locals = frame.locals;
                assert.strictEqual(args.length, 0, 'There should be zero arguments');
                assert.strictEqual(locals.length, 1, 'There should be one local');
                assert.deepStrictEqual(locals[0], { name: 'a', value: '11' });
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(foo.bind(null, 'test'));
        });
    });
    mocha_1.it('Should represent a const name at its local-scope when clearly defined', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-1234',
            location: { path: 'test-duplicate-nested-expressions-code.js', line: 8 },
        };
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                const frame = brk.stackFrames[0];
                const args = frame.arguments;
                const locals = frame.locals;
                assert.strictEqual(args.length, 0, 'There should be zero arguments');
                assert.strictEqual(locals.length, 2, 'There should be two locals');
                assert.deepStrictEqual(locals[0], { name: 'b', value: 'undefined' });
                assert.deepStrictEqual(locals[1], { name: 'a', value: 'true' });
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(foo.bind(null, 'test'));
        });
    });
});
//# sourceMappingURL=test-duplicate-nested-expressions.js.map