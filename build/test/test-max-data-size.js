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
process.env.GCLOUD_DIAGNOSTICS_CONFIG = 'test/fixtures/test-config.js';
const consoleLogLevel = require("console-log-level");
const assert = require("assert");
const mocha_1 = require("mocha");
const extend = require("extend");
const debugapi = require("../src/agent/v8/debugapi");
const SourceMapper = require("../src/agent/io/sourcemapper");
const scanner = require("../src/agent/io/scanner");
const debuglet_1 = require("../src/agent/debuglet");
const config_1 = require("../src/agent/config");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const foo = require('./test-max-data-size-code.js');
let api;
// TODO: Have this actually implement Breakpoint
const breakpointInFoo = {
    id: 'fake-id-123',
    location: { path: 'build/test/test-max-data-size-code.js', line: 4 },
};
mocha_1.describe('maxDataSize', () => {
    const config = extend({}, config_1.defaultConfig, { forceNewAgent_: true });
    mocha_1.before(done => {
        if (!api) {
            const logger = consoleLogLevel({
                level: debuglet_1.Debuglet.logLevelToName(config.logLevel),
            });
            scanner.scan(config.workingDirectory, /.js$/).then(async (fileStats) => {
                assert.strictEqual(fileStats.errors().size, 0);
                const jsStats = fileStats.selectStats(/.js$/);
                const mapFiles = fileStats.selectFiles(/.map$/, process.cwd());
                const mapper = await SourceMapper.create(mapFiles, logger);
                // TODO: Handle the case when mapper is undefined
                // TODO: Handle the case when v8debugapi.create returns null
                api = debugapi.create(logger, config, jsStats, mapper);
                done();
            });
        }
        else {
            done();
        }
    });
    mocha_1.it('should limit data reported', done => {
        const oldMaxData = config.capture.maxDataSize;
        config.capture.maxDataSize = 5;
        // clone a clean breakpointInFoo
        // TODO: Have this actually implement Breakpoint.
        const bp = {
            id: breakpointInFoo.id,
            location: breakpointInFoo.location,
        };
        // TODO: Determine how to remove this cast to any.
        api.set(bp, err1 => {
            assert.ifError(err1);
            api.wait(bp, (err2) => {
                assert.ifError(err2);
                assert(bp.variableTable.some(v => {
                    return v.status.description.format === 'Max data size reached';
                }));
                api.clear(bp, err3 => {
                    config.capture.maxDataSize = oldMaxData;
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(() => {
                foo(2);
            });
        });
    });
    mocha_1.it('should be unlimited if 0', done => {
        const oldMaxData = config.capture.maxDataSize;
        config.capture.maxDataSize = 0;
        // clone a clean breakpointInFoo
        // TODO: Have this actually implement breakpoint
        const bp = {
            id: breakpointInFoo.id,
            location: breakpointInFoo.location,
        };
        api.set(bp, err1 => {
            assert.ifError(err1);
            api.wait(bp, (err2) => {
                assert.ifError(err2);
                // TODO: The function supplied to reduce is of the wrong type.
                //       Fix this.
                assert(bp.variableTable.reduce((acc, elem) => {
                    return (acc &&
                        (!elem.status ||
                            elem.status.description.format !==
                                'Max data size reached'));
                }));
                api.clear(bp, err3 => {
                    config.capture.maxDataSize = oldMaxData;
                    assert.ifError(err3);
                    done();
                });
            });
            process.nextTick(() => {
                foo(2);
            });
        });
    });
});
//# sourceMappingURL=test-max-data-size.js.map