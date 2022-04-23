var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { RequestOptions, Response, Http, ResponseContentType } from '@angular/http';
import { UserService } from './user.service';
import { ApplicationInsightsService } from '../application-insights.service';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
var HttpService = /** @class */ (function () {
    function HttpService(http, userService, appInsights) {
        this.http = http;
        this.userService = userService;
        this.appInsights = appInsights;
        this.doLoginCheck = (typeof pdfView === 'undefined') ? true : false;
        this.apiHeaders = {};
        this.setupApiHeaders();
    }
    //USED BY IMAGE UPLOAD
    //IF CHANGES ARE MADE, TEST THAT IMAGE UPLOAD STILL WORKS! --JJL
    HttpService.prototype.getApiAuthorizationHeader = function () {
        return this.apiHeaders.Authorization;
    };
    HttpService.prototype.getApiBaseUrl = function () {
        return apiBaseUrl;
    };
    HttpService.prototype.setupApiHeaders = function () {
        if (this.userService.currentUser) {
            this.apiHeaders.Authorization = 'Bearer ' + this.userService.currentUser.bearer;
        }
        this.apiHeaders['Content-Type'] = 'application/json';
        // Need x-requested-with in order for c# to know this is an ajax request
        this.apiHeaders['X-Requested-With'] = 'XMLHttpRequest';
        $.ajaxSetup({ headers: this.apiHeaders });
    };
    HttpService.prototype.get = function (url, data) {
        var _this = this;
        this.appInsights.startTrackEvent('http:get:' + url);
        return this.checkLogin().then(function (result) {
            if (result) {
                var promise = new Promise(function (resolve, reject) {
                    $.get(apiBaseUrl + url, data, function (response) {
                        resolve(response);
                    });
                }).catch(_this.handleError);
                _this.appInsights.stopTrackEvent('http:get:' + url, { data: data });
                return promise;
            }
        });
    };
    HttpService.prototype.put = function (url, data, headers) {
        var _this = this;
        this.appInsights.startTrackEvent('http:put:' + url);
        return this.checkLogin().then(function (result) {
            if (result) {
                if (!headers) {
                    headers = _this.apiHeaders;
                }
                var options = new RequestOptions({ headers: headers });
                var promise = _this.http.put(apiBaseUrl + url, JSON.stringify(data), options).toPromise().then(_this.extractData)
                    .catch(_this.handleError);
                _this.appInsights.stopTrackEvent('http:put:' + url, { data: data, headers: headers });
                return promise;
            }
        });
    };
    HttpService.prototype.post = function (url, data, headers, isLocal, errorCallback) {
        var _this = this;
        this.appInsights.startTrackEvent('http:post:' + url);
        return this.checkLogin().then(function (result) {
            if (result) {
                if (!headers) {
                    headers = _this.apiHeaders;
                }
                var path = isLocal ? url : apiBaseUrl + url;
                var options = new RequestOptions({ headers: headers });
                var promise = _this.http.post(path, JSON.stringify(data), options).toPromise().then(_this.extractData)
                    .catch(function (error) { return (_this.handleError(error, errorCallback)); });
                _this.appInsights.stopTrackEvent('http:post:' + url, { data: data, headers: headers, isLocal: isLocal });
                return promise;
            }
        });
    };
    HttpService.prototype.postPdf = function (url, data, headers, isLocal) {
        var _this = this;
        this.appInsights.startTrackEvent('http:postPdf:' + url);
        return this.checkLogin().then(function (result) {
            if (result) {
                if (!headers) {
                    headers = _this.apiHeaders;
                }
                var path = isLocal ? url : apiBaseUrl + url;
                var options = new RequestOptions({ responseType: ResponseContentType.Blob, headers: headers });
                var promise = _this.http.post(path, JSON.stringify(data), options).toPromise().then(_this.extractPdfData)
                    .catch(_this.handleError);
                _this.appInsights.stopTrackEvent('http:postPdf:' + url, { data: data, headers: headers, isLocal: isLocal });
                return promise;
            }
        });
    };
    HttpService.prototype.delete = function (url, headers) {
        var _this = this;
        this.appInsights.startTrackEvent('http:delete:' + url);
        return this.checkLogin().then(function (result) {
            if (result) {
                if (!headers) {
                    headers = _this.apiHeaders;
                }
                var options = new RequestOptions({ headers: headers });
                var promise = _this.http.delete(apiBaseUrl + url, options).toPromise().then(_this.extractData)
                    .catch(_this.handleError);
                _this.appInsights.stopTrackEvent('http:delete:' + url, { headers: headers });
                return promise;
            }
        });
    };
    HttpService.prototype.extractData = function (res) {
        if (!res) {
            return null;
        }
        if (!res['_body']) {
            return null;
        }
        return res.json();
    };
    HttpService.prototype.extractPdfData = function (res) {
        if (!res) {
            return null;
        }
        if (!res['_body']) {
            return null;
        }
        return new Blob([res.blob()], { type: 'application/pdf' });
    };
    HttpService.prototype.handleError = function (error, callback) {
        var errMsg;
        if (error instanceof Response) {
            var body = error.json() || '';
            var err = body.error || JSON.stringify(body);
            errMsg = error.status + " - " + (error.statusText || '') + " " + err;
        }
        else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error('Http Error', errMsg);
        if (callback) {
            callback(errMsg);
        }
        return Promise.reject(errMsg);
    };
    HttpService.prototype.checkLogin = function () {
        var _this = this;
        return new Promise(function (resolve) {
            if (_this.doLoginCheck) {
                // Try to find the authentication cookie
                if (document.cookie.indexOf('.SMARTCOMMANDAUTH') < 0) {
                    // cookie does not exist so users login has expired. try to renew
                    _this.doLoginCheck = false;
                    _this.post('/Account/RenewLogin', null, null, true).then(function (res) {
                        _this.doLoginCheck = true;
                        if (res.token) {
                            _this.userService.currentUser.bearer = res.token;
                            _this.setupApiHeaders();
                            resolve(true);
                        }
                        else {
                            // no token returned, so unable to renew login
                            window.location.href = '/Account/Login';
                            resolve(false);
                        }
                    });
                }
                else {
                    resolve(true);
                }
            }
            else {
                resolve(true);
            }
        });
    };
    HttpService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http, UserService, ApplicationInsightsService])
    ], HttpService);
    return HttpService;
}());
export { HttpService };
//# sourceMappingURL=http.service.js.map