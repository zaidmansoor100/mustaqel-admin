import {environment} from "../../environments/environment";


export interface IAppVars {
    env: object | any
    apiVersion: any
    apiURL: any,
    mediaURL: any,
}

export const AppVars: IAppVars = {
    env: environment,
    apiVersion: '1',
    apiURL: environment.apiHostUrl + '/api/v1/',
    mediaURL: environment.mediaURL,
};
