import consoleLogLevel = require('console-log-level');
export declare type Arguments = string[];
export interface Call {
    type: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    args: Arguments;
}
export declare class MockLogger implements consoleLogLevel.Logger {
    traces: Call[];
    debugs: Call[];
    infos: Call[];
    warns: Call[];
    errors: Call[];
    fatals: Call[];
    allCalls(): Call[];
    clear(): void;
    trace(...args: Arguments): void;
    debug(...args: Arguments): void;
    info(...args: Arguments): void;
    warn(...args: Arguments): void;
    error(...args: Arguments): void;
    fatal(...args: Arguments): void;
}
