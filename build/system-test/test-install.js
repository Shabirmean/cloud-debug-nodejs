"use strict";
// Copyright 2019 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
const execa = require("execa");
const mocha_1 = require("mocha");
const mv = require("mv");
const ncp_1 = require("ncp");
const tmp = require("tmp-promise");
const util_1 = require("util");
const mvp = util_1.promisify(mv);
const ncpp = util_1.promisify(ncp_1.ncp);
const stagingDir = tmp.dirSync({ keep: false, unsafeCleanup: true });
const stagingPath = stagingDir.name;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');
async function run(path) {
    await execa('node', ['--throw-deprecation', `build/src/${path}`], {
        cwd: `${stagingPath}/`,
        stdio: 'inherit',
    });
}
mocha_1.describe('📦 pack and install', () => {
    // npm pack the module, and create a tmp staging directory
    mocha_1.before('pack and install', async () => {
        await execa('npm', ['pack', '--unsafe-perm'], { stdio: 'inherit' });
        const tarball = `google-cloud-debug-agent-${pkg.version}.tgz`;
        await mvp(tarball, `${stagingPath}/debug.tgz`);
        await ncpp('system-test/fixtures/sample', `${stagingPath}/`);
        await execa('npm', ['install', '--unsafe-perm'], {
            cwd: `${stagingPath}/`,
            stdio: 'inherit',
        });
    });
    mocha_1.it('should import the module', async () => {
        await run('import.js');
    });
    mocha_1.it('should import the module and start without arguments', async () => {
        await run('noargs.js');
    });
    mocha_1.it('should start with allowExpressions', async () => {
        await run('allowExpressions.js');
    });
    mocha_1.it('should start with a partial serviceContext', async () => {
        await run('partialServiceContext.js');
    });
    mocha_1.it('should start with a complete serviceContext', async () => {
        await run('completeServiceContext.js');
    });
    mocha_1.it('should import and start with a partial capture', async () => {
        await run('partialCapture.js');
    });
    mocha_1.it('should start with js without arguments', async () => {
        await run('start.js');
    });
    mocha_1.it('should require the module and start with {}', async () => {
        await run('startEmpty.js');
    });
    mocha_1.it('should start with allowExpressions', async () => {
        await run('allowExpressionsJs.js');
    });
    mocha_1.after('cleanup staging', () => {
        stagingDir.removeCallback();
    });
});
//# sourceMappingURL=test-install.js.map