/*!
 * @module debug/debugger
 */
import { ServiceObject } from '@google-cloud/common';
import { Debug } from '../src/client/stackdriver/debug';
import { Debuggee } from '../src/debuggee';
import * as stackdriver from '../src/types/stackdriver';
export declare class Debugger extends ServiceObject {
    private nextWaitToken;
    private clientVersion;
    /**
     * @constructor
     */
    constructor(debug: Debug);
    /**
     * Gets a list of debuggees in a given project to which the user can set
     * breakpoints.
     * @param {string} projectId - The project ID for the project whose debuggees
     *     should be listed.
     * @param {boolean=} includeInactive - Whether or not to include inactive
     *     debuggees in the list (default false).
     * @param {!function(?Error,Debuggee[]=)} callback - A function that will be
     *     called with a list of Debuggee objects as a parameter, or an Error
     *     object if an error occurred in obtaining it.
     */
    listDebuggees(projectId: string, includeInactive: boolean): Promise<Debuggee[]>;
    /**
     * Gets a list of breakpoints in a given debuggee.
     * @param {string} debuggeeId - The ID of the debuggee whose breakpoints should
     *     be listed.
     * @param {object=} options - An object containing options on the list of
     *     breakpoints.
     * @param {boolean=} options.includeAllUsers - If set to true, include
     *     breakpoints set by all users, or just by the caller (default false).
     * @param {boolean=} options.includeInactive - Whether or not to include
     *     inactive breakpoints in the list (default false).
     * @param {Action=} options.action - Either 'CAPTURE' or 'LOG'. If specified,
     *     only breakpoints with a matching action will be part of the list.
     * @param {!function(?Error,Breakpoint[]=)} callback - A function that will be
     *     called with a list of Breakpoint objects as a parameter, or an Error
     *     object if an error occurred in obtaining it.
     */
    listBreakpoints(debuggeeId: string, options: {
        includeAllUsers?: boolean;
        includeInactive?: boolean;
        action?: stackdriver.Action;
    }): Promise<stackdriver.Breakpoint[]>;
    /**
     * Gets information about a given breakpoint.
     * @param {string} debuggee - The ID of the debuggee in which the breakpoint
     *     is set.
     * @param {string} breakpointId - The ID of the breakpoint to get information
     *     about.
     * @param {!function(?Error,Breakpoint=)} callback - A function that will be
     *     called with information about the given breakpoint, or an Error object
     *     if an error occurred in obtaining its information.
     */
    getBreakpoint(debuggeeId: string, breakpointId: string): Promise<stackdriver.Breakpoint>;
    /**
     * Sets a new breakpoint.
     * @param {Debuggee} debuggeeId - The ID of the debuggee in which the breakpoint
     *     should be set.
     * @param {Breakpoint} breakpoint - An object representing information about
     *     the breakpoint to set.
     * @param {!function(?Error,Breakpoint=)} callback - A function that will be
     *     called with information about the breakpoint that was just set, or an
     *     Error object if an error occurred in obtaining its information. Note
     *     that the Breakpoint object here will differ from the input object in
     *     that its id field will be set.
     */
    setBreakpoint(debuggeeId: string, breakpoint: stackdriver.Breakpoint): Promise<stackdriver.Breakpoint>;
    /**
     * Deletes a breakpoint.
     * @param {Debuggee} debuggeeId - The ID of the debuggee to which the breakpoint
     *     belongs.
     * @param {Breakpoint} breakpointId - The ID of the breakpoint to delete.
     * @param {!function(?Error)} callback - A function that will be
     *     called with a Error object as a parameter if an error occurred in
     *     deleting a breakpoint. If no error occurred, the first argument will be
     *     set to null.
     */
    deleteBreakpoint(debuggeeId: string, breakpointId: string): Promise<void>;
}
