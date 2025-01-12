import * as stackdriver from '../../types/stackdriver';
import * as v8 from '../../types/v8';
import { ResolvedDebugAgentConfig } from '../config';
/**
 * Checks that the provided expressions will not have side effects and
 * then evaluates the expression in the current execution context.
 *
 * @return an object with error and mirror fields.
 */
export declare function evaluate(expression: string, frame: v8.FrameMirror): {
    error: string | null;
    mirror?: v8.ValueMirror;
};
export declare function testAssert(): void;
/**
 * Captures the stack and current execution state.
 *
 * @return an object with stackFrames, variableTable, and
 *         evaluatedExpressions fields
 */
export declare function capture(execState: v8.ExecutionState, expressions: string[], config: ResolvedDebugAgentConfig, v8debug: v8.Debug): stackdriver.Breakpoint;
