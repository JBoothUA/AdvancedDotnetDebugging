var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, trigger, state, transition, style, animate } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { FilterTimeframe } from './dashboard';
var FilterOptions = /** @class */ (function () {
    function FilterOptions() {
    }
    return FilterOptions;
}());
export { FilterOptions };
var Section;
(function (Section) {
    Section[Section["Location"] = 0] = "Location";
    Section[Section["Alarm"] = 1] = "Alarm";
    Section[Section["Patrol"] = 2] = "Patrol";
    Section[Section["Robot"] = 3] = "Robot";
    Section[Section["CustomDate"] = 4] = "CustomDate";
    Section[Section["More"] = 5] = "More";
})(Section || (Section = {}));
var DashboardFilter = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    function DashboardFilter(dashboardService, dashboardAlarmService, dashboardPatrolService, dashboardPlatformService) {
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.dashboardPatrolService = dashboardPatrolService;
        this.dashboardPlatformService = dashboardPlatformService;
        //Class Variables
        this.show = false;
        this.showPanel = true;
        this.filterTimeframe = FilterTimeframe;
        this.tenantLocationHeader = '';
        this.tenantLocationFilters = [];
        this.Section = Section;
        this.expandedSection = new Map();
        this.customDateReadonlyInput = true;
        //alarm filter criteria
        this.alarmFilterPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        this.alarmFilterOperatorList = {};
        this.alarmFilterDescriptionList = {};
        this.alarmFilterStatusList = {};
        this.alarmFilterRobotList = {};
        this.alarmFilterCriteriaText = null;
        this.alarmFilterCriteriaTotalCount = 0;
        this.alarmFilterCriteriaPriorityCount = 0;
        this.alarmFilterCriteriaOperatorCount = 0;
        this.alarmFilterCriteriaDescCount = 0;
        this.alarmFilterCriteriaStateCount = 0;
        this.alarmFilterCriteriaRobotCount = 0;
        //patrol filter criteria
        this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        this.patrolFilterOperatorList = { All: 'All' };
        this.patrolFilterPatrolDisplayNameList = { All: 'All' };
        this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
        this.patrolFilterRobotList = { All: 'All' };
        this.patrolFilterCriteriaText = null;
        this.patrolFilterCriteriaTotalCount = 0;
        this.patrolFilterCriteriaAlarmPriorityCount = 0;
        this.patrolFilterCriteriaOperatorCount = 0;
        this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        this.patrolFilterCriteriaStatusCount = 0;
        this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterPatrolDisplayNameDefault = '';
        this.ngUnsubscribe = new Subject();
        //alarm data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.alarmDataUpdated(); }
        });
        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.alarmDataUpdated(); }
        });
        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.alarmDataUpdated(); }
        });
        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.alarmDataUpdated(); }
        });
        //patrol instance data
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdated(); }
        });
        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdated(); }
        });
        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleCompletededPatrolInstance(); }
        });
        //patrol template data
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdated(); }
        });
        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdated(); }
        });
        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdated(); }
        });
        //platform data
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handlePlatformsLoaded(); }
        });
        //timeframe change
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.alarmDataUpdatedForTimeframeChange(); }
        });
        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.patrolDataUpdatedForTimeframeChange(); }
        });
        //filter criteria
        this.dashboardService.onShowAlarmFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.showAlarmFilterCriteria(); }
        });
        this.dashboardService.onShowPatrolFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.showPatrolFilterCriteria(); }
        });
        this.dashboardService.onRemoveSelectedAlarmFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (event) { return _this.removeSelectedAlarmFilters(event); }
        });
        this.dashboardService.onRemoveSelectedPatrolFilterCriteria
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (event) { return _this.removeSelectedPatrolFilters(event); }
        });
        this.options = new FilterOptions();
        //this.alarmDataUpdated(); //TSR* 
        //TODO - load patrol data criteria
    }
    DashboardFilter.prototype.ngOnInit = function () {
        if (this.getSelectedTimeframe() === FilterTimeframe.Custom) {
            this.expandedSection[Section.CustomDate] = 'out';
        }
        //default to last 8 hours
        this.customStartDate = this.dashboardService.getTimeFrameStartTime(8, 'hours');
        this.customEndDate = this.dashboardService.getTimeFrameEndTime();
        this.startDateChanged();
        this.endDateChanged();
        //TSR*
        if (this.dashboardService.alarmDataLoaded)
            this.alarmDataUpdated();
    };
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.expandedSectionViewState = function (section) {
        if (!this.expandedSection[section])
            this.expandedSection[section] = 'in';
        return this.expandedSection[section];
    };
    DashboardFilter.prototype.toggleExpandedSectionView = function (section) {
        event.stopPropagation();
        if (this.expandedSection[section] === 'out')
            this.expandedSection[section] = 'in';
        else
            this.expandedSection[section] = 'out';
    };
    DashboardFilter.prototype.toggleFilterPanelDone = function (event) {
        this.dashboardService.onLeftPanelToggled.next(event);
    };
    DashboardFilter.prototype.handlePlatformsLoaded = function () {
        this.loadAlarmRobotData();
        this.loadPatrolRobotData();
    };
    DashboardFilter.prototype.handleCompletededPatrolInstance = function () {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolCompleteUpdate();
        }
    };
    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.getSelectedTimeframe = function () {
        return this.dashboardService.getSelectedTimeframe();
    };
    DashboardFilter.prototype.setSelectedTimeframe = function (timeframe) {
        if (timeframe != FilterTimeframe.Custom)
            this.dashboardService.setSelectedTimeframe(timeframe);
        if ((timeframe != FilterTimeframe.Custom) && (this.expandedSection[Section.CustomDate] === 'out')) {
            this.expandedSection[Section.CustomDate] = 'in';
        }
    };
    ///////////////////////////////////////////
    //Custom Timeframe Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.startDateChanged = function () {
        var start = this.customStartDate;
        var end = this.customEndDate;
        if (start) {
            start = new Date(start);
            start.setDate(start.getDate());
            this.customEndMinDate = start;
        }
        else if (end) {
            this.customStartMaxDate = new Date(end);
        }
        else {
            end = new Date();
            this.customStartMaxDate = end;
            this.customEndMinDate = end;
        }
        this.dashboardService.setCustomStartDateTime(this.customStartDate);
    };
    DashboardFilter.prototype.endDateChanged = function () {
        var end = this.customEndDate;
        var start = this.customStartDate;
        if (end) {
            end = new Date(end);
            end.setDate(end.getDate());
            this.customStartMaxDate = end;
        }
        else if (start) {
            this.customEndMinDate = new Date(start);
        }
        else {
            end = new Date();
            this.customStartMaxDate = end;
            this.customEndMinDate = end;
        }
        this.dashboardService.setCustomEndDateTime(this.customEndDate);
    };
    DashboardFilter.prototype.clearDate = function (field) {
        if (field) {
            if (field === 'start') {
                this.customStartDate = null;
                this.customStartMaxDate = this.customEndDate;
                this.customEndMinDate = new Date(1900, 0, 1);
                this.dashboardService.setCustomStartDateTime(this.customStartDate);
            }
            if (field === 'end') {
                this.customEndDate = null;
                this.customEndMinDate = this.customStartDate;
                this.customStartMaxDate = new Date(3000, 0, 1);
                this.dashboardService.setCustomEndDateTime(this.customEndDate);
            }
        }
    };
    DashboardFilter.prototype.applyCustomDate = function () {
        if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime))
            this.dashboardService.setSelectedTimeframe(FilterTimeframe.Custom);
    };
    DashboardFilter.prototype.cancelCustomDate = function () {
        this.toggleExpandedSectionView(Section.CustomDate);
    };
    ///////////////////////////////////////////
    //More Filter Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.removeAllFilters = function (event) {
        this.removeSelectedAlarmFilters(event);
        this.removeSelectedPatrolFilters(event);
    };
    ///////////////////////////////////////////
    //Alarm Filter Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.alarmFilterSelected = function (alarmFilterType, event) {
        var num = 0;
        var str = '';
        var changed = false;
        var filter = '';
        var value = '';
        switch (alarmFilterType.toLowerCase()) {
            case 'priority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardAlarmService.alarmFilterPrioritySelection != num) {
                    changed = true;
                }
                //this.dashboardAlarmService.setAlarmFilter('priority', num);
                filter = 'priority';
                value = num;
                if (changed) {
                    //if (this.dashboardAlarmService.alarmFilterPrioritySelection > 0)
                    if (num > 0)
                        this.alarmFilterCriteriaPriorityCount = 1;
                    else
                        this.alarmFilterCriteriaPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaOperatorCount = 1;
                else
                    this.alarmFilterCriteriaOperatorCount = 0;
                break;
            case 'description':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('description', str);
                filter = 'description';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterDescriptionSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaDescCount = 1;
                else
                    this.alarmFilterCriteriaDescCount = 0;
                break;
            case 'state':
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardAlarmService.setAlarmFilter('state', num);
                filter = 'state';
                value = num;
                //if (this.dashboardAlarmService.alarmFilterStateSelection > 0)
                if (num > 0)
                    this.alarmFilterCriteriaStateCount = 1;
                else
                    this.alarmFilterCriteriaStateCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterRobotSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaRobotCount = 1;
                else
                    this.alarmFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }
        this.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaPriorityCount + this.alarmFilterCriteriaOperatorCount + this.alarmFilterCriteriaDescCount + this.alarmFilterCriteriaStateCount + this.alarmFilterCriteriaRobotCount;
        if (this.alarmFilterCriteriaTotalCount > 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.alarmFilterCriteriaTotalCount === 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.alarmFilterCriteriaText = null;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaTotalCount;
        this.dashboardAlarmService.setAlarmFilter(filter, value);
    };
    DashboardFilter.prototype.alarmFilterUpdated = function (alarmFilterType, event) {
        var num = 0;
        var str = '';
        var changed = false;
        var filter = '';
        var value = '';
        switch (alarmFilterType.toLowerCase()) {
            case 'priority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardAlarmService.alarmFilterPrioritySelection != num) {
                    changed = true;
                }
                //this.dashboardAlarmService.setAlarmFilter('priority', num);
                filter = 'priority';
                value = num;
                if (changed) {
                    //if (this.dashboardAlarmService.alarmFilterPrioritySelection > 0)
                    if (num > 0)
                        this.alarmFilterCriteriaPriorityCount = 1;
                    else
                        this.alarmFilterCriteriaPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaOperatorCount = 1;
                else
                    this.alarmFilterCriteriaOperatorCount = 0;
                break;
            case 'description':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('description', str);
                filter = 'description';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterDescriptionSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaDescCount = 1;
                else
                    this.alarmFilterCriteriaDescCount = 0;
                break;
            case 'state':
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardAlarmService.setAlarmFilter('state', num);
                filter = 'state';
                value = num;
                //if (this.dashboardAlarmService.alarmFilterStateSelection > 0)
                if (num > 0)
                    this.alarmFilterCriteriaStateCount = 1;
                else
                    this.alarmFilterCriteriaStateCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardAlarmService.setAlarmFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardAlarmService.alarmFilterRobotSelection != 'All')
                if (str != 'All')
                    this.alarmFilterCriteriaRobotCount = 1;
                else
                    this.alarmFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }
        this.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaPriorityCount + this.alarmFilterCriteriaOperatorCount + this.alarmFilterCriteriaDescCount + this.alarmFilterCriteriaStateCount + this.alarmFilterCriteriaRobotCount;
        if (this.alarmFilterCriteriaTotalCount > 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.alarmFilterCriteriaTotalCount === 1) {
            this.alarmFilterCriteriaText = "(" + this.alarmFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.alarmFilterCriteriaText = null;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = this.alarmFilterCriteriaTotalCount;
        this.dashboardAlarmService.setAlarmFilter(filter, value);
    };
    DashboardFilter.prototype.loadAlarmRobotData = function () {
        var alarms = this.dashboardAlarmService.getAlarms();
        if (alarms.length > 0) {
            this.alarmFilterRobotList = this.getAlarmRobots(alarms);
        }
    };
    DashboardFilter.prototype.showAlarmFilterCriteria = function () {
        if (this.show)
            this.show = !this.show;
        if (this.expandedSection[Section.Alarm.toString()] === 'in')
            this.toggleExpandedSectionView(Section.Alarm);
    };
    DashboardFilter.prototype.showPatrolFilterCriteria = function () {
        if (this.show)
            this.show = !this.show;
        if (this.expandedSection[Section.Patrol.toString()] === 'in')
            this.toggleExpandedSectionView(Section.Patrol);
    };
    //Current Alarms Only
    DashboardFilter.prototype.alarmDataUpdated = function () {
        var alarms = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);
    };
    //timeframe patrol only
    DashboardFilter.prototype.alarmDataUpdatedForTimeframeChange = function () {
        //this.dashboardAlarmService.clearAlarmFilters(false);
        this.alarmFilterCriteriaTotalCount = 0;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = 0;
        this.alarmFilterCriteriaPriorityCount = 0;
        this.alarmFilterCriteriaOperatorCount = 0;
        this.alarmFilterCriteriaDescCount = 0;
        this.alarmFilterCriteriaStateCount = 0;
        this.alarmFilterCriteriaRobotCount = 0;
        this.alarmFilterCriteriaText = null;
        this.alarmFilterPriorityList = {};
        this.alarmFilterPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        //$("#dropdownSelect-priority").val("4");
        var alarms = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);
    };
    DashboardFilter.prototype.removeSelectedAlarmFilters = function (event) {
        if (event)
            event.stopPropagation();
        this.dashboardAlarmService.clearAlarmFilters(true);
        this.alarmFilterCriteriaTotalCount = 0;
        this.dashboardAlarmService.alarmFilterCriteriaTotalCount = 0;
        this.alarmFilterCriteriaPriorityCount = 0;
        this.alarmFilterCriteriaOperatorCount = 0;
        this.alarmFilterCriteriaDescCount = 0;
        this.alarmFilterCriteriaStateCount = 0;
        this.alarmFilterCriteriaRobotCount = 0;
        this.alarmFilterCriteriaText = null;
        this.alarmFilterPriorityList = {};
        this.alarmFilterPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        //$("#dropdownSelect-priority").val("4");
        var alarms = this.dashboardAlarmService.getAlarms();
        this.alarmFilterOperatorList = this.getAlarmOperators(alarms);
        this.alarmFilterDescriptionList = this.getAlarmDescriptions(alarms);
        this.alarmFilterStatusList = this.getAlarmStatuses(alarms);
        this.alarmFilterRobotList = this.getAlarmRobots(alarms);
    };
    DashboardFilter.prototype.getAlarmOperators = function (alarms) {
        var alarmData = { All: 'All' };
        //walk high level 
        for (var i in alarms) {
            if (alarms[i].UserId) {
                if (typeof (alarmData[alarms[i].UserId]) == "undefined") {
                    alarmData[alarms[i].UserId] = alarms[i].UserId;
                }
            }
            if (alarms[i].Created) {
                if (alarms[i].Created.UserId != null) {
                    if (typeof (alarmData[alarms[i].Created.UserId]) == "undefined") {
                        alarmData[alarms[i].Created.UserId] = alarms[i].Created.UserId;
                    }
                }
            }
            if (alarms[i].Acknowledged) {
                if (alarms[i].Acknowledged.UserId != null) {
                    if (typeof (alarmData[alarms[i].Acknowledged.UserId]) == "undefined") {
                        alarmData[alarms[i].Acknowledged.UserId] = alarms[i].Acknowledged.UserId;
                    }
                }
            }
            if (alarms[i].Cleared) {
                if (alarms[i].Cleared.UserId != null) {
                    if (typeof (alarmData[alarms[i].Cleared.UserId]) == "undefined") {
                        alarmData[alarms[i].Cleared.UserId] = alarms[i].Cleared.UserId;
                    }
                }
            }
            if (alarms[i].Dismissed) {
                if (alarms[i].Dismissed.UserId != null) {
                    if (typeof (alarmData[alarms[i].Dismissed.UserId]) == "undefined") {
                        alarmData[alarms[i].Dismissed.UserId] = alarms[i].Dismissed.UserId;
                    }
                }
            }
            if (alarms[i].Comments) {
                for (var x in alarms[i].Comments) {
                    if (alarms[i].Comments[x].UserId != null) {
                        if (typeof (alarmData[alarms[i].Comments[x].UserId]) == "undefined") {
                            alarmData[alarms[i].Comments[x].UserId] = alarms[i].Comments[x].UserId;
                        }
                    }
                }
            }
        }
        return alarmData;
    };
    DashboardFilter.prototype.getAlarmDescriptions = function (alarms) {
        var alarmData = { All: 'All' };
        for (var i in alarms) {
            if (alarms[i].Description) {
                if (typeof (alarmData[alarms[i].Description]) == "undefined") {
                    alarmData[alarms[i].Description] = alarms[i].Description;
                }
            }
        }
        return alarmData;
    };
    DashboardFilter.prototype.getAlarmStatuses = function (alarms) {
        var alarmData = {};
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            alarmData = { All: 0, Reported: 1, Acknowledged: 2 };
        }
        else {
            alarmData = { All: 0, Reported: 1, Acknowledged: 2, Cleared: 3, Dismissed: 4 };
        }
        return alarmData;
    };
    DashboardFilter.prototype.getAlarmRobots = function (alarms) {
        var alarmData = { All: 'All' };
        for (var i in alarms) {
            if (alarms[i].PlatformId) {
                var platform = this.dashboardPlatformService.getPlatform(alarms[i].PlatformId);
                if (platform) {
                    if (typeof (alarmData[platform.id]) == "undefined") {
                        alarmData[platform.DisplayName] = platform.id;
                    }
                }
            }
        }
        return alarmData;
    };
    ///////////////////////////////////////////
    //Patrol Filter Methods
    ///////////////////////////////////////////
    DashboardFilter.prototype.patrolFilterSelected = function (patrolFilterType, event) {
        var num = 0;
        var str = '';
        var changed = false;
        var filter = '';
        var value = '';
        switch (patrolFilterType.toLowerCase()) {
            case 'alarmpriority':
                num = 0;
                if (event)
                    num = parseInt(event);
                if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection != num) {
                    changed = true;
                }
                //this.dashboardPatrolService.setPatrolFilter('alarmpriority', num);
                filter = 'alarmpriority';
                value = num;
                if (changed) {
                    //if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
                    if (num > 0)
                        this.patrolFilterCriteriaAlarmPriorityCount = 1;
                    else
                        this.patrolFilterCriteriaAlarmPriorityCount = 0;
                }
                break;
            case 'operator':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('operator', str);
                filter = 'operator';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
                if (str != 'All')
                    this.patrolFilterCriteriaOperatorCount = 1;
                else
                    this.patrolFilterCriteriaOperatorCount = 0;
                break;
            case 'displayname':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('displayname', str);
                filter = 'displayname';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
                if (str != 'All')
                    this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
                else
                    this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
                break;
            case 'status':
                //All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3
                //All had to be 4 since the PatrolStatusValues enums is setup 0 - 3
                num = 0;
                if (event)
                    num = parseInt(event);
                //this.dashboardPatrolService.setPatrolFilter('status', num);
                filter = 'status';
                value = num;
                //if (this.dashboardPatrolService.patrolFilterStatusSelection <= 4)
                if (num <= 4)
                    this.patrolFilterCriteriaStatusCount = 1;
                else
                    this.patrolFilterCriteriaStatusCount = 0;
                break;
            case 'robot':
                str = '';
                if (event)
                    str = event;
                //this.dashboardPatrolService.setPatrolFilter('robot', str);
                filter = 'robot';
                value = str;
                //if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
                if (str != 'All')
                    this.patrolFilterCriteriaRobotCount = 1;
                else
                    this.patrolFilterCriteriaRobotCount = 0;
                break;
            default:
                break;
        }
        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;
        this.dashboardPatrolService.setPatrolFilter(filter, value);
    };
    //current only call
    DashboardFilter.prototype.patrolCompleteUpdate = function () {
        var patrols = this.dashboardPatrolService.getPatrols();
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        //Alarm Priority
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0) {
            //an alarm priority filter is selected
            //check to see if we need to keep the selection or reset it
            var pAlarms = this.dashboardPatrolService.getAllPatrolsAlarms(patrols);
            if (pAlarms.length > 0) {
                var critical = pAlarms.filter(function (a) { return a.Priority === 1; }).length;
                var high = pAlarms.filter(function (a) { return a.Priority === 2; }).length;
                var med = pAlarms.filter(function (a) { return a.Priority === 3; }).length;
                var low = pAlarms.filter(function (a) { return a.Priority === 4; }).length;
                switch (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection) {
                    case 1:
                        if (critical === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 2:
                        if (high === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 3:
                        if (med === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    case 4:
                        if (low === 0) {
                            this.patrolFilterAlarmPriorityList = {};
                            this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
                            this.dashboardPatrolService.patrolFilterAlarmPrioritySelection = 0;
                            this.patrolFilterCriteriaAlarmPriorityCount = 0;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        //Operator
        if (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All') {
            //an operator is selected
            //check to see if we need to keep the selection or reset it
            var opList = this.getPatrolOperators(patrols, patrolTemplates);
            if (typeof (opList[this.dashboardPatrolService.patrolFilterOperatorSelection]) === "undefined") {
                this.patrolFilterOperatorList = opList;
                this.dashboardPatrolService.patrolFilterOperatorSelection = 'All';
                this.patrolFilterCriteriaOperatorCount = 0;
            }
        }
        else {
            this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        }
        //DisplayName
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            var dnList = this.getPatrolDisplayNames(patrols, patrolTemplates);
            if (typeof (dnList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined") {
                this.patrolFilterPatrolDisplayNameList = dnList;
                this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection = 'All';
                this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
            }
        }
        else {
            this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        }
        //Status
        if (this.dashboardPatrolService.patrolFilterStatusSelection < 4) {
            if (patrols.length === 0) {
                //check the patrol templates too
                var submittedPatrols = patrolTemplates.filter(function (pt) { return pt.IsPatrolSubmitted === true; });
                if (submittedPatrols.length === 0) {
                    this.patrolFilterStatusList = {};
                    this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
                    this.dashboardPatrolService.patrolFilterStatusSelection = 4;
                    this.patrolFilterCriteriaStatusCount = 0;
                }
            }
        }
        else {
            this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
        }
        //Robot
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            var rList = this.getPatrolRobots(patrols, patrolTemplates);
            if (typeof (rList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined") {
                this.patrolFilterRobotList = rList;
                this.dashboardPatrolService.patrolFilterRobotSelection = 'All';
                this.patrolFilterCriteriaRobotCount = 0;
            }
        }
        else {
            //still make sure to reset the list to the current data
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }
        //update Patrol Filter Criteria Text
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
            this.patrolFilterCriteriaAlarmPriorityCount = 1;
        else
            this.patrolFilterCriteriaAlarmPriorityCount = 0;
        if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
            this.patrolFilterCriteriaOperatorCount = 1;
        else
            this.patrolFilterCriteriaOperatorCount = 0;
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
            this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
        else
            this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        if (this.dashboardPatrolService.patrolFilterStatusSelection <= 4)
            this.patrolFilterCriteriaStatusCount = 1;
        else
            this.patrolFilterCriteriaStatusCount = 0;
        if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
            this.patrolFilterCriteriaRobotCount = 1;
        else
            this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;
    };
    DashboardFilter.prototype.loadPatrolRobotData = function () {
        var patrols = this.dashboardPatrolService.getPatrols();
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        if (patrols.length > 0) {
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }
    };
    //current Patrols Only
    DashboardFilter.prototype.patrolDataUpdated = function () {
        //let patrols: PatrolInstance[] = this.dashboardPatrolService.getPatrols();
        //let patrolTemplates: PatrolTemplate[] = this.dashboardPatrolService.getPatrolTemplates();
        //this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        //this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        //this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        var patrols = this.dashboardPatrolService.getPatrols();
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        //Operator
        if (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All') {
            //an operator is selected
            //check to see if we need to keep the selection or reset it
            var opList = this.getPatrolOperators(patrols, patrolTemplates);
            if (typeof (opList[this.dashboardPatrolService.patrolFilterOperatorSelection]) === "undefined") {
                this.patrolFilterOperatorList = opList;
                this.dashboardPatrolService.patrolFilterOperatorSelection = 'All';
                this.patrolFilterCriteriaOperatorCount = 0;
            }
            else {
                //TODO - add single item to dropdown
            }
        }
        else {
            this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        }
        //DisplayName
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All') {
            var dnList = this.getPatrolDisplayNames(patrols, patrolTemplates);
            if (typeof (dnList[this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection]) === "undefined") {
                this.patrolFilterPatrolDisplayNameList = dnList;
                this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection = 'All';
                this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
            }
        }
        else {
            this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        }
        //Robot
        if (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All') {
            var rList = this.getPatrolRobots(patrols, patrolTemplates);
            if (typeof (rList[this.dashboardPatrolService.patrolFilterRobotSelection]) === "undefined") {
                this.patrolFilterRobotList = rList;
                this.dashboardPatrolService.patrolFilterRobotSelection = 'All';
                this.patrolFilterCriteriaRobotCount = 0;
            }
        }
        else {
            this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
        }
        //update Patrol Filter Criteria Text
        if (this.dashboardPatrolService.patrolFilterAlarmPrioritySelection > 0)
            this.patrolFilterCriteriaAlarmPriorityCount = 1;
        else
            this.patrolFilterCriteriaAlarmPriorityCount = 0;
        if (this.dashboardPatrolService.patrolFilterOperatorSelection != 'All')
            this.patrolFilterCriteriaOperatorCount = 1;
        else
            this.patrolFilterCriteriaOperatorCount = 0;
        if (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection != 'All')
            this.patrolFilterCriteriaPatrolDisplayNameCount = 1;
        else
            this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        if (this.dashboardPatrolService.patrolFilterStatusSelection < 4)
            this.patrolFilterCriteriaStatusCount = 1;
        else
            this.patrolFilterCriteriaStatusCount = 0;
        if (this.dashboardPatrolService.patrolFilterRobotSelection != 'All')
            this.patrolFilterCriteriaRobotCount = 1;
        else
            this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaAlarmPriorityCount + this.patrolFilterCriteriaOperatorCount + this.patrolFilterCriteriaPatrolDisplayNameCount + this.patrolFilterCriteriaStatusCount + this.patrolFilterCriteriaRobotCount;
        if (this.patrolFilterCriteriaTotalCount > 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filters Enabled";
        }
        else if (this.patrolFilterCriteriaTotalCount === 1) {
            this.patrolFilterCriteriaText = "(" + this.patrolFilterCriteriaTotalCount.toString() + ") Filter Enabled";
        }
        else
            this.patrolFilterCriteriaText = null;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = this.patrolFilterCriteriaTotalCount;
    };
    //timeframe patrol only
    DashboardFilter.prototype.patrolDataUpdatedForTimeframeChange = function () {
        this.patrolFilterCriteriaTotalCount = 0;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = 0;
        this.patrolFilterCriteriaAlarmPriorityCount = 0;
        this.patrolFilterCriteriaOperatorCount = 0;
        this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        this.patrolFilterCriteriaStatusCount = 0;
        this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaText = null;
        this.patrolFilterAlarmPriorityList = {};
        this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        this.patrolFilterStatusList = {};
        this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
        var patrols = this.dashboardPatrolService.getPatrols();
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        this.patrolFilterOperatorList = { All: 'All' };
        this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        this.patrolFilterPatrolDisplayNameList = { All: 'All' };
        this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        this.patrolFilterRobotList = { All: 'All' };
        this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
    };
    DashboardFilter.prototype.removeSelectedPatrolFilters = function (event) {
        if (event)
            event.stopPropagation();
        this.dashboardPatrolService.clearPatrolFilters(true);
        this.patrolFilterCriteriaTotalCount = 0;
        this.dashboardPatrolService.patrolFilterCriteriaTotalCount = 0;
        this.patrolFilterCriteriaAlarmPriorityCount = 0;
        this.patrolFilterCriteriaOperatorCount = 0;
        this.patrolFilterCriteriaPatrolDisplayNameCount = 0;
        this.patrolFilterCriteriaStatusCount = 0;
        this.patrolFilterCriteriaRobotCount = 0;
        this.patrolFilterCriteriaText = null;
        this.patrolFilterAlarmPriorityList = {};
        this.patrolFilterAlarmPriorityList = { All: 0, P1: 1, P2: 2, P3: 3, P4: 4 };
        this.patrolFilterStatusList = { All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3 };
        var patrols = this.dashboardPatrolService.getPatrols();
        var patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        this.patrolFilterOperatorList = { All: 'All' };
        this.patrolFilterOperatorList = this.getPatrolOperators(patrols, patrolTemplates);
        this.patrolFilterPatrolDisplayNameList = { All: 'All' };
        this.patrolFilterPatrolDisplayNameList = this.getPatrolDisplayNames(patrols, patrolTemplates);
        this.patrolFilterRobotList = { All: 'All' };
        this.patrolFilterRobotList = this.getPatrolRobots(patrols, patrolTemplates);
    };
    DashboardFilter.prototype.getPatrolOperators = function (patrols, patrolTemplates) {
        var patrolData = { All: 'All' };
        //if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
        //    //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME
        //    //get any patrol templates that have been submited
        //    let submittedPatrols: PatrolTemplate[] = patrolTemplates.filter(pt => pt.IsPatrolSubmitted === true);
        //    if (submittedPatrols.length > 0) {
        //        //make sure we do not already have the patrol instance for the submitted template
        //        for (let pt of submittedPatrols) {
        //            let match: PatrolInstance[] = patrols.filter(p => p.TemplateId === pt.TemplateId);
        //            if (match.length === 0) {
        //                //none of the current patrols are for the submitted patrol template
        //                if (typeof (patrolData[pt.UserName]) === "undefined")
        //                    patrolData[pt.UserName] = pt.UserName;
        //            }
        //        }
        //    }
        //}
        for (var _i = 0, patrols_1 = patrols; _i < patrols_1.length; _i++) {
            var patrol = patrols_1[_i];
            if (patrol.UserName) {
                if (typeof (patrolData[patrol.UserName]) === "undefined") {
                    patrolData[patrol.UserName] = patrol.UserName;
                }
            }
        }
        return patrolData;
    };
    DashboardFilter.prototype.getPatrolDisplayNames = function (patrols, patrolTemplates) {
        var patrolData = { All: 'All' };
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME
            //get any patrol templates that have been submited
            var submittedPatrols = patrolTemplates.filter(function (pt) { return pt.IsPatrolSubmitted === true; });
            if (submittedPatrols.length > 0) {
                var _loop_1 = function (pt) {
                    var match = patrols.filter(function (p) { return p.TemplateId === pt.TemplateId; });
                    if (match.length === 0) {
                        //none of the current patrols are for the submitted patrol template
                        //so get the templates display name
                        if (typeof (patrolData[pt.DisplayName]) === "undefined")
                            patrolData[pt.DisplayName] = pt.DisplayName;
                    }
                };
                //make sure we do not already have the patrol instance for the submitted template
                for (var _i = 0, submittedPatrols_1 = submittedPatrols; _i < submittedPatrols_1.length; _i++) {
                    var pt = submittedPatrols_1[_i];
                    _loop_1(pt);
                }
            }
        }
        for (var _a = 0, patrols_2 = patrols; _a < patrols_2.length; _a++) {
            var patrol = patrols_2[_a];
            if (patrol.DisplayName) {
                if (typeof (patrolData[patrol.DisplayName]) === "undefined") {
                    patrolData[patrol.DisplayName] = patrol.DisplayName;
                }
            }
        }
        return patrolData;
    };
    DashboardFilter.prototype.getPatrolRobots = function (patrols, patrolTemplates) {
        var patrolData = { All: 'All' };
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //NOTE: WE SHOULD ONLY HAVE 1 TEMPLATE RUNNING AT A TIME
            //get any patrol templates that have been submited
            var submittedPatrols = patrolTemplates.filter(function (pt) { return pt.IsPatrolSubmitted === true; });
            if (submittedPatrols.length > 0) {
                //make sure we do not already have the patrol instance for the submitted template
                for (var _i = 0, submittedPatrols_2 = submittedPatrols; _i < submittedPatrols_2.length; _i++) {
                    var pt = submittedPatrols_2[_i];
                    if (pt.PlatformSubmittedId) {
                        var platform = this.dashboardPlatformService.getPlatform(pt.PlatformSubmittedId);
                        if (platform) {
                            if (typeof (patrolData[platform.id]) === "undefined") {
                                patrolData[platform.DisplayName] = platform.id;
                            }
                        }
                    }
                }
            }
        }
        for (var _a = 0, patrols_3 = patrols; _a < patrols_3.length; _a++) {
            var patrol = patrols_3[_a];
            if (patrol.PlatformId) {
                var platform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                if (platform) {
                    if (typeof (patrolData[platform.id]) === "undefined") {
                        patrolData[platform.DisplayName] = platform.id;
                    }
                }
            }
        }
        return patrolData;
    };
    DashboardFilter = __decorate([
        Component({
            selector: 'dashboard-filter',
            templateUrl: 'dashboard-filter.component.html',
            styleUrls: ['dashboard-filter.component.css', 'dashboard.component.css'],
            animations: [
                trigger('toggle', [
                    state('in', style({
                        display: 'none',
                        height: '0px',
                        overflow: 'hidden'
                    })),
                    state('out', style({
                        height: '*'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            DashboardPatrolService,
            DashboardPlatformService])
    ], DashboardFilter);
    return DashboardFilter;
}());
export { DashboardFilter };
//# sourceMappingURL=dashboard-filter.component.js.map