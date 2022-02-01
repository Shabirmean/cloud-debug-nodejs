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
exports.metadataInstance = exports.projectId = exports.register = exports.oauth2 = void 0;
const gcpMetadata = require("gcp-metadata");
const nock = require("nock");
// In the future _=>true.
function accept() {
    return true;
}
// TODO: Determine if the type of `validator` is correct.
function oauth2(validator) {
    validator = validator || accept;
    return nock('https://oauth2.googleapis.com')
        .post('/token', validator)
        .once()
        .reply(200, {
        refresh_token: 'hello',
        access_token: 'goodbye',
        expiry_date: new Date(9999, 1, 1),
    });
}
exports.oauth2 = oauth2;
// TODO: Determine if the type of `validator` is correct.
function register(validator) {
    validator = validator || accept;
    return nock('https://clouddebugger.googleapis.com')
        .post('/v2/controller/debuggees/register', validator)
        .once()
        .reply(200, { debuggee: {} });
}
exports.register = register;
function projectId(reply) {
    return nock(gcpMetadata.HOST_ADDRESS)
        .get('/computeMetadata/v1/project/project-id')
        .once()
        .reply(200, reply);
}
exports.projectId = projectId;
function metadataInstance() {
    return nock(gcpMetadata.HOST_ADDRESS)
        .get('/computeMetadata/v1/instance')
        .replyWithError({ code: 'ENOTFOUND', message: 'nocked request' });
}
exports.metadataInstance = metadataInstance;
//# sourceMappingURL=nocks.js.map