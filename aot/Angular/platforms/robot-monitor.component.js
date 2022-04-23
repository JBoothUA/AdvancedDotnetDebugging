var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, trigger, state, style, transition, animate, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlarmService } from '../alarms/alarm.service';
import { slideDown, fade } from './../shared/animations';
import { PlatformService } from './../platforms/platform.service';
import { PlatformMode } from './../platforms/platform.class';
import { PatrolService } from './../patrols/patrol.service';
import { PatrolInstance } from './../patrols/patrol.class';
import { LocationFilterService } from './../shared/location-filter.service';
import { PatrolStatusValues } from './../patrols/patrol.class';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from './../patrols/action.class';
import { UserService } from './../shared/user.service';
import { DragulaService } from 'ng2-dragula';
import { WindowService, WindowMessage } from './../shared/window.service';
import { SortType } from './../shared/shared-interfaces';
import { Popover } from './../shared/popover.component';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { HubService } from "../shared/hub.service";
export var WindowSize;
(function (WindowSize) {
    WindowSize[WindowSize["sm"] = 0] = "sm";
    WindowSize[WindowSize["med"] = 1] = "med";
    WindowSize[WindowSize["lg"] = 2] = "lg";
    WindowSize[WindowSize["short"] = 3] = "short";
    WindowSize[WindowSize["normal"] = 4] = "normal"; //Height
})(WindowSize || (WindowSize = {}));
var ItemType;
(function (ItemType) {
    ItemType[ItemType["video"] = 0] = "video";
    ItemType[ItemType["map"] = 1] = "map";
})(ItemType || (ItemType = {}));
var Sections;
(function (Sections) {
    Sections[Sections["PatrolHistory"] = 0] = "PatrolHistory";
    Sections[Sections["ActiveAlarms"] = 1] = "ActiveAlarms";
    Sections[Sections["RobotSensors"] = 2] = "RobotSensors";
})(Sections || (Sections = {}));
var Item = /** @class */ (function () {
    function Item(obj) {
        this.type = obj.type;
        this.data = obj.data;
    }
    return Item;
}());
var RobotMonitorDynamic = /** @class */ (function () {
    function RobotMonitorDynamic(route, platformService, patrolService, locationFilterService, ref, alarmService, userService, dragulaService, windowService, hubService) {
        this.route = route;
        this.platformService = platformService;
        this.patrolService = patrolService;
        this.locationFilterService = locationFilterService;
        this.ref = ref;
        this.alarmService = alarmService;
        this.userService = userService;
        this.dragulaService = dragulaService;
        this.windowService = windowService;
        this.hubService = hubService;
        this.PatrolStatusValues = PatrolStatusValues;
        this.WindowSize = WindowSize;
        this.ItemType = ItemType;
        this.sliderIndex = 0;
        this.ngUnsubscribe = new Subject();
        this.historyItems = [];
        this.isLoadingHistory = true;
        this.expandedPatrolOverview = null;
        this.Sections = Sections;
        this.expandedSection = [Sections.PatrolHistory];
        this.alarmCount = 0;
        this.pauseNoficationTimeout = null;
        this.notificationIsPaused = true;
        this.isTearOff = false;
        this.controllerIsShown = false;
        this.patrolHistorySortOrder = SortType.Desc;
        this.PlatformMode = PlatformMode;
        this.commandGroups = [];
        this.expandedCommandGroups = [];
        this.showAllPatrolPoints = false;
        this.isMapLocked = true;
        this.isMapLoadedReset = true;
        if (dragulaService.find('moveElement')) {
            dragulaService.destroy('moveElement');
        }
        dragulaService.setOptions('moveElement', {
            copy: true,
            revertOnSpill: true,
            invalid: function (el, handle) {
                return !$(handle).hasClass('title');
            }
        });
    }
    RobotMonitorDynamic.prototype.killCom = function ($event) {
        var msg = new WindowMessage();
        msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
        msg.data = {
            kill: true,
            windowhandleId: this.windowhandleId
        };
        this.windowService.pushMessageToParent(msg);
    };
    RobotMonitorDynamic.prototype.handleOnPatrolSelected = function () {
        this.isMapLocked = false;
        this.ref.markForCheck();
    };
    RobotMonitorDynamic.prototype.handleOnChooserShown = function () {
        this.isMapLoadedReset = this.isMapLocked;
    };
    RobotMonitorDynamic.prototype.handleOnChooserHide = function () {
        //this.patrolService.toggleSelectedPatrol('', true);
        this.isMapLocked = this.isMapLoadedReset;
        this.isMapLoadedReset = this.isMapLocked;
        this.ref.markForCheck();
    };
    RobotMonitorDynamic.prototype.onResize = function (event) {
        this.widthSize = this.getWidthWindowSize();
        this.heightSize = this.getHightWindowSize();
        this.ref.detectChanges();
    };
    RobotMonitorDynamic.prototype.showPauseNotfication = function () {
        var _this = this;
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        //If patrol is paused and notfication not seen
        if (patrolInstance &&
            patrolInstance.CurrentStatus === PatrolStatusValues.Paused &&
            this.notificationIsPaused) {
            //Hide pause button
            if (!this.pauseNoficationTimeout) {
                this.pauseNoficationTimeout = setTimeout(function () {
                    _this.notificationIsPaused = false;
                    _this.ref.detectChanges();
                }, 3000);
            }
            return true;
        }
        return false;
    };
    RobotMonitorDynamic.prototype.isPaused = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        if (patrolInstance && patrolInstance.CurrentStatus === PatrolStatusValues.Paused)
            return true;
        return false;
    };
    RobotMonitorDynamic.prototype.resumeOnClick = function (event) {
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id).InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.selectedPlatform.id, CommandName.ResumePatrol, parameterList));
    };
    RobotMonitorDynamic.prototype.pauseOnClick = function (event) {
        var parameterList = [];
        parameterList.push(new Parameter({ Name: ParameterName.Username, Value: this.userService.currentUser.name, Type: ParameterType.String }));
        parameterList.push(new Parameter({ Name: ParameterName.PatrolInstanceId, Value: this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id).InstanceId, Type: ParameterType.String }));
        this.platformService.executePlatformCommand(new PlatformCommand(this.selectedPlatform.id, CommandName.PausePatrol, parameterList));
    };
    RobotMonitorDynamic.prototype.handleAbortClick = function () {
        this.confirmAbort.show();
    };
    RobotMonitorDynamic.prototype.getWidthWindowSize = function () {
        if (window.innerWidth <= 1365) {
            return WindowSize.sm;
        }
        else if (window.innerWidth <= 1871) {
            return WindowSize.med;
        }
        else {
            return WindowSize.lg;
        }
    };
    RobotMonitorDynamic.prototype.getHightWindowSize = function () {
        if (window.innerHeight < 600) {
            return WindowSize.short;
        }
        else {
            return WindowSize.normal;
        }
    };
    RobotMonitorDynamic.prototype.getPlatformList = function (platformId) {
        var platformList = [];
        for (var _i = 0, _a = this.platformService.platforms; _i < _a.length; _i++) {
            var platform = _a[_i];
            if (platformId !== platform.id) {
                platformList.push(platform);
            }
        }
        return platformList.sort(function (a, b) {
            if (a.DisplayName.toLowerCase() < b.DisplayName.toLowerCase())
                return -1;
            if (a.DisplayName.toLowerCase() > b.DisplayName.toLowerCase())
                return 1;
            return 0;
        });
    };
    RobotMonitorDynamic.prototype.onPlatformChange = function (platform) {
        if (this.isTearOff) {
            this.sendPlatformChangedMessageToParent(this.selectedPlatform.id, platform.id);
        }
        this.selectedPlatform = platform;
        this.builItemList();
        this.historyItems = [];
        this.getPatrolHistory();
        this.buildCommandListGroups();
    };
    RobotMonitorDynamic.prototype.getPatrolHistory = function () {
        var _this = this;
        var response = this.patrolService.getPatrolHistoryByPlatformId(this.selectedPlatform.id);
        this.isLoadingHistory = true;
        response.then(function (data) {
            _this.historyItems = [];
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                _this.historyItems.push(new PatrolInstance(item));
            }
            _this.isLoadingHistory = false;
            _this.ref.markForCheck();
        });
    };
    RobotMonitorDynamic.prototype.handlePatrolOverviewExpansion = function (instanceId) {
        this.expandedPatrolOverview = instanceId;
    };
    RobotMonitorDynamic.prototype.isProgressBarHidden = function (patrolInstance) {
        var isHidden = true;
        if (patrolInstance) {
            isHidden = false;
        }
        else if (this.selectedPlatform.PatrolTemplateSubmittedId) {
            isHidden = false;
        }
        return isHidden;
    };
    RobotMonitorDynamic.prototype.getFirstItem = function () {
        if (this.itemList.length > 0) {
            return this.itemList[0];
        }
        return null;
    };
    RobotMonitorDynamic.prototype.getLastItem = function () {
        if (this.itemList.length > 1) {
            return this.itemList.slice(-1)[0];
        }
        return null;
    };
    RobotMonitorDynamic.prototype.getSecondaryContent = function (excludeLastItem) {
        if (excludeLastItem === void 0) { excludeLastItem = false; }
        var offset = (excludeLastItem) ? 1 : 0;
        if (this.widthSize !== WindowSize.sm) {
            return this.itemList.slice(1, this.itemList.length - offset);
        }
        else {
            return this.itemList.slice(1 + this.sliderIndex, this.itemList.length - offset);
        }
    };
    RobotMonitorDynamic.prototype.getLocName = function () {
        return this.locationFilterService.getLocation('robotMonitor', this.selectedPlatform.TenantId, this.selectedPlatform.LocationId).Name;
    };
    RobotMonitorDynamic.prototype.slideForward = function () {
        this.sliderIndex = (this.sliderIndex - 1 < 0) ? 0 : this.sliderIndex - 1;
    };
    RobotMonitorDynamic.prototype.slideBack = function () {
        var secondaryLength = this.itemList.slice(1, this.itemList.length).length;
        this.sliderIndex = ((this.sliderIndex + 1) >= (secondaryLength)) ? this.sliderIndex : this.sliderIndex + 1;
    };
    RobotMonitorDynamic.prototype.toggleExpandedSection = function (section) {
        event.stopPropagation;
        if (this.expandedSection.includes(section)) {
            this.expandedSection.splice(this.expandedSection.indexOf(section), 1);
        }
        else {
            this.expandedSection.unshift(section);
            this.expandedSection = this.expandedSection.slice(0, 2);
        }
    };
    RobotMonitorDynamic.prototype.toggleExpandedSectionView = function (section) {
        return this.expandedSection.includes(section);
    };
    RobotMonitorDynamic.prototype.getAlarmList = function () {
        var _this = this;
        var alarms = [];
        alarms = this.alarmService.alarms.filter(function (alarm) {
            return alarm.PlatformId === _this.selectedPlatform.id;
        });
        this.alarmCount = alarms.length;
        return alarms;
    };
    RobotMonitorDynamic.prototype.markForCheck = function (alarms) {
        if (!this.selectedPlatform)
            return;
        if (this.selectedPlatform.id && alarms.PlatformId === this.selectedPlatform.id)
            this.ref.markForCheck();
    };
    RobotMonitorDynamic.prototype.getHighestAlarmPriorityClass = function (alarmList) {
        var priorty = 99;
        for (var _i = 0, alarmList_1 = alarmList; _i < alarmList_1.length; _i++) {
            var alarm = alarmList_1[_i];
            if (alarm.Priority < priorty)
                priorty = alarm.Priority;
        }
        if (priorty !== 99)
            return 'p' + priorty.toString();
        else
            return 'p';
    };
    RobotMonitorDynamic.prototype.makeMainItem = function (sourceIndex) {
        var targetItem = this.itemList[0];
        var sourceItem = this.itemList[sourceIndex];
        this.itemList[sourceIndex] = targetItem;
        this.itemList[0] = sourceItem;
        this.ref.detectChanges();
    };
    RobotMonitorDynamic.prototype.ngOnInit = function () {
        var _this = this;
        this.widthSize = this.getWidthWindowSize();
        this.heightSize = this.getHightWindowSize();
        this.locationFilterService.registerComponent('robotMonitor', false);
        this.routeSub = this.route.params.subscribe(function (params) {
            _this.routePlatformId = params['id'];
            if (params['tearOffMode']) {
                _this.isTearOff = true;
                _this.windowhandleId = params['tearOffMode'];
                _this.ref.markForCheck();
                var msg = new WindowMessage();
                msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
                msg.data = {
                    new: true,
                    windowhandleId: _this.windowhandleId
                };
                _this.windowService.pushMessageToParent(msg);
                _this.hubService.stopPlatforms();
                _this.hubService.stopPatrols();
                _this.hubService.stopAlarms();
                if (!_this.platformService.platforms || !_this.platformService.platforms.length) {
                    _this.platformService.loadPlatforms();
                }
                if (!_this.patrolService.patrolTemplates || !_this.patrolService.patrolTemplates.length) {
                    _this.patrolService.loadPatrolTemplates();
                }
                if (!_this.patrolService.patrolInstances || !_this.patrolService.patrolInstances.length) {
                    _this.patrolService.loadPatrolInstances();
                }
                if (!_this.alarmService.alarms || !_this.alarmService.alarms.length) {
                    _this.alarmService.loadAlarms();
                }
                _this.windowService.onReceiveMessage
                    .takeUntil(_this.ngUnsubscribe)
                    .subscribe({
                    next: function (msg) {
                        if (msg.windowId === _this.windowhandleId) {
                            if (msg.data['platformMessage']) {
                                _this.platformService.handleMessage(msg.data['platformMessage']);
                            }
                            else if (msg.data['patrolMessage']) {
                                _this.patrolService.handleMessage(msg.data['patrolMessage']);
                            }
                            else if (msg.data['alarmMessage']) {
                                _this.alarmService.handleMessage(msg.data['alarmMessage']);
                            }
                        }
                    }
                });
            }
        });
        if (this.platformService.platforms.length > 0) {
            this.processInitPlatformSelection();
            this.patrolService.toggleSelectedPatrol(this.selectedPlatform.PatrolTemplateSubmittedId, true);
            this.ref.markForCheck();
        }
        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                _this.processInitPlatformSelection();
                _this.patrolService.toggleSelectedPatrol(_this.selectedPlatform.PatrolTemplateSubmittedId, true);
                _this.ref.markForCheck();
            }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.ref.markForCheck();
            }
        });
        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.ref.markForCheck();
            }
        });
        this.platformService.onConfirmAbortPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.confirmAbort.show();
            }
        });
        this.patrolService.onNewInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) {
                if (patrol.PlatformId === _this.selectedPlatform.id) {
                    if (patrol.UserName === _this.userService.currentUser.name) {
                        _this.expandedPatrolOverview = patrol.id;
                    }
                    _this.ref.markForCheck();
                }
            }
        });
        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) {
                if (patrol.PlatformSubmittedId === _this.selectedPlatform.id) {
                    _this.patrolService.toggleSelectedPatrol(patrol.id, true);
                }
            }
        });
        this.alarmService.clearingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarms) { return _this.markForCheck(alarms); }
        });
        this.alarmService.dismissingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarms) { return _this.markForCheck(alarms); }
        });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.markForCheck(alarm); }
        });
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.markForCheck(alarm); }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.markForCheck(alarm); }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance && _this.selectedPlatform) {
                    if (_this.selectedPlatform.id === patrolInstance.PlatformId) {
                        _this.historyItems.unshift(patrolInstance);
                        _this.historyItems = _this.historyItems.slice(0, 5);
                        _this.ref.markForCheck();
                    }
                }
            }
        });
        this.dragulaService.drop
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (args) {
                _this.dragulaService.find('moveElement').drake.cancel(true);
                var _a = args.slice(1), el = _a[0], target = _a[1], source = _a[2], sibling = _a[3];
                var targetIndex = target.getAttribute('itemindex');
                var sorceIndex = source.getAttribute('itemindex');
                var targetItem = _this.itemList[targetIndex];
                var sourceItem = _this.itemList[sorceIndex];
                _this.itemList[sorceIndex] = targetItem;
                _this.itemList[targetIndex] = sourceItem;
                _this.ref.detectChanges();
            }
        });
    };
    RobotMonitorDynamic.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    RobotMonitorDynamic.prototype.getPatrolTemplateIdForAbort = function () {
        if (this.selectedPlatform.PatrolTemplateSubmittedId) {
            return this.selectedPlatform.PatrolTemplateSubmittedId;
        }
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        if (patrolInstance) {
            return patrolInstance.TemplateId;
        }
        return '';
    };
    RobotMonitorDynamic.prototype.mapUpdateEvent = function (platform) {
        alert('FIRE');
    };
    RobotMonitorDynamic.prototype.builItemList = function () {
        this.itemList = [];
        for (var _i = 0, _a = this.selectedPlatform.Cameras; _i < _a.length; _i++) {
            var camera = _a[_i];
            this.itemList.push(new Item({ type: ItemType.video, data: camera }));
        }
        this.itemList.push(new Item({ type: ItemType.map, data: null }));
    };
    RobotMonitorDynamic.prototype.processInitPlatformSelection = function () {
        if (this.routePlatformId) {
            this.selectedPlatform = this.platformService.getPlatform(this.routePlatformId);
            this.builItemList();
            this.getPatrolHistory();
            this.ref.markForCheck();
        }
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.selectedPlatform.id);
        if (patrolInstance) {
            this.expandedPatrolOverview = patrolInstance.InstanceId;
        }
        this.buildCommandListGroups();
    };
    RobotMonitorDynamic.prototype.sendPlatformChangedMessageToParent = function (oldPlatformId, newPlatformId) {
        var msg = new WindowMessage();
        msg.windowId = "MAPVIEW_CONCISEROBOTMONITOR";
        msg.data = {
            oldPlatformId: oldPlatformId,
            newPlatformId: newPlatformId,
            windowhandleId: this.windowhandleId
        };
        this.windowService.pushMessageToParent(msg);
    };
    RobotMonitorDynamic.prototype.buildCommandListGroups = function () {
        this.commandGroups = [];
        for (var _i = 0, _a = this.selectedPlatform.Commands; _i < _a.length; _i++) {
            var command = _a[_i];
            switch (command.CommandName) {
                case CommandName.Abort:
                case CommandName.CancelGoal:
                case CommandName.EStop:
                case CommandName.EStopReset:
                case CommandName.GoToLocation:
                case CommandName.ResetCameras:
                case CommandName.PausePatrol:
                case CommandName.ResumePatrol:
                case CommandName.TiltCameraAbsolute:
                    continue;
            }
            if (!this.commandGroups.includes(command.Category)) {
                this.commandGroups.push(command.Category);
            }
        }
        this.expandedCommandGroups = this.commandGroups;
    };
    RobotMonitorDynamic.prototype.showPointOptions = function (event) {
        try {
            event.stopPropagation();
        }
        catch (e) {
            console.error(e);
        }
        this.pointOptions.show(this.popoverTarget, 1, -1);
    };
    RobotMonitorDynamic.prototype.toggleHistorySort = function () {
        try {
            event.stopPropagation();
        }
        catch (e) {
            console.error(e);
        }
        if (this.patrolHistorySortOrder === SortType.Desc)
            this.patrolHistorySortOrder = SortType.Asc;
        else
            this.patrolHistorySortOrder = SortType.Desc;
        this.ref.markForCheck();
    };
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], RobotMonitorDynamic.prototype, "confirmAbort", void 0);
    __decorate([
        ViewChild('popover'),
        __metadata("design:type", Popover)
    ], RobotMonitorDynamic.prototype, "pointOptions", void 0);
    __decorate([
        ViewChild('btnPointOptions'),
        __metadata("design:type", ElementRef)
    ], RobotMonitorDynamic.prototype, "popoverTarget", void 0);
    __decorate([
        HostListener('window:beforeunload', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], RobotMonitorDynamic.prototype, "killCom", null);
    RobotMonitorDynamic = __decorate([
        Component({
            selector: 'robot-monitor-dynamic',
            templateUrl: 'robot-monitor.component.html',
            styleUrls: ['robot-monitor.component.css'],
            animations: [slideDown, fade,
                trigger('slideOut', [
                    state('out', style({
                        right: '0'
                    })),
                    state('in', style({
                        display: 'none',
                        right: '*'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                ])
            ],
            providers: [PlatformMapService],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ActivatedRoute,
            PlatformService,
            PatrolService,
            LocationFilterService,
            ChangeDetectorRef,
            AlarmService,
            UserService,
            DragulaService,
            WindowService,
            HubService])
    ], RobotMonitorDynamic);
    return RobotMonitorDynamic;
}());
export { RobotMonitorDynamic };
//# sourceMappingURL=robot-monitor.component.js.map