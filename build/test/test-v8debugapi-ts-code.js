"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dist = void 0;
/* 6*/
/* 7*/ function dist(pt1, pt2) {
    /* 8*/ const xdiff = pt1.x - pt2.x;
    /* 9*/ const ydiff = pt1.y - pt2.y;
    /*10*/ const pnorm1 = Math.abs(xdiff) + Math.abs(ydiff);
    /*11*/ const pnorm2 = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    /*12*/ return { pnorm1, pnorm2 };
    /*13*/
}
exports.dist = dist;
/*
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//# sourceMappingURL=test-v8debugapi-ts-code.js.map