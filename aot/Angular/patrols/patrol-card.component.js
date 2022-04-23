var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { PatrolTemplate, PatrolInstance } from './patrol.class';
import { MapViewOptions } from '../shared/map-view-options.class';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { PatrolService } from './patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { slideDown } from './../shared/animations';
import { PointStatusValues } from './point.class';
import { ActionStatusValues } from './action.class';
import { PatrolPlan } from './patrol-plan.component';
import { SortType } from './../shared/shared-interfaces';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { Popover } from './../shared/popover.component';
import { UserService } from './../shared/user.service';
var Subsections;
(function (Subsections) {
    Subsections[Subsections["History"] = 0] = "History";
    Subsections[Subsections["Points"] = 1] = "Points";
})(Subsections || (Subsections = {}));
var PatrolCard = /** @class */ (function () {
    function PatrolCard(patrolService, ref, platformService, userService) {
        this.patrolService = patrolService;
        this.ref = ref;
        this.platformService = platformService;
        this.userService = userService;
        this.expandedHistoryItem = -1;
        this.Subsections = Subsections;
        this.expandedSubSection = new Map();
        this.isLoadingHistory = false;
        this.ngUnsubscribe = new Subject();
        this.currentCheckpointColor = "#249C49";
        this.isCheckpointDone = false;
        this.updateToggle = false;
        this.expandedPatrolOverview = null;
        this.patrolPlanSortOrder = SortType.Asc;
        this.operator = [];
        this.showAllPatrolPoints = false;
        this.patrolHistorySortOrder = SortType.Desc;
    }
    PatrolCard.prototype.editPatrol = function (patrolId) {
        this.patrolService.startEditPatrol(patrolId);
        this.platformService.showRobotMonitor(null);
    };
    PatrolCard.prototype.deletePatrolConfirm = function () {
        this.confirmDelete.show();
    };
    PatrolCard.prototype.getActionCompleteness = function () {
        var _this = this;
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus' ||
            (this.patrolTemplate.IsPatrolSubmitted && !this.patrolInstance))
            return 0.0;
        this.currentCheckpointColor = "#249C49";
        for (var _i = 0, _a = this.patrolInstance.Points; _i < _a.length; _i++) {
            var point = _a[_i];
            //Check if the next point has not been started
            if (this.patrolInstance.Points[point.Ordinal] &&
                !(this.patrolInstance.Points[point.Ordinal].CurrentStatus === PointStatusValues.Unknown ||
                    this.patrolInstance.Points[point.Ordinal].CurrentStatus === PointStatusValues.InTransit)) {
                continue;
            }
            var currentStatusValue = this.patrolService.getPointStatus(point, this.patrolInstance.Points);
            if (currentStatusValue === PointStatusValues.Reached || currentStatusValue === PointStatusValues.ActionsPerformed) {
                //Look at actions
                if (point.Actions.length > 0) {
                    var completedActions = 0;
                    for (var _b = 0, _c = point.Actions; _b < _c.length; _b++) {
                        var action = _c[_b];
                        if (action.CurrentStatus !== ActionStatusValues.Unknown &&
                            action.CurrentStatus !== ActionStatusValues.Started) {
                            completedActions += 1;
                        }
                        if (action.CurrentStatus === ActionStatusValues.Failed ||
                            action.CurrentStatus === ActionStatusValues.Unsupported) {
                            this.currentCheckpointColor = "#E9AB08";
                        }
                    }
                    var value = completedActions / point.Actions.length;
                    value = value === 0.0 ? 0.0000001 : value;
                    //If the current checkpoint is complete clear it
                    if (value === 1) {
                        if (!this.isCheckpointDone) {
                            this.checkPointTimer = setTimeout(function () {
                                _this.isCheckpointDone = true;
                                _this.ref.markForCheck();
                            }, 1000);
                        }
                    }
                    else {
                        this.isCheckpointDone = false;
                    }
                    return value;
                }
            }
        }
        this.isCheckpointDone = true;
        return 0.0;
    };
    PatrolCard.prototype.getPlatform = function () {
        if (this.platform) {
            return this.platform;
        }
        else {
            if (this.patrolInstance) {
                return this.platformService.getPlatform(this.patrolInstance.PlatformId);
            }
            else {
                return this.platformService.getPlatform(this.patrolTemplate.PlatformSubmittedId);
            }
        }
    };
    PatrolCard.prototype.getPatrolAlarmsCount = function () {
        if (!this.patrolInstance)
            return '0';
        //Build list of all alarm ids
        var alarmIdList = [];
        if (this.patrolInstance.AlarmIds) {
            alarmIdList = alarmIdList.concat(this.patrolInstance.AlarmIds);
        }
        //Get point alarm Ids
        for (var _i = 0, _a = this.patrolInstance.Points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (point.AlarmIds) {
                alarmIdList = alarmIdList.concat(point.AlarmIds);
            }
            //Get action alarm Ids
            for (var _b = 0, _c = point.Actions; _b < _c.length; _b++) {
                var action = _c[_b];
                if (action.AlarmIds) {
                    alarmIdList = alarmIdList.concat(action.AlarmIds);
                }
            }
        }
        //Remove dups
        var tempList = [];
        for (var _d = 0, alarmIdList_1 = alarmIdList; _d < alarmIdList_1.length; _d++) {
            var alarmId = alarmIdList_1[_d];
            if (tempList.indexOf(alarmId) === -1) {
                tempList.push(alarmId);
            }
        }
        alarmIdList = tempList;
        if (alarmIdList.length > 9)
            return '9+';
        return alarmIdList.length.toString();
    };
    PatrolCard.prototype.expandedPatrolHistoryViewState = function (historySection) {
        if (historySection === this.expandedHistoryItem)
            return 'out';
        return 'in';
    };
    PatrolCard.prototype.toggleExpandedPatrolHistoryView = function (historySection) {
        event.stopPropagation();
        if (this.expandedHistoryItem === historySection)
            this.expandedHistoryItem = null;
        else
            this.expandedHistoryItem = historySection;
    };
    PatrolCard.prototype.expandedSubSectionViewState = function (subSection) {
        if (!this.expandedSubSection[subSection])
            this.expandedSubSection[subSection] = 'out';
        return this.expandedSubSection[subSection];
    };
    PatrolCard.prototype.goToPlatform = function (platform) {
        this.platformService.showRobotMonitor(platform);
    };
    PatrolCard.prototype.toggleExpandedSubSectionView = function (subSection) {
        event.stopPropagation();
        if (this.expandedSubSection[subSection] === 'out') {
            this.expandedSubSection[subSection] = 'in';
        }
        else {
            this.expandedSubSection[subSection] = 'out';
        }
    };
    PatrolCard.prototype.getPatrolcompletenessText = function () {
        return (Math.round(this.getPatrolCompleteness() * 100).toString());
    };
    PatrolCard.prototype.getPatrolCompleteness = function () {
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus')
            return 0.0;
        return this.patrolService.getPatrolCompleteness(this.patrolInstance);
    };
    PatrolCard.prototype.handlePatrolOverviewExpansion = function (instanceId) {
        this.expandedPatrolOverview = instanceId;
        this.ref.detectChanges();
    };
    PatrolCard.prototype.getPatrolDate = function (stringDate) {
        return moment.utc(stringDate).local().format('MM/DD/YYYY');
    };
    PatrolCard.prototype.expandExpandedView = function (patrolTemplate) {
        var _this = this;
        var response = this.patrolService.getPatrolHistory(this.patrolTemplate.TemplateId);
        this.isLoadingHistory = true;
        response.then(function (data) {
            _this.patrolService.patrolHistoryMap.set(_this.patrolTemplate.id, []);
            for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                var item = data_1[_i];
                var historyArray = _this.patrolService.patrolHistoryMap.get(_this.patrolTemplate.id);
                historyArray.push(new PatrolInstance(item));
                _this.patrolService.patrolHistoryMap.set(_this.patrolTemplate.id, historyArray);
            }
            _this.isLoadingHistory = false;
            _this.ref.markForCheck();
        });
        this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, true);
    };
    PatrolCard.prototype.getPatrol = function () {
        return (this.patrolInstance) ? this.patrolInstance : this.patrolTemplate;
    };
    PatrolCard.prototype.ngOnInit = function () {
        var _this = this;
        this.expandedSubSection[Subsections.Points] = 'in';
        this.operator = this.getOperatorInitials();
        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolTemplate) {
                if (patrolTemplate.id === _this.patrolTemplate.id) {
                    _this.updateToggle = !_this.updateToggle;
                    _this.ref.markForCheck();
                    _this.patrolPlan.refresh();
                }
            }
        });
        this.patrolService.onNewInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.TemplateId === _this.getPatrol().id) {
                    _this.updateToggle = !_this.updateToggle;
                    //Auto open if current user kicked off patrol
                    if (patrolInstance.UserName === _this.userService.currentUser.name) {
                        _this.handlePatrolOverviewExpansion(null);
                    }
                }
            }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if (patrolInstance.TemplateId === _this.patrolTemplate.id) {
                    var patrolHistory = _this.patrolService.patrolHistoryMap.get(_this.patrolTemplate.id);
                    if (patrolHistory) {
                        patrolHistory.unshift(patrolInstance);
                        patrolHistory = patrolHistory.slice(0, 5);
                        _this.patrolService.patrolHistoryMap.set(_this.patrolTemplate.id, patrolHistory);
                    }
                    _this.ref.markForCheck();
                }
            }
        });
    };
    PatrolCard.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolCard.prototype.getFormattedTime = function (time) {
        return moment.utc(time).local().format('MM/DD/YYYY hh:mm:ssa');
    };
    PatrolCard.prototype.getOperatorInitials = function () {
        if (!this.patrolTemplate.UserName) {
            return ['?'];
        }
        var initials = this.patrolTemplate.UserName.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
        return initials;
    };
    PatrolCard.prototype.toggleSort = function () {
        try {
            event.stopPropagation();
        }
        catch (e) {
            console.error(e);
        }
        if (this.patrolPlanSortOrder === SortType.Desc)
            this.patrolPlanSortOrder = SortType.Asc;
        else
            this.patrolPlanSortOrder = SortType.Desc;
        this.ref.markForCheck();
    };
    PatrolCard.prototype.toggleHistorySort = function () {
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
    PatrolCard.prototype.handleOnExpandedViewHidden = function (event) {
        this.pointOptions.hide();
    };
    PatrolCard.prototype.showRobotMonitor = function (platform) {
        event.stopPropagation();
        this.platformService.showRobotMonitor(platform);
    };
    PatrolCard.prototype.stopPropagation = function () {
        event.stopPropagation();
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolCard.prototype, "patrolTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], PatrolCard.prototype, "patrolInstance", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolCard.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolCard.prototype, "expanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PatrolCard.prototype, "mapViewOptions", void 0);
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], PatrolCard.prototype, "confirmDelete", void 0);
    __decorate([
        ViewChild(PatrolPlan),
        __metadata("design:type", PatrolPlan)
    ], PatrolCard.prototype, "patrolPlan", void 0);
    __decorate([
        ViewChild('popover'),
        __metadata("design:type", Popover)
    ], PatrolCard.prototype, "pointOptions", void 0);
    __decorate([
        ViewChild('btnPointOptions'),
        __metadata("design:type", ElementRef)
    ], PatrolCard.prototype, "popoverTarget", void 0);
    PatrolCard = __decorate([
        Component({
            selector: 'patrol-card',
            templateUrl: 'patrol-card.component.html',
            styleUrls: ['patrol-card.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            ChangeDetectorRef,
            PlatformService,
            UserService])
    ], PatrolCard);
    return PatrolCard;
}());
export { PatrolCard };
//# sourceMappingURL=patrol-card.component.js.map