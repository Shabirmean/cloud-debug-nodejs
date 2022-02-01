import * as nock from 'nock';
export declare type Validator = (body: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
}) => boolean;
export declare function oauth2(validator?: Validator): nock.Scope;
export declare function register(validator?: Validator): nock.Scope;
export declare function projectId(reply: string): nock.Scope;
export declare function metadataInstance(): nock.Scope;
