var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { PatrolService } from '../patrols/patrol.service';
import { PlatformService } from '../platforms/platform.service';
import { PatrolInstance, PatrolStatusValues } from '../patrols/patrol.class';
import { Platform } from '../platforms/platform.class';
import { PointStatusValues } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';
import { PatrolPlan } from './patrol-plan.component';
import { slideDown } from '../shared/animations';
import { Alarm } from '../alarms/alarm.class';
import { TimerService } from '../shared/timer.service';
import { AlarmService } from './../alarms/alarm.service';
import { MediaService } from './../shared/media/media.service';
import { SortType } from './../shared/shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { Popover } from "../shared/popover.component";
export var NameOption;
(function (NameOption) {
    NameOption[NameOption["noDisplay"] = 0] = "noDisplay";
    NameOption[NameOption["showRobotName"] = 1] = "showRobotName";
    NameOption[NameOption["showPatrolName"] = 2] = "showPatrolName";
})(NameOption || (NameOption = {}));
var PatrolOverview = /** @class */ (function () {
    function PatrolOverview(patrolService, platformService, ref, alarmService, timerService, mediaService) {
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.ref = ref;
        this.alarmService = alarmService;
        this.timerService = timerService;
        this.mediaService = mediaService;
        this.nameOption = NameOption.noDisplay;
        this.isSmallFormat = true;
        this.expandedState = false;
        this.showPathPoints = false;
        this.showSortButton = true;
        this.showPointOptionsButton = false;
        this.sortOrder = SortType.Desc;
        this.onPlatformClick = new EventEmitter();
        this.onExpanded = new EventEmitter();
        this.patrolAlarms = [];
        this.clearedAlarms = [];
        this.PointStatusValues = PointStatusValues;
        this.ActionStatusValues = ActionStatusValues;
        this.PatrolStatusValues = PatrolStatusValues;
        this.currentCheckpointColor = '#249C49';
        this.ngUnsubscribe = new Subject();
        this.alarmIdList = [];
        this.loadedAlarms = new Map();
        this.isLoadingAlarmHistory = false;
        this.NameOption = NameOption;
        this.showAllPatrolPoints = false;
    }
    PatrolOverview.prototype.toggleSort = function () {
        try {
            event.stopPropagation();
        }
        catch (e) {
            console.error(e);
        }
        if (this.sortOrder === SortType.Desc)
            this.sortOrder = SortType.Asc;
        else
            this.sortOrder = SortType.Desc;
        this.ref.markForCheck();
    };
    PatrolOverview.prototype.getFormattedPatrolStartTime = function () {
        return moment.utc(this.patrolInstance.StartedTime).local().format('hh:mm:ssa');
    };
    PatrolOverview.prototype.getFormattedPatrolEndTime = function () {
        return moment.utc(this.patrolInstance.EndedTime).local().format('hh:mm:ssa');
    };
    PatrolOverview.prototype.getTimeSince = function (dateTime, extraText) {
        if (extraText === void 0) { extraText = ''; }
        if (!this.patrolInstance) {
            return '';
        }
        var tempDate;
        if (isNaN(dateTime)) {
            tempDate = moment(dateTime).toDate();
        }
        else {
            tempDate = moment.utc(parseInt(dateTime)).local().toDate();
        }
        var result = moment.duration(moment().diff(tempDate)).humanize();
        if (result.includes('second')) {
            return 'now';
        }
        if (result.includes('month') || result.includes('year')) {
            return moment(tempDate).format('MM/DD/YY hh:mma');
        }
        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result + ' ' + extraText;
    };
    PatrolOverview.prototype.platformNameClicked = function (event) {
        if (!this.platform) {
            return;
        }
        event.stopPropagation();
        this.onPlatformClick.next(this.platform);
    };
    PatrolOverview.prototype.ngOnInit = function () {
        var _this = this;
        this.patrolService.onUpdateHistoryItem
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.id === _this.patrolInstance.id) {
                    _this.patrolInstance = patrolInstance;
                    _this.ref.markForCheck();
                }
            }
        });
        this.timerService.onMinuteTick
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                if (_this.expandedState) {
                    _this.ref.markForCheck();
                }
            }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.platform && platform) {
                    if (_this.platform.id === platform.id) {
                        _this.ref.detectChanges();
                    }
                }
            }
        });
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) {
                if (_this.loadedAlarms.has(alarm.Id)) {
                    _this.ref.markForCheck();
                }
            }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) {
                if (_this.loadedAlarms.has(alarm.Id)) {
                    setTimeout(function () {
                        _this.alarmIdList = [];
                        _this.loadedAlarms = new Map();
                        _this.clearedAlarms = [];
                        _this.ref.markForCheck();
                    }, 1000);
                }
            }
        });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) {
                _this.ref.detectChanges();
            }
        });
    };
    PatrolOverview.prototype.getPatrolDate = function (stringDate) {
        return moment.utc(stringDate).local().format('MM/DD/YYYY');
    };
    PatrolOverview.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolOverview.prototype.isRunningPatrol = function () {
        return !(this.patrolInstance.CurrentStatus === PatrolStatusValues.Completed ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Failed ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.Aborted ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.FailedCheckpoints ||
            this.patrolInstance.CurrentStatus === PatrolStatusValues.PointsNotReached);
    };
    PatrolOverview.prototype.ngAfterViewInit = function () {
        //Force child component to trigger to get point count
        this.ref.detectChanges();
    };
    PatrolOverview.prototype.handleExpandClick = function () {
        this.expandedState = !this.expandedState;
        if (this.expandedState) {
            this.onExpanded.next(this.patrolInstance.InstanceId);
        }
        else {
            this.onExpanded.next('none');
        }
    };
    PatrolOverview.prototype.getOperatorInitials = function () {
        var initials = this.patrolInstance.UserName.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
        return initials;
    };
    PatrolOverview.prototype.getPatrolAlarmList = function () {
        var _this = this;
        this.alarmIdList = [];
        if (this.patrolInstance.AlarmIds) {
            this.alarmIdList = this.alarmIdList.concat(this.patrolInstance.AlarmIds);
        }
        //Get point alarm Ids
        for (var _i = 0, _a = this.patrolInstance.Points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (point.AlarmIds) {
                this.alarmIdList = this.alarmIdList.concat(point.AlarmIds);
            }
            //Get action alarm Ids
            for (var _b = 0, _c = point.Actions; _b < _c.length; _b++) {
                var action = _c[_b];
                if (action.AlarmIds) {
                    this.alarmIdList = this.alarmIdList.concat(action.AlarmIds);
                }
            }
        }
        this.patrolAlarms = [];
        //Remove dups
        var tempList = [];
        for (var _d = 0, _e = this.alarmIdList; _d < _e.length; _d++) {
            var alarmId = _e[_d];
            if (tempList.indexOf(alarmId) === -1) {
                tempList.push(alarmId);
            }
        }
        this.alarmIdList = tempList;
        //Get alarm object for active alarms
        for (var _f = 0, _g = this.alarmIdList; _f < _g.length; _f++) {
            var alarmId = _g[_f];
            var alarm = this.alarmService.getAlarmById(alarmId);
            if (alarm) {
                this.patrolAlarms.push(alarm);
                this.alarmIdList.splice(this.alarmIdList.indexOf(alarmId), 1);
            }
        }
        //If there are still alarmIDs go look to see if I have gotten them from history before
        for (var _h = 0, _j = this.clearedAlarms; _h < _j.length; _h++) {
            var alarm = _j[_h];
            this.alarmIdList.splice(this.alarmIdList.indexOf(alarm.Id), 1);
        }
        this.patrolAlarms = this.patrolAlarms.concat(this.clearedAlarms);
        //Nothing left to do but to get them from the db
        if (this.alarmIdList.length > 0 && !this.isLoadingAlarmHistory) {
            this.isLoadingAlarmHistory = true;
            this.alarmService.loadAlarmsByIds(this.alarmIdList).then(function (alarms) {
                if (alarms && alarms.length > 0) {
                    for (var _i = 0, alarms_1 = alarms; _i < alarms_1.length; _i++) {
                        var clearedAlarm = alarms_1[_i];
                        var alarm = new Alarm(clearedAlarm);
                        _this.clearedAlarms.push(alarm);
                        _this.patrolAlarms.push(alarm);
                    }
                    _this.ref.markForCheck();
                    _this.isLoadingAlarmHistory = false;
                }
            });
        }
        //Clean up data
        var pushAlarmList = [];
        this.loadedAlarms = new Map();
        for (var _k = 0, _l = this.patrolAlarms; _k < _l.length; _k++) {
            var alarm = _l[_k];
            if (!this.loadedAlarms.has(alarm.Id)) {
                this.loadedAlarms.set(alarm.Id, true);
                pushAlarmList.push(alarm);
            }
        }
        this.patrolAlarms = pushAlarmList;
        return this.patrolAlarms;
    };
    PatrolOverview.prototype.changePointOptions = function (event) {
        event.stopPropagation();
        this.pointOptions.show(this.popoverTarget, 1, -1);
    };
    PatrolOverview.prototype.onPointOptionsChange = function () {
        this.pointOptions.hide();
        this.ref.detectChanges();
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], PatrolOverview.prototype, "patrolInstance", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PatrolOverview.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolOverview.prototype, "nameOption", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolOverview.prototype, "isSmallFormat", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolOverview.prototype, "expandedState", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolOverview.prototype, "showPathPoints", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolOverview.prototype, "showSortButton", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolOverview.prototype, "showPointOptionsButton", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolOverview.prototype, "sortOrder", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolOverview.prototype, "onPlatformClick", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolOverview.prototype, "onExpanded", void 0);
    __decorate([
        ViewChild(PatrolPlan),
        __metadata("design:type", PatrolPlan)
    ], PatrolOverview.prototype, "patrolInstancePlan", void 0);
    __decorate([
        ViewChild('popover'),
        __metadata("design:type", Popover)
    ], PatrolOverview.prototype, "pointOptions", void 0);
    __decorate([
        ViewChild('btnPointOptions'),
        __metadata("design:type", ElementRef)
    ], PatrolOverview.prototype, "popoverTarget", void 0);
    PatrolOverview = __decorate([
        Component({
            selector: 'patrol-overview',
            templateUrl: 'patrol-overview.component.html',
            styleUrls: ['patrol-overview.component.css'],
            animations: [slideDown]
        }),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            ChangeDetectorRef,
            AlarmService,
            TimerService,
            MediaService])
    ], PatrolOverview);
    return PatrolOverview;
}());
export { PatrolOverview };
//# sourceMappingURL=patrol-overview.component.js.map