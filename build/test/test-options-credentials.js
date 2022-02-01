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
const extend = require("extend");
const nock = require("nock");
const path = require("path");
const config = require("../src/agent/config");
const debuglet_1 = require("../src/agent/debuglet");
const debug_1 = require("../src/client/stackdriver/debug");
const nocks = require("./nocks");
const envProject = process.env.GCLOUD_PROJECT;
const packageInfo = {
    name: 'Some name',
    version: 'Some version',
};
nock.disableNetConnect();
mocha_1.describe('test-options-credentials', () => {
    let debuglet = null;
    mocha_1.beforeEach(() => {
        delete process.env.GCLOUD_PROJECT;
        assert.strictEqual(debuglet, null);
    });
    mocha_1.afterEach(() => {
        assert.ok(debuglet);
        debuglet.stop();
        debuglet = null;
        process.env.GCLOUD_PROJECT = envProject;
    });
    mocha_1.it('should use the keyFilename field of the options object', done => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const credentials = require('./fixtures/gcloud-credentials.json');
        const options = extend({}, {
            projectId: 'fake-project',
            keyFilename: path.join(__dirname, 'fixtures', 'gcloud-credentials.json'),
        });
        const debug = new debug_1.Debug(options, packageInfo);
        const scope = nocks.oauth2(body => {
            assert.strictEqual(body.client_id, credentials.client_id);
            assert.strictEqual(body.client_secret, credentials.client_secret);
            assert.strictEqual(body.refresh_token, credentials.refresh_token);
            return true;
        });
        // Since we have to get an auth token, this always gets intercepted second.
        nocks.register(() => {
            scope.done();
            setImmediate(done);
            return true;
        });
        nocks.projectId('project-via-metadata');
        // TODO: Determine how to remove this cast.
        debuglet = new debuglet_1.Debuglet(debug, config);
        debuglet.start();
    });
    mocha_1.it('should use the credentials field of the options object', done => {
        const options = extend({}, {
            projectId: 'fake-project',
            credentials: require('./fixtures/gcloud-credentials.json'),
        });
        const debug = new debug_1.Debug(options, packageInfo);
        const scope = nocks.oauth2(body => {
            assert.strictEqual(body.client_id, options.credentials.client_id);
            assert.strictEqual(body.client_secret, options.credentials.client_secret);
            assert.strictEqual(body.refresh_token, options.credentials.refresh_token);
            return true;
        });
        // Since we have to get an auth token, this always gets intercepted second.
        nocks.register(() => {
            scope.done();
            setImmediate(done);
            return true;
        });
        nocks.projectId('project-via-metadata');
        // TODO: Determine how to remove this cast.
        debuglet = new debuglet_1.Debuglet(debug, config);
        debuglet.start();
    });
    mocha_1.it('should ignore keyFilename if credentials is provided', done => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fileCredentials = require('./fixtures/gcloud-credentials.json');
        const credentials = {
            client_id: 'a',
            client_secret: 'b',
            refresh_token: 'c',
            type: 'authorized_user',
        };
        const options = extend({}, {
            projectId: 'fake-project',
            keyFilename: path.join('test', 'fixtures', 'gcloud-credentials.json'),
            credentials,
        });
        const debug = new debug_1.Debug(options, packageInfo);
        const scope = nocks.oauth2(body => {
            assert.strictEqual(body.client_id, credentials.client_id);
            assert.strictEqual(body.client_secret, credentials.client_secret);
            assert.strictEqual(body.refresh_token, credentials.refresh_token);
            return true;
        });
        // Since we have to get an auth token, this always gets intercepted second.
        nocks.register(() => {
            scope.done();
            setImmediate(done);
            return true;
        });
        nocks.projectId('project-via-metadata');
        ['client_id', 'client_secret', 'refresh_token'].forEach(field => {
            assert(Object.prototype.hasOwnProperty.call(fileCredentials, field));
            assert(Object.prototype.hasOwnProperty.call(options.credentials, field));
            assert.notStrictEqual(options.credentials[field], fileCredentials[field]);
        });
        // TODO: Determine how to remove this cast.
        debuglet = new debuglet_1.Debuglet(debug, config);
        debuglet.start();
    });
});
//# sourceMappingURL=test-options-credentials.js.map