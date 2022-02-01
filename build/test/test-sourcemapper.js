"use strict";
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const mocha_1 = require("mocha");
const path = require("path");
const sm = require("../src/agent/io/sourcemapper");
const mock_logger_1 = require("./mock-logger");
const BASE_PATH = path.join(__dirname, 'fixtures', 'sourcemapper');
const QUICK_MILLISECONDS = 300;
mocha_1.describe('sourcemapper debug info', () => {
    const logger = new mock_logger_1.MockLogger();
    const mapFilePath = path.join(BASE_PATH, path.join('typescript', 'out.js.map'));
    mocha_1.it('should be printed upon creation', async () => {
        const sourcemapper = await sm.create([mapFilePath], logger);
        // Verify if the debugging information is correctly printed.
        const expectedDebugMessages = [
            'debugging information ...',
            path.normalize('test/fixtures/sourcemapper/typescript/in.ts'),
            path.normalize('test/fixtures/sourcemapper/typescript/out.js'),
            path.normalize('test/fixtures/sourcemapper/typescript/out.js.map'),
            'sources: in.ts',
        ];
        for (let i = 0; i < expectedDebugMessages.length; i++) {
            // We use 'indexOf' here instead of 'match' to avoid parsing regular
            // expression, which will confuse the result when having '\' in the path
            // name on platform like Windows.
            assert.notStrictEqual(logger.debugs[i].args[0].indexOf(expectedDebugMessages[i]), -1, `'${logger.debugs[i].args[0]}' does not match '${expectedDebugMessages[i]}'`);
        }
        assert.strictEqual(logger.debugs.length, sourcemapper.infoMap.size * 4 + 1);
    });
    mocha_1.it('should be printed when upon get infomap output', async () => {
        const sourcemapper = await sm.create([mapFilePath], logger);
        const inputFilePath = path.join(BASE_PATH, path.join('typescript', 'in.ts'));
        const mapInfoInput = sourcemapper.getMapInfoInput(inputFilePath);
        assert.notEqual(mapInfoInput, null);
        sourcemapper.getMapInfoOutput(1, 0, mapInfoInput);
        // Verify if the debugging information is correctly printed.
        // We use 'indexOf' here instead of 'match' to avoid parsing regular
        // expression, which will confuse the result when having '\' in the path
        // name on platform like Windows.
        const expectedDebugMessages = [
            `sourcemapper entry.inputFile: ${inputFilePath}`,
            'sourcePos: {"source":"in.ts","line":2,"column":0}',
            'mappedPos: {"line":6,"column":0,"lastColumn":null}',
        ].reverse();
        const debugsLength = logger.debugs.length;
        for (let i = 0; i < expectedDebugMessages.length; i++) {
            assert.notStrictEqual(logger.debugs[debugsLength - i - 1].args[0].indexOf(expectedDebugMessages[i]), -1, `'${logger.debugs[debugsLength - i - 1].args[0]}' does not match '${expectedDebugMessages[i]}'`);
        }
    });
});
/**
 * @param {string} tool The name of the tool that was used to generate the
 *  given sourcemap data
 * @param {string} mapFilePath The path to the sourcemap file of a
 *  transpilation to test
 * @param {string} inputFilePath The path to the input file that was
 *  transpiled to generate the specified sourcemap file
 * @param {string} outputFilePath The path to the output file that was
 *  generated during the transpilation process that constructed the
 *  specified sourcemap file
 * @param {Array.<Array.<number, number>>} inToOutLineNums An array of arrays
 *  where each element in the array is a pair of numbers.  The first number
 *  in the pair is the line number from the input file and the second number
 *  in the pair is the expected line number in the corresponding output file
 *
 *  Note: The line numbers are zero-based
 */
function testTool(tool, mapFilePath, inputFilePath, outputFilePath, inToOutLineNums) {
    mocha_1.describe('sourcemapper for tool ' + tool, () => {
        const logger = new mock_logger_1.MockLogger();
        let sourcemapper;
        mocha_1.it('for tool ' + tool, async () => {
            const start = Date.now();
            sourcemapper = await sm.create([mapFilePath], logger);
            assert(Date.now() - start < QUICK_MILLISECONDS, 'should create the SourceMapper quickly');
        });
        mocha_1.it('for tool ' +
            tool +
            ' it states that it has mapping info for files it knows about', done => {
            assert.notStrictEqual(sourcemapper.getMapInfoInput(inputFilePath), null, `The sourcemapper should have information about '${inputFilePath}'`);
            done();
        });
        mocha_1.it('for tool ' +
            tool +
            ' it states that it has mapping info for files with a path' +
            ' similar to a path it knows about', done => {
            assert.notStrictEqual(sourcemapper.getMapInfoInput(inputFilePath), null);
            const movedPath = path.join('/some/other/base/dir/', inputFilePath);
            assert.notStrictEqual(sourcemapper.getMapInfoInput(inputFilePath), null, `The sourcemapper should have information about paths similar to '${movedPath}'`);
            done();
        });
        mocha_1.it('for tool ' +
            tool +
            ' it states that it does not have mapping info for a file it ' +
            "doesn't recognize", done => {
            const invalidPath = inputFilePath + '_INVALID';
            assert.strictEqual(sourcemapper.getMapInfoInput(invalidPath), null, `The source mapper should not have information the path '${invalidPath}' it doesn't recognize`);
            done();
        });
        mocha_1.it('for tool ' +
            tool +
            ' it can get mapping info output when input file does not exist in the source map', done => {
            const mapInfoInput = sourcemapper.getMapInfoInput(inputFilePath);
            assert.notEqual(mapInfoInput, null);
            const mapInfoOutput = sourcemapper.getMapInfoOutput(10, 0, {
                outputFile: mapInfoInput.outputFile,
                inputFile: 'some/file/not/in/sourcemap',
                mapFile: mapInfoInput.mapFile,
                mapConsumer: mapInfoInput.mapConsumer,
                sources: mapInfoInput.sources,
            });
            assert.notEqual(mapInfoOutput, null);
            assert.strictEqual(mapInfoOutput.file, mapInfoInput.outputFile);
            assert.strictEqual(mapInfoOutput.line, -1);
            done();
        });
        const testLineMapping = (inputLine, expectedOutputLine) => {
            const mapInfoInput = sourcemapper.getMapInfoInput(inputFilePath);
            assert.notEqual(mapInfoInput, null);
            const info = sourcemapper.getMapInfoOutput(inputLine, 0, mapInfoInput);
            assert.strictEqual(info.file, outputFilePath);
            assert.strictEqual(info.line, expectedOutputLine, ' invalid mapping for input line ' +
                inputLine +
                ' Expected: ' +
                expectedOutputLine +
                ', Found: ' +
                info.line);
        };
        mocha_1.it('for tool ' + tool + ' it properly maps line numbers', done => {
            inToOutLineNums.forEach(inToOutPair => {
                testLineMapping(inToOutPair[0], inToOutPair[1]);
            });
            done();
        });
    });
}
testTool('Babel', path.join(BASE_PATH, path.join('babel', 'out.js.map')), path.join(BASE_PATH, path.join('babel', 'in.js')), path.join(BASE_PATH, path.join('babel', 'out.js')), [
    [1, 14],
    [2, 15],
    [3, 16],
    [4, 17],
    [5, 18],
    [6, 19],
    [8, 21],
    [9, 22],
    [11, 24],
    [12, 26],
    [13, 27],
    [14, 30],
    [15, 31],
    [16, 32],
    [18, 36],
    [19, 37],
    [20, 38],
    [21, 39],
    [23, 42],
    [24, 43],
    [25, 44],
    [28, 50],
    [29, 53],
    [30, 56],
    [31, 58],
    [32, 60],
    [34, 64],
    [35, 65],
    [36, 66],
    [37, 67],
    [39, 70],
    [40, 71],
    [44, 78],
    [45, 81],
    [47, 83],
    [50, 85],
    [54, 88],
    [55, 89],
    [56, 90],
    [59, 93],
    [62, 99],
    [63, 102],
    [66, 105],
    [69, 108],
    [70, 109],
    [73, 112],
    [74, 113],
    [77, 116],
    [78, 117],
    [79, 118],
]);
testTool('Typescript', path.join(BASE_PATH, path.join('typescript', 'out.js.map')), path.join(BASE_PATH, path.join('typescript', 'in.ts')), path.join(BASE_PATH, path.join('typescript', 'out.js')), [
    [1, 5],
    [2, 6],
    [3, 9],
    [4, 10],
    [7, 12],
    [8, 13],
    [12, 17],
    [13, 19],
    [14, 20],
    [18, 24],
    [19, 25],
    [22, 27],
    [23, 28],
]);
// This test is for testing that by providing a partial partial match of the
// source file, the breakpoint can still be set correctly.
testTool('Typescript with sub path', path.join(BASE_PATH, path.join('typescript', 'out.js.map')), 'in.ts', path.join(BASE_PATH, path.join('typescript', 'out.js')), [[1, 5]]);
testTool('Coffeescript', path.join(BASE_PATH, path.join('coffeescript', 'in.js.map')), path.join(BASE_PATH, path.join('coffeescript', 'in.coffee')), path.join(BASE_PATH, path.join('coffeescript', 'in.js')), [
    [1, 1],
    [2, 7],
    [3, 8],
    [4, 9],
    [6, 12],
    [7, 13],
    [9, 20],
    [10, 23],
    [11, 24],
    [13, 31],
    [15, 33],
    [17, 36],
    [19, 38],
    [20, 40],
    [21, 44],
]);
testTool('Webpack with Typescript', path.join(BASE_PATH, path.join('webpack-ts', 'out.js.map')), path.join(BASE_PATH, path.join('webpack-ts', 'in.ts_')), path.join(BASE_PATH, path.join('webpack-ts', 'out.js')), [
    [3, 93],
    [4, 94],
    [8, 97],
]);
//# sourceMappingURL=test-sourcemapper.js.map