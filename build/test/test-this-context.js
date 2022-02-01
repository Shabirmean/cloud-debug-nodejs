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
const utils = require("../src/agent/util/utils");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const code = require('./test-this-context-code.js');
function stateIsClean(api) {
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
            assert(stateIsClean(api));
            done();
        }
    });
    mocha_1.afterEach(() => {
        assert(stateIsClean(api));
    });
    mocha_1.it('Should be able to read the argument and the context', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-123',
            location: { path: 'test-this-context-code.js', line: 5 },
        };
        let ctxMembers;
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                const frame = brk.stackFrames[0];
                const args = frame.arguments;
                const locals = frame.locals;
                // TODO: Determine how to remove these casts to any.
                ctxMembers = brk.variableTable.slice(brk.variableTable.length - 1)[0]
                    .members;
                assert.deepStrictEqual(ctxMembers.length, 1, 'There should be one member in the context variable value');
                assert.deepStrictEqual(ctxMembers[0], { name: 'a', value: '10' });
                assert.strictEqual(args.length, 0, 'There should be zero arguments');
                if (utils.satisfies(process.version, '>=11 && <12')) {
                    assert.strictEqual(locals.length, 3, 'There should be three locals');
                    assert.deepStrictEqual(locals[0].name, 'this');
                    assert.deepStrictEqual(locals[1], { name: 'b', value: '1' });
                    assert.deepStrictEqual(locals[2].name, 'context');
                }
                else {
                    assert.strictEqual(locals.length, 2, 'There should be two locals');
                    assert.deepStrictEqual(locals[0], { name: 'b', value: '1' });
                    assert.deepStrictEqual(locals[1].name, 'context');
                }
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(code.foo.bind({}, 1));
        });
    });
    mocha_1.it('Should be able to read the argument and deny the context', done => {
        // TODO: Have this actually implement Breakpoint
        const brk = {
            id: 'fake-id-123',
            location: { path: 'test-this-context-code.js', line: 9 },
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
                assert.deepStrictEqual(locals[0], { name: 'j', value: '1' });
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(code.bar.bind(null, 1));
        });
    });
});
//# sourceMappingURL=test-this-context.js.map