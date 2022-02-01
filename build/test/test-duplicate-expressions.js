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
const consoleLogLevel = require("console-log-level");
// TODO: Have this actually implement Breakpoint
const breakpointInFoo = {
    id: 'fake-id-123',
    location: { path: 'test-duplicate-expressions-code.js', line: 4 },
};
const assert = require("assert");
const mocha_1 = require("mocha");
const extend = require("extend");
const debugapi = require("../src/agent/v8/debugapi");
const config_1 = require("../src/agent/config");
const SourceMapper = require("../src/agent/io/sourcemapper");
const scanner = require("../src/agent/io/scanner");
const debuglet_1 = require("../src/agent/debuglet");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const foo = require('./test-duplicate-expressions-code.js');
// TODO: Determine why this must be named `stateIsClean1`.
function stateIsClean1(api) {
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
            assert(stateIsClean1(api));
            done();
        }
    });
    mocha_1.afterEach(() => {
        assert(stateIsClean1(api));
    });
    mocha_1.it('should not duplicate expressions', done => {
        api.set(breakpointInFoo, err1 => {
            assert.ifError(err1);
            api.wait(breakpointInFoo, err2 => {
                assert.ifError(err2);
                // TODO: Determine how to remove this cast to any.
                const frames = breakpointInFoo.stackFrames[0];
                const exprs = frames.arguments.concat(frames.locals);
                const varTableIndicesSeen = [];
                exprs.forEach(expr => {
                    // TODO: Handle the case when expr.varTableIndex is undefined
                    assert.strictEqual(varTableIndicesSeen.indexOf(expr.varTableIndex), -1);
                    varTableIndicesSeen.push(expr.varTableIndex);
                });
                api.clear(breakpointInFoo, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(foo);
        });
    });
});
//# sourceMappingURL=test-duplicate-expressions.js.map