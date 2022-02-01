"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const assert = require("assert");
const mocha_1 = require("mocha");
const extend = require("extend");
const config_1 = require("../src/agent/config");
const debuglet_1 = require("../src/agent/debuglet");
const scanner = require("../src/agent/io/scanner");
const SourceMapper = require("../src/agent/io/sourcemapper");
const utils = require("../src/agent/util/utils");
const debugapi = require("../src/agent/v8/debugapi");
const consoleLogLevel = require("console-log-level");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const code = require('./test-expression-side-effect-code.js');
// the inspector protocol is only used on Node >= 10 and thus isn't
// tested on earlier versions
const itWithInspector = utils.satisfies(process.version, '>=10') ? mocha_1.it : mocha_1.it.skip;
mocha_1.describe('evaluating expressions', () => {
    let api;
    const config = extend({}, config_1.defaultConfig, { forceNewAgent_: true });
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
    itWithInspector('should evaluate expressions without side effects', done => {
        // this test makes sure that the necessary environment variables to
        // enable asserts are present during testing. Use run-tests.sh, or
        // export CLOUD_DEBUG_ASSERTIONS=1 to make sure this test passes.
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-expression-side-effect-code.js',
                line: 16,
            },
            expressions: ['item.getPrice()'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                const watch = bp.evaluatedExpressions[0];
                assert.strictEqual(watch.value, '2');
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => {
                code.foo();
            });
        });
    });
    itWithInspector('should not evaluate expressions with side effects', done => {
        // this test makes sure that the necessary environment variables to
        // enable asserts are present during testing. Use run-tests.sh, or
        // export CLOUD_DEBUG_ASSERTIONS=1 to make sure this test passes.
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-expression-side-effect-code.js',
                line: 16,
            },
            expressions: ['item.increasePriceByOne()'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                const watch = bp.evaluatedExpressions[0];
                assert(watch.status.isError);
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => {
                code.foo();
            });
        });
    });
    itWithInspector('should not evaluate process.title', done => {
        // this test makes sure that the necessary environment variables to enable
        // asserts are present during testing. Use run-tests.sh, or export
        // CLOUD_DEBUG_ASSERTIONS=1 to make sure this test passes.
        const bp = {
            id: 'fake-id-123',
            location: {
                path: 'build/test/test-expression-side-effect-code.js',
                line: 16,
            },
            expressions: ['process'],
        };
        api.set(bp, err => {
            assert.ifError(err);
            api.wait(bp, err => {
                assert.ifError(err);
                const exp = bp.evaluatedExpressions[0];
                assert(exp);
                const varIndex = exp.varTableIndex;
                assert(varIndex);
                const members = bp.variableTable[varIndex].members;
                assert(members);
                for (const entry of members) {
                    if (entry.name === 'title') {
                        assert(entry.value === undefined);
                    }
                }
                api.clear(bp, err => {
                    assert.ifError(err);
                    done();
                });
            });
            process.nextTick(() => {
                code.foo();
            });
        });
    });
});
//# sourceMappingURL=test-expression-side-effect.js.map