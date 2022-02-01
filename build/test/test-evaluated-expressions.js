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
const extend = require("extend");
const config_1 = require("../src/agent/config");
const debuglet_1 = require("../src/agent/debuglet");
const scanner = require("../src/agent/io/scanner");
const SourceMapper = require("../src/agent/io/sourcemapper");
const debugapi = require("../src/agent/v8/debugapi");
const consoleLogLevel = require("console-log-level");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const code = require('./test-evaluated-expressions-code.js');
mocha_1.describe('debugger provides useful information', () => {
    let api;
    const config = extend({}, config_1.defaultConfig, {
        allowExpressions: true,
        forceNewAgent_: true,
    });
    mocha_1.before(done => {
        const logger = consoleLogLevel({
            level: debuglet_1.Debuglet.logLevelToName(config.logLevel),
        });
        scanner.scan(config.workingDirectory, /\.js$/).then(async (fileStats) => {
            const jsStats = fileStats.selectStats(/\.js$/);
            const mapFiles = fileStats.selectFiles(/\.map$/, process.cwd());
            const mapper = await SourceMapper.create(mapFiles, logger);
            assert(mapper);
            api = debugapi.create(logger, config, jsStats, mapper);
            done();
        });
    });
    function getValue(exp, varTable) {
        if ('value' in exp) {
            return exp.value;
        }
        if ('varTableIndex' in exp) {
            const index = exp.varTableIndex;
            const val = varTable[index];
            if (!val) {
                return val;
            }
            return getValue(val, varTable);
        }
        throw new Error(`The variable ${JSON.stringify(exp, null, 2)} ` +
            "does not have a 'value' nor a 'varTableIndex' property");
    }
    function assertValue(bp, targetIndex, expectedName, expectedValue) {
        const rawExp = bp.evaluatedExpressions[targetIndex];
        assert(rawExp);
        const exp = rawExp;
        assert.strictEqual(exp.name, expectedName);
        assert.strictEqual(getValue(exp, bp.variableTable), expectedValue);
    }
    function assertMembers(bp, targetIndex, expectedName, expectedMemberValues) {
        const rawExp = bp.evaluatedExpressions[targetIndex];
        assert(rawExp);
        const exp = rawExp;
        assert.strictEqual(exp.name, expectedName);
        const rawIndex = exp.varTableIndex;
        assert.notStrictEqual(rawIndex, undefined);
        const index = rawIndex;
        const rawVarData = bp.variableTable[index];
        assert.notStrictEqual(rawVarData, undefined);
        const varData = rawVarData;
        const memberMap = new Map();
        assert.notStrictEqual(varData.members, undefined);
        for (const member of varData.members) {
            assert.notStrictEqual(member.name, undefined);
            const name = member.name;
            assert(!memberMap.has(name));
            memberMap.set(name, getValue(member, bp.variableTable));
        }
        for (const member of expectedMemberValues) {
            const rawName = member.name;
            assert.notStrictEqual(rawName, undefined);
            const expected = member.value;
            assert.notStrictEqual(expected, undefined, 'Each expected member must have its value specified');
            const actual = memberMap.get(rawName);
            assert.deepStrictEqual(actual, expected, `Expected ${rawName} to have value ${expected} but found ${actual}`);
        }
    }
    mocha_1.it('should provide data about plain objects', done => {
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-evaluated-expressions-code.js',
                line: 19,
            },
            expressions: ['someObject'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                assertMembers(bp, 0, 'someObject', [
                    { name: 'aNumber', value: '1' },
                    { name: 'aString', value: 'some string' },
                ]);
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => code.foo());
        });
    });
    mocha_1.it('should provide data about arrays', done => {
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-evaluated-expressions-code.js',
                line: 19,
            },
            expressions: ['someArray'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                assertMembers(bp, 0, 'someArray', [
                    { name: '0', value: '1' },
                    { name: '1', value: '2' },
                    { name: '2', value: '3' },
                    { name: 'length', value: '3' },
                ]);
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => code.foo());
        });
    });
    mocha_1.it('should provide data about regexes', done => {
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-evaluated-expressions-code.js',
                line: 19,
            },
            expressions: ['someRegex'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                assertValue(bp, 0, 'someRegex', '/abc+/');
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => code.foo());
        });
    });
    mocha_1.it('should provide data about responses', done => {
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-evaluated-expressions-code.js',
                line: 19,
            },
            expressions: ['res'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                assertMembers(bp, 0, 'res', [
                    // TODO: investigate why "readable" field is not returned by debugger
                    // as of Node 14:
                    // {name: 'readable', value: 'true'},
                    { name: '_eventsCount', value: '0' },
                    { name: '_maxListeners', value: 'undefined' },
                    { name: 'complete', value: 'false' },
                    { name: 'url', value: '' },
                    { name: 'statusCode', value: '200' },
                    { name: '_consuming', value: 'false' },
                    { name: '_dumped', value: 'false' },
                ]);
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => code.foo());
        });
    });
});
//# sourceMappingURL=test-evaluated-expressions.js.map