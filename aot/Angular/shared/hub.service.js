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
import { HubConnection, LogLevel } from '@aspnet/signalr-client';
import { UserService } from './user.service';
export var Hubs;
(function (Hubs) {
    Hubs[Hubs["Alarm"] = 0] = "Alarm";
    Hubs[Hubs["Platform"] = 1] = "Platform";
    Hubs[Hubs["Patrol"] = 2] = "Patrol";
})(Hubs || (Hubs = {}));
var HubDefinition = /** @class */ (function () {
    function HubDefinition() {
        this.AutoReconnect = true;
    }
    return HubDefinition;
}());
export { HubDefinition };
var HubService = /** @class */ (function () {
    function HubService(userService) {
        this.userService = userService;
        this.onAlarmHubConnected = new Subject();
        this.onPatrolHubConnected = new Subject();
        this.onPlatformHubConnected = new Subject();
        this.onAlarmMessage = new Subject();
        this.onPlatformMessage = new Subject();
        this.onPatrolMessage = new Subject();
        this.hubQueue = new Map();
        this.serviceDataLoaded = new Map();
        this.hubConnections = [];
        this.hubDefinitions = [];
        this.reconnectTimeout = 30000;
        this.serviceDataLoaded.set(Hubs.Platform, false);
        this.serviceDataLoaded.set(Hubs.Patrol, false);
        var alarmHub = new HubDefinition();
        alarmHub.Type = Hubs.Alarm;
        alarmHub.Name = 'Alarm';
        alarmHub.EndPoint = signalRHubEndpoint + "/alarmHub";
        alarmHub.OnConnected = this.onAlarmHubConnected;
        alarmHub.OnMessage = this.onAlarmMessage;
        this.hubDefinitions[Hubs.Alarm] = alarmHub;
        this.connectToHub(this.hubDefinitions[Hubs.Alarm]);
        var patrolHub = new HubDefinition();
        patrolHub.Type = Hubs.Patrol;
        patrolHub.Name = 'Patrol';
        patrolHub.EndPoint = signalRHubEndpoint + "/patrolHub";
        patrolHub.OnConnected = this.onPatrolHubConnected;
        patrolHub.OnMessage = this.onPatrolMessage;
        this.hubDefinitions[Hubs.Patrol] = patrolHub;
        this.connectToHub(this.hubDefinitions[Hubs.Patrol]);
        var platformHub = new HubDefinition();
        platformHub.Type = Hubs.Platform;
        platformHub.Name = 'Platform';
        platformHub.EndPoint = signalRHubEndpoint + "/platformHub";
        platformHub.OnConnected = this.onPlatformHubConnected;
        platformHub.OnMessage = this.onPlatformMessage;
        this.hubDefinitions[Hubs.Platform] = platformHub;
        this.connectToHub(this.hubDefinitions[Hubs.Platform]);
    }
    HubService.prototype.connectToHub = function (hub) {
        var _this = this;
        this.hubConnections[hub.Type] = new HubConnection(hub.EndPoint, { logging: LogLevel.Error });
        this.hubConnections[hub.Type].start().then(function () {
            // Build list of tenant ids for the current user and join the associated groups
            var tenantIds = [];
            tenantIds.push(_this.userService.currentUser.tenant.Id);
            for (var _i = 0, _a = _this.userService.currentUser.childTenants; _i < _a.length; _i++) {
                var tenant = _a[_i];
                tenantIds.push(tenant.Id);
            }
            _this.hubConnections[hub.Type].invoke('JoinGroups', tenantIds).then(function (res) {
                // Successfully connected and joined groups
                console.info(hub.Name + " hub connected");
                hub.OnConnected.next();
                _this.hubConnections[hub.Type].on('Send', function (msg) {
                    if (_this.pushToQueue(hub.Type, msg)) {
                        return;
                    }
                    if ((hub.Type === Hubs.Alarm && _showAlarmLogs) || (hub.Type === Hubs.Patrol && _showPatrolLogs) || (hub.Type === Hubs.Platform && _showPlatformLogs)) {
                        console.info(hub.Name + " Msg: " + msg);
                    }
                    hub.OnMessage.next(JSON.parse(msg));
                });
                _this.hubConnections[hub.Type].onclose(function (e) {
                    if (hub.AutoReconnect) {
                        console.info("Connection to " + hub.Name + " hub closed. Reconnecting in " + _this.reconnectTimeout / 1000 + " seconds.");
                        _this.serviceDataLoaded.set(hub.Type, false);
                        setTimeout(function () {
                            _this.connectToHub(hub);
                        }, _this.reconnectTimeout);
                    }
                });
            }).catch(function (err) {
                if (hub.AutoReconnect) {
                    console.info("Failed to join " + hub.Name + " hub groups! Retrying in " + _this.reconnectTimeout / 1000 + " seconds.");
                    setTimeout(function () {
                        _this.connectToHub(hub);
                    }, _this.reconnectTimeout);
                }
            });
        })
            .catch(function (err) {
            if (hub.AutoReconnect) {
                console.info("Could not connect " + hub.Name + " hub! Retrying in " + _this.reconnectTimeout / 1000 + " seconds.");
                setTimeout(function () {
                    _this.connectToHub(hub);
                }, _this.reconnectTimeout);
            }
        });
    };
    HubService.prototype.pushToQueue = function (hub, msg) {
        if (!this.serviceDataLoaded.get(hub)) {
            var queue = this.hubQueue.get(hub);
            if (!queue) {
                queue = [];
            }
            queue.push(msg);
            console.info('Queueing ' + Hubs[hub] + ' Msg', queue);
            this.hubQueue.set(hub, queue);
            return true;
        }
        else {
            return false;
        }
    };
    HubService.prototype.setDataLoaded = function (hub) {
        //Process query
        var nullCount = 0;
        while (this.hubQueue.get(hub) && this.hubQueue.get(hub).length > nullCount) {
            nullCount = 0;
            for (var _i = 0, _a = this.hubQueue.get(hub); _i < _a.length; _i++) {
                var msg = _a[_i];
                if (msg) {
                    switch (hub) {
                        case Hubs.Alarm:
                            this.onAlarmMessage.next(JSON.parse(msg));
                            break;
                        case Hubs.Platform:
                            this.onPlatformMessage.next(JSON.parse(msg));
                            break;
                        case Hubs.Patrol:
                            this.onPatrolMessage.next(JSON.parse(msg));
                            break;
                        default:
                            break;
                    }
                    msg = null;
                    nullCount += 1;
                }
                else {
                    nullCount += 1;
                }
            }
        }
        this.serviceDataLoaded.set(hub, true);
        console.info(Hubs[hub] + ' Queue is Empty %c:)', 'color:green');
    };
    HubService.prototype.stopPlatforms = function () {
        this.hubDefinitions[Hubs.Platform].AutoReconnect = false;
        this.hubConnections[Hubs.Platform].stop();
    };
    HubService.prototype.stopAlarms = function () {
        this.hubDefinitions[Hubs.Alarm].AutoReconnect = false;
        this.hubConnections[Hubs.Alarm].stop();
    };
    HubService.prototype.stopPatrols = function () {
        this.hubDefinitions[Hubs.Patrol].AutoReconnect = false;
        this.hubConnections[Hubs.Patrol].stop();
    };
    HubService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [UserService])
    ], HubService);
    return HubService;
}());
export { HubService };
//# sourceMappingURL=hub.service.js.map