"use strict";
// Copyright 2018 Google LLC
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
const config_1 = require("../src/agent/config");
const debuglet_1 = require("../src/agent/debuglet");
const scanner = require("../src/agent/io/scanner");
const SourceMapper = require("../src/agent/io/sourcemapper");
const debugapi = require("../src/agent/v8/debugapi");
const consoleLogLevel = require("console-log-level");
const utils_1 = require("../src/agent/util/utils");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const code = require('./test-circular-code.js');
function stateIsClean(api) {
    assert.strictEqual(api.numBreakpoints_(), 0, 'there should be no breakpoints active');
    assert.strictEqual(api.numListeners_(), 0, 'there should be no listeners active');
    return true;
}
/**
 * Stable object ID was reverted in V8 7.3 (Node 12), so circular objects will
 * not work in the near future. For now, we warn if the user specifies
 * maxDataSize = 0, as this will cause the app to crash.
 */
const maybeDescribe = utils_1.satisfies(process.version, '>=10 <10.15.3 || >=11 <11.7 || >=12')
    ? mocha_1.describe.skip
    : mocha_1.describe;
maybeDescribe(__filename, () => {
    const config = Object.assign({}, config_1.defaultConfig, {
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
            location: { path: 'test-circular-code.js', line: 9 },
        };
        api.set(brk, err1 => {
            assert.ifError(err1);
            api.wait(brk, err2 => {
                assert.ifError(err2);
                assert.ok(brk.stackFrames.length >= 1);
                const locals = [...brk.stackFrames[0].locals].sort((a, b) => a.name.localeCompare(b.name));
                const nonStatusVars = brk.variableTable.filter(entry => entry && !!entry.members);
                const statusVarOffset = brk.variableTable.length - nonStatusVars.length;
                assert.ok(locals.length >= 3);
                // At least three locals: a, b, and context (alias for this).
                // In newer versions of inspector, this appears both as this and
                // as context.
                const aLocal = locals[0];
                const bLocal = locals[1];
                const contextLocal = locals[2];
                const thisLocal = locals[3]; // Maybe non-existent
                assert.ok(aLocal && bLocal && contextLocal);
                assert.ok(!thisLocal || thisLocal.varTableIndex === contextLocal.varTableIndex);
                // All three non-status entries in the varTable correspond to each
                // of the locals, respectively.
                assert.strictEqual(nonStatusVars.length, 3);
                // Every entry has a truthy members field.
                assert.ok(!nonStatusVars.some(e => !e.members));
                const aVar = nonStatusVars[aLocal.varTableIndex - statusVarOffset];
                const bVar = nonStatusVars[bLocal.varTableIndex - statusVarOffset];
                const thisVar = nonStatusVars[contextLocal.varTableIndex - statusVarOffset];
                assert.strictEqual(aVar.members.length, 1); // a
                assert.deepStrictEqual(aVar.members[0], bLocal); // a.b
                assert.strictEqual(bVar.members.length, 2); // b
                assert.deepStrictEqual(bVar.members[0], aLocal); // b.a
                assert.deepStrictEqual(bVar.members[1], {
                    name: 'c',
                    varTableIndex: contextLocal.varTableIndex,
                });
                assert.strictEqual(thisVar.members.length, 2); // this
                assert.deepStrictEqual(thisVar.members[0], {
                    name: 'x',
                    varTableIndex: contextLocal.varTableIndex,
                }); // this.x
                assert.deepStrictEqual(thisVar.members[1], {
                    name: 'y',
                    varTableIndex: aLocal.varTableIndex,
                }); // this.y
                api.clear(brk, err3 => {
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(code.foo.bind({}));
        });
    });
});
//# sourceMappingURL=test-circular.js.map