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
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
var MockHttpService = /** @class */ (function () {
    function MockHttpService(http) {
        this.http = http;
        this.apiHeaders = {};
    }
    MockHttpService.prototype.get = function (url, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpService.prototype.put = function (url, data, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpService.prototype.post = function (url, data, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpService.prototype.delete = function (url, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpService.prototype.extractData = function (res) {
        return { Result: [] };
    };
    MockHttpService.prototype.handleError = function (error) {
        return {};
    };
    MockHttpService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], MockHttpService);
    return MockHttpService;
}());
export { MockHttpService };
//# sourceMappingURL=mockHttp.service.js.map