var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Alarm } from '../../alarms/alarm.class';
import { MockHttpService } from '../mockHttp.service';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
var MockHttpServiceAlarms = /** @class */ (function (_super) {
    __extends(MockHttpServiceAlarms, _super);
    function MockHttpServiceAlarms(http) {
        var _this = _super.call(this, http) || this;
        _this.http = http;
        _this.apiHeaders = {};
        return _this;
    }
    MockHttpServiceAlarms.prototype.get = function (url, headers) {
        return Promise.resolve({ Result: activeAlarms });
    };
    MockHttpServiceAlarms.prototype.put = function (url, data, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpServiceAlarms.prototype.post = function (url, data, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpServiceAlarms.prototype.delete = function (url, headers) {
        return Promise.resolve({ Result: [] });
    };
    MockHttpServiceAlarms.prototype.extractData = function (res) {
        return { Result: [] };
    };
    MockHttpServiceAlarms.prototype.handleError = function (error) {
        return {};
    };
    MockHttpServiceAlarms = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Http])
    ], MockHttpServiceAlarms);
    return MockHttpServiceAlarms;
}(MockHttpService));
export { MockHttpServiceAlarms };
var testAlarm = new Alarm({
    LastUpdateTime: '2017-02-23T01:14:20.5784896',
    State: 1,
    Type: { 'Category': 'Battery', 'Condition': 'Dead' },
    Position: {
        'coordinates': [-86.5864, 34.7605],
        'type': 'Point'
    },
    Description: 'Look at that Dog.',
    Priority: 4,
    Comments: [{ CommentText: 'this is a test', UserId: 'SmartCommand User', Timestamp: moment.utc().format('YYYY-MM-DD HH:mm:ss') }],
    Created: { UserId: 'SmartCommand User', Timestamp: moment().format('YYYY-MM-DD HH:mm:ss') },
    Acknowledged: null,
    Cleared: null,
    Dismissed: null,
    Sensor: null,
    Sensors: [],
    TenantId: '777bdc88-dc28-4908-a4d2-d766131c5777',
    Id: '007'
});
var activeAlarms = [testAlarm];
window.currentUser = { Bearer: 'jibberish', tenant: '{ "TenantId": "8bfef93b-0d2c-47d0-8bef-033ea5bd57e2", "CustomerName": "Securitas", "Locations": [], "ParentId": "" }' };
window.activeAlarms = activeAlarms;
//# sourceMappingURL=mockHttp.service.js.map