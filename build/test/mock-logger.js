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
exports.MockLogger = void 0;
class MockLogger {
    constructor() {
        this.traces = [];
        this.debugs = [];
        this.infos = [];
        this.warns = [];
        this.errors = [];
        this.fatals = [];
    }
    allCalls() {
        return this.traces.concat(this.debugs, this.infos, this.warns, this.errors, this.fatals);
    }
    clear() {
        this.traces = [];
        this.debugs = [];
        this.infos = [];
        this.warns = [];
        this.errors = [];
        this.fatals = [];
    }
    trace(...args) {
        this.traces.push({ type: 'trace', args });
    }
    debug(...args) {
        this.debugs.push({ type: 'debug', args });
    }
    info(...args) {
        this.infos.push({ type: 'info', args });
    }
    warn(...args) {
        this.warns.push({ type: 'warn', args });
    }
    error(...args) {
        this.errors.push({ type: 'error', args });
    }
    fatal(...args) {
        this.fatals.push({ type: 'fatal', args });
    }
}
exports.MockLogger = MockLogger;
//# sourceMappingURL=mock-logger.js.map