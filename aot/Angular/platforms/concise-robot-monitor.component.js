var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, trigger, state, style, transition, animate, ViewChild, ElementRef, Input } from '@angular/core';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { MapService } from '../map/map.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PatrolStatusValues } from './../patrols/patrol.class';
import { PatrolService } from './../patrols/patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { WindowService, WindowMessage } from './../shared/window.service';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { UserService } from './../shared/user.service';
import { MapViewOptions } from './../shared/map-view-options.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { HubService } from "../shared/hub.service";
var ConciseRobotMonitor = /** @class */ (function () {
    function ConciseRobotMonitor(alarmMapService, platformMapService, mapService, patrolService, platformService, windowService, userService, ref, hubService) {
        this.alarmMapService = alarmMapService;
        this.platformMapService = platformMapService;
        this.mapService = mapService;
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.windowService = windowService;
        this.userService = userService;
        this.ref = ref;
        this.hubService = hubService;
        this.actionMenuOpen = false;
        this.isShown = false;
        this.sliderIndex = 0;
        this.joystickExpanded = false;
        this.ngUnsubscribe = new Subject();
        this.actionMenuUnsub = new Subject();
        this.tearOffPlatformMap = new Map();
        this.platformSubCollection = new Map();
        this.patrolSubCollection = new Map();
        this.alarmSubCollection = new Map();
    }
    ConciseRobotMonitor.prototype.processJoystick = function (data) {
        console.info('Joystick', data);
    };
    ConciseRobotMonitor.prototype.setPlatform = function (platform) {
        if (platform) {
            this.platform = platform;
            this.secondaryCamaras = this.platform.Cameras.slice(1, this.platform.Cameras.length);
            if (this.mapService.centerOffsetX === 0) {
                this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = (-459 / 2);
                this.mapService.panToCenter();
            }
            this.isShown = true;
        }
        else {
            this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = (459 / 2);
            this.mapService.panToCenter();
            this.alarmMapService.centerOffsetX = this.platformMapService.centerOffsetX = this.mapService.centerOffsetX = 0;
            this.isShown = false;
        }
        this.ref.detectChanges();
    };
    ConciseRobotMonitor.prototype.isPatrolPausedEnabled = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        return (patrolInstance && patrolInstance.CurrentStatus !== PatrolStatusValues.Paused);
    };
    ConciseRobotMonitor.prototype.isPatrolResumeEnabled = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        return (patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused);
    };
    ConciseRobotMonitor.prototype.animationDone = function (event) {
        if (!this.isShown) {
            this.platform = null;
        }
        this.ref.detectChanges();
    };
    ConciseRobotMonitor.prototype.getSecondaryCamras = function () {
        return this.secondaryCamaras.slice(this.sliderIndex, this.secondaryCamaras.length);
    };
    ConciseRobotMonitor.prototype.slideBack = function () {
        var secondaryLength = this.secondaryCamaras.slice(1, this.secondaryCamaras.length).length;
        this.sliderIndex = ((this.sliderIndex + 1) >= (secondaryLength)) ? this.sliderIndex : this.sliderIndex + 1;
    };
    ConciseRobotMonitor.prototype.slideForward = function () {
        this.sliderIndex = (this.sliderIndex - 1 < 0) ? 0 : this.sliderIndex - 1;
    };
    ConciseRobotMonitor.prototype.confirmAbortPatrol = function () {
        if (this.patrolService.getPatrolInstanceByPlatformId(this.platform.id) || this.platform.IsPatrolSubmitted) {
            this.confirmAbort.show();
        }
    };
    ConciseRobotMonitor.prototype.handleAbortPatrol = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        if (patrolInstance) {
            this.patrolService.abortPatrol(patrolInstance, patrolInstance.TemplateId, this.platform.id);
        }
        else if (this.platform.IsPatrolSubmitted) {
            this.patrolService.abortPatrol(null, this.platform.PatrolTemplateSubmittedId, this.platform.id);
        }
    };
    ConciseRobotMonitor.prototype.setUpComs = function (windowHandleId) {
        var _this = this;
        this.platformSubCollection.set(windowHandleId, this.hubService.onPlatformMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                var wMsg = new WindowMessage();
                wMsg.windowId = windowHandleId;
                wMsg.data = {
                    platformMessage: msg
                };
                _this.windowService.pushMessageToWindow(wMsg);
            }
        }));
        this.patrolSubCollection.set(windowHandleId, this.hubService.onPatrolMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                var wMsg = new WindowMessage();
                wMsg.windowId = windowHandleId;
                wMsg.data = {
                    patrolMessage: msg
                };
                _this.windowService.pushMessageToWindow(wMsg);
            }
        }));
        this.alarmSubCollection.set(windowHandleId, this.hubService.onAlarmMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                var wMsg = new WindowMessage();
                wMsg.windowId = windowHandleId;
                wMsg.data = {
                    alarmMessage: msg
                };
                _this.windowService.pushMessageToWindow(wMsg);
            }
        }));
    };
    ConciseRobotMonitor.prototype.onTearOff = function () {
        var windowHandleId = new Date().getTime().toString();
        var createNewHandle = true;
        //Check if there is already a handle
        if (this.tearOffPlatformMap.has(this.platform.id)) {
            //Set focus on window
            var windowHandles = this.tearOffPlatformMap.get(this.platform.id);
            for (var _i = 0, windowHandles_1 = windowHandles; _i < windowHandles_1.length; _i++) {
                var windowHandle = windowHandles_1[_i];
                if (this.windowService.doesHandleExists(windowHandle)) {
                    createNewHandle = false;
                    this.windowService.setWindowFocus(windowHandle);
                }
            }
        }
        if (createNewHandle) {
            this.tearOffPlatformMap.set(this.platform.id, [windowHandleId]);
            this.windowService.newWindowHandle(windowHandleId, window.open('/RobotMonitorTO/' + this.platform.id + '/' + windowHandleId, '_blank', 'width=952,height=560'));
        }
        this.platformService.robotMonitorPlatformId = null;
        this.setPlatform(null);
    };
    ConciseRobotMonitor.prototype.onClose = function () {
        this.setPlatform(null);
        this.platformService.robotMonitorPlatformId = null;
    };
    ConciseRobotMonitor.prototype.ngOnInit = function () {
        var _this = this;
        this.windowService.onReceiveMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (msg) {
                if (msg.windowId === 'MAPVIEW_CONCISEROBOTMONITOR') {
                    if (msg.data['kill']) {
                        _this.platformSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                        _this.patrolSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                        _this.alarmSubCollection.get(msg.data['windowhandleId']).unsubscribe();
                    }
                    else if (msg.data['new']) {
                        _this.setUpComs(msg.data['windowhandleId']);
                    }
                    else {
                        //Update handle map
                        var mapList = void 0;
                        if (_this.tearOffPlatformMap.has(msg.data.oldPlatformId)) {
                            var windowHandles = _this.tearOffPlatformMap.get(msg.data.oldPlatformId);
                            //Remove old records
                            for (var windowHandleIndex in windowHandles) {
                                if (windowHandles[windowHandleIndex] === msg.data.windowhandleId) {
                                    windowHandles.splice(+windowHandleIndex, 1);
                                }
                            }
                        }
                        //Update new platform information
                        if (_this.tearOffPlatformMap.has(msg.data.newPlatformId)) {
                            var windowhandles = _this.tearOffPlatformMap.get(msg.data.newPlatformId);
                            windowhandles.push(msg.data.windowhandleId);
                            _this.tearOffPlatformMap.set(msg.data.newPlatformId, windowhandles);
                        }
                        else {
                            _this.tearOffPlatformMap.set(msg.data.newPlatformId, [msg.data.windowhandleId]);
                        }
                        _this.ref.detectChanges();
                    }
                }
            }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.platform && platform.id === _this.platform.id) {
                    _this.ref.detectChanges();
                }
            }
        });
    };
    ConciseRobotMonitor.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ConciseRobotMonitor.prototype.onPausePatrol = function () {
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id), Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).id, CommandName.PausePatrol, parameterList));
    };
    ConciseRobotMonitor.prototype.onResumePatrol = function () {
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.platform.id), Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.patrolService.getPatrolInstanceByPlatformId(this.platform.id).id, CommandName.ResumePatrol, parameterList));
    };
    ConciseRobotMonitor.prototype.abortPatrol = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.platform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.platform.PatrolTemplateSubmittedId, this.platform.id);
    };
    ConciseRobotMonitor.prototype.openActionMenu = function (event, atMouse) {
        var _this = this;
        if (atMouse === void 0) { atMouse = false; }
        if (atMouse) {
            event.preventDefault();
            this.platformService.openPlatformActionMenu(this.platform, event, null, null, null, false);
        }
        else {
            this.platformService.openPlatformActionMenu(this.platform, event, this.platformActions, null, null, false);
        }
        this.actionMenuOpen = true;
        this.platformService.platformCommandDialogClosed
            .takeUntil(this.actionMenuUnsub)
            .subscribe({
            next: function () {
                _this.actionMenuOpen = false;
                _this.ref.detectChanges();
                _this.actionMenuUnsub.next();
            }
        });
    };
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], ConciseRobotMonitor.prototype, "mapViewOptions", void 0);
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], ConciseRobotMonitor.prototype, "confirmAbort", void 0);
    __decorate([
        ViewChild('platformActions'),
        __metadata("design:type", ElementRef)
    ], ConciseRobotMonitor.prototype, "platformActions", void 0);
    ConciseRobotMonitor = __decorate([
        Component({
            selector: 'concise-robot-monitor',
            templateUrl: 'concise-robot-monitor.component.html',
            styleUrls: ['concise-robot-monitor.component.css'],
            animations: [
                trigger('slideOut', [
                    state('in', style({
                        display: 'none',
                        right: '-461px'
                    })),
                    state('out', style({
                        right: '*'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                ]),
                trigger('slideUp', [
                    state('in', style({
                        height: 'calc(100vh - 216px)'
                    })),
                    state('out', style({
                        height: 'calc(100vh - 332px)'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                ])
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmMapService,
            PlatformMapService,
            MapService,
            PatrolService,
            PlatformService,
            WindowService,
            UserService,
            ChangeDetectorRef,
            HubService])
    ], ConciseRobotMonitor);
    return ConciseRobotMonitor;
}());
export { ConciseRobotMonitor };
//# sourceMappingURL=concise-robot-monitor.component.js.map