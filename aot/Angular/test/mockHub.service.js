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
import { Subject } from 'rxjs/Subject';
export var Hubs;
(function (Hubs) {
    Hubs[Hubs["Alarm"] = 0] = "Alarm";
    Hubs[Hubs["Platform"] = 1] = "Platform";
    Hubs[Hubs["Patrol"] = 2] = "Patrol";
})(Hubs || (Hubs = {}));
var MockHubService = /** @class */ (function () {
    function MockHubService() {
        this.hubQueue = new Map();
        this.onAlarmHubConnected = new Subject();
        this.onPlatformHubConnected = new Subject();
        this.onPatrolHubConnected = new Subject();
        this.onAlarmMessage = new Subject();
        this.onPlatformMessage = new Subject();
        this.onPatrolMessage = new Subject();
        this.serviceDataLoaded = new Map();
    }
    MockHubService.prototype.pushToQueue = function (hub, msg) {
        return false;
    };
    MockHubService.prototype.setDataLoaded = function (hub) { };
    MockHubService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], MockHubService);
    return MockHubService;
}());
export { MockHubService };
//# sourceMappingURL=mockHub.service.js.map