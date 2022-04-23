// Get reference to the global api base url variable
declare let apiBaseUrl: string;
declare let pdfView: boolean;

import { Injectable, Injector } from '@angular/core';
import { RequestOptions, Response, Http, ResponseContentType  } from '@angular/http';
import { UserService } from './user.service';
import { ApplicationInsightsService } from '../application-insights.service';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HttpService {
    doLoginCheck: boolean = (typeof pdfView === 'undefined') ? true : false;
    private apiHeaders: any = {};

    //USED BY IMAGE UPLOAD
    //IF CHANGES ARE MADE, TEST THAT IMAGE UPLOAD STILL WORKS! --JJL
	public getApiAuthorizationHeader(): string {
        return this.apiHeaders.Authorization;
	}

	public getApiBaseUrl(): string {
		return apiBaseUrl;
	}

	constructor(private http: Http, private userService: UserService, private appInsights: ApplicationInsightsService) {
		this.setupApiHeaders();
	}

    private setupApiHeaders() {
        if (this.userService.currentUser) {
            this.apiHeaders.Authorization = 'Bearer ' + this.userService.currentUser.bearer;
        }
        this.apiHeaders['Content-Type'] = 'application/json';
        // Need x-requested-with in order for c# to know this is an ajax request
        this.apiHeaders['X-Requested-With'] = 'XMLHttpRequest';
        $.ajaxSetup({ headers: this.apiHeaders });
    }

	get(url: string, data?: any): Promise<any> {
		this.appInsights.startTrackEvent('http:get:' + url);

        return this.checkLogin().then((result) => {
			if (result) {
				let promise = new Promise((resolve, reject) => {
					$.get(apiBaseUrl + url, data, function (response) {
						resolve(response);
					})
				}).catch(this.handleError);

				this.appInsights.stopTrackEvent('http:get:' + url, { data: data }); 
				return promise;
            }
        });
	}

	put(url: string, data: any, headers?: any): Promise<any> {
		this.appInsights.startTrackEvent('http:put:' + url);

		return this.checkLogin().then((result) => {
			if (result) {
                if (!headers) {
                    headers = this.apiHeaders;
                }

                let options = new RequestOptions({ headers: headers });
				let promise = this.http.put(apiBaseUrl + url, JSON.stringify(data), options).toPromise().then(this.extractData)
					.catch(this.handleError);

				this.appInsights.stopTrackEvent('http:put:' + url, { data: data, headers: headers });
				return promise;
            }
        });
    }

    post(url: string, data: any, headers?: any, isLocal?: boolean, errorCallback?: any): Promise<any> {
		this.appInsights.startTrackEvent('http:post:' + url);

		return this.checkLogin().then((result) => {
			if (result) {
                if (!headers) {
                    headers = this.apiHeaders;
                }

                let path = isLocal ? url : apiBaseUrl + url;
                let options = new RequestOptions({ headers: headers });
				let promise = this.http.post(path, JSON.stringify(data), options).toPromise().then(this.extractData)
					.catch((error) => { return (this.handleError(error, errorCallback)); });

				this.appInsights.stopTrackEvent('http:post:' + url, { data: data, headers: headers, isLocal: isLocal });
				return promise;
            }
        });
    }

    postPdf(url: string, data: any, headers?: any, isLocal?: boolean): Promise<any> {
		this.appInsights.startTrackEvent('http:postPdf:' + url);

		return this.checkLogin().then((result) => {
			if (result) {
                if (!headers) {
                    headers = this.apiHeaders;
                }

                let path = isLocal ? url : apiBaseUrl + url;
                let options = new RequestOptions({ responseType: ResponseContentType.Blob, headers: headers });
				let promise = this.http.post(path, JSON.stringify(data), options).toPromise().then(this.extractPdfData)
					.catch(this.handleError);

				this.appInsights.stopTrackEvent('http:postPdf:' + url, { data: data, headers: headers, isLocal: isLocal });
				return promise;
            }
        });
    }

	delete(url: string, headers?: any): Promise<any> {
		this.appInsights.startTrackEvent('http:delete:' + url);

        return this.checkLogin().then((result) => {
            if (result) {
                if (!headers) {
                    headers = this.apiHeaders;
                }

                let options = new RequestOptions({ headers: headers });
				let promise = this.http.delete(apiBaseUrl + url, options).toPromise().then(this.extractData)
					.catch(this.handleError);

				this.appInsights.stopTrackEvent('http:delete:' + url, { headers: headers });
				return promise;
			}
        });
    }

	extractData(res: Response): any {
		if (!res) {
			return null;
		}

		if (!res['_body']) {
			return null;
		}

		return res.json();
    }

    extractPdfData(res: Response): any {
        if (!res) {
            return null;
        }

        if (!res['_body']) {
            return null;
        }

        return new Blob([res.blob()], { type: 'application/pdf' });
    }

    handleError(error: Response | any, callback?:any): any {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
		}

		console.error('Http Error', errMsg);

		if (callback) {
			callback(errMsg);
		}
        return Promise.reject(errMsg);
    }

    public checkLogin(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.doLoginCheck) {
                // Try to find the authentication cookie
                if (document.cookie.indexOf('.SMARTCOMMANDAUTH') < 0) {
                    // cookie does not exist so users login has expired. try to renew
                    this.doLoginCheck = false;
                    this.post('/Account/RenewLogin', null, null, true).then(res => {
                        this.doLoginCheck = true;

                        if (res.token) {
                            this.userService.currentUser.bearer = res.token;
                            this.setupApiHeaders();
                            resolve(true);
                        } else {
                            // no token returned, so unable to renew login
                            window.location.href = '/Account/Login';
                            resolve(false);
                        }
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    }
}