var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { FilterTimeframe, DashboardTabs } from './dashboard';
import { PatrolStatusValues } from '../patrols/patrol.class';
import { PointStatusValues } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';
var DashboardHeader = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardHeader(dashboardService, dashboardAlarmService, dashboardPatrolService, dashboardPlatformService, sanitizer, changeDetectorRef) {
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.dashboardPatrolService = dashboardPatrolService;
        this.dashboardPlatformService = dashboardPlatformService;
        this.sanitizer = sanitizer;
        this.changeDetectorRef = changeDetectorRef;
        this.filterTimeframe = FilterTimeframe;
        this.dashboardTab = DashboardTabs;
        this.isLoaded = true;
        this.alarms = [];
        this.patrolInstances = [];
        this.patrolTemplates = [];
        this.platforms = [];
        this.ngUnsubscribe = new Subject();
        //tab data
        this.tabTimeFrame = '';
        this.tabSortField = '';
        //alarm data
        this.highestAlarmPriority = '';
        this.alarmCount = 0;
        this.alarmCriticalPriorityCount = 0;
        this.alarmHighPriorityCount = 0;
        this.alarmMediumPriorityCount = 0;
        this.alarmLowPriorityCount = 0;
        this.alarmHeaderFilteredCriteria = '';
        //patrol data
        this.highestPatrolStatus = '';
        this.patrolTabHeader = '';
        this.patrolHeaderFilteredCriteria = '';
        this.patrolCount = 0;
        this.patrolCriticalCount = 0;
        this.patrolIncompleteCount = 0;
        this.patrolWarningCount = 0;
        this.patrolSuccessfulCount = 0;
        this.patrolCriticalIDs = [];
        this.patrolIncompleteIDs = [];
        this.patrolWarningIDs = [];
        this.patrolSuccessfulIDs = [];
        this.patrolSubmittedTemplateIDs = [];
        //robot data
        this.highestPlatformStatus = '';
        this.robotTabHeader = '';
        this.robotCount = 0;
        this.robotFailedCount = 0;
        this.robotErrorCount = 0;
        this.robotHealthyCount = 0;
        this.robotDisabledCount = 0;
        //location changed
        this.dashboardService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLocationsChanged(); }
        });
        //tab change
        this.dashboardService.onDashboardTabChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleTabChanged(); }
        });
        //filter panel criteria changed
        this.dashboardAlarmService.filterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        //timeframe changed
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleTimeFrameChanged(); }
        });
        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        //for alarm Data
        this.dashboardAlarmService.onAlarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        this.dashboardAlarmService.onEditAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        this.dashboardAlarmService.onRemoveAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updateAlarmData(); }
        });
        //for patrol instance data
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardPatrolService.onUpdatePatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        //for patrol template data
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolData(); }
        });
        //for robots and drones data
        this.dashboardPlatformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePlatformData(); }
        });
        this.dashboardPlatformService.updatePlatformlData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePlatformData(); }
        });
        //TSR* 
        this.handleTabChanged();
        if (this.dashboardService.alarmDataLoaded)
            this.updateAlarmData();
        if (this.dashboardService.patrolDataLoaded)
            this.updatePatrolData();
        if (this.dashboardService.platformDataLoaded)
            this.updatePlatformData();
    }
    DashboardHeader.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    DashboardHeader.prototype.handleLocationsChanged = function () {
        this.getLocationHeader();
    };
    DashboardHeader.prototype.handleTimeFrameChanged = function () {
        this.getTabHeader();
    };
    DashboardHeader.prototype.handleTabChanged = function () {
        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Alarms)
            this.tabSortField = 'by Reported Time';
        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Patrols)
            this.tabSortField = 'by Submitted Time';
        if (this.dashboardService.getSelectedDashboardTab() === DashboardTabs.Robots)
            this.tabSortField = '';
    };
    DashboardHeader.prototype.updateAlarmData = function () {
        this.alarms = this.dashboardAlarmService.getAlarms();
        //this.getTabHeader();
        this.setAlarmResultsHeaderFilteredCountField();
        this.getAlarmCritical();
        this.getAlarmHigh();
        this.getAlarmMedium();
        this.getAlarmLow();
        this.getAlarmCount();
        this.getHighestAlarmPriority();
        this.changeDetectorRef.markForCheck();
    };
    DashboardHeader.prototype.updatePatrolData = function () {
        this.patrolInstances = this.dashboardPatrolService.getPatrols();
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        this.setPatrolResultsHeaderFilteredCountField();
        //methods must be called in order (critical, failed, warning, successful)
        this.getPatrolsCriticalCount();
        this.getPatrolsIncompleteCount();
        this.getPatrolsWarningCount();
        this.getPatrolsSuccessfulCount();
        this.getPatrolsCount();
        this.getHighestPatrolStatus();
        this.changeDetectorRef.markForCheck();
    };
    DashboardHeader.prototype.updatePlatformData = function () {
        this.platforms = this.dashboardPlatformService.getPlatforms();
        this.getPlatformFailedCount();
        this.getPlatformErrorCount();
        this.getPlatformHealthyCount();
        this.getPlatformDisabledCount();
        this.getPlatformCount();
        this.highestPlatformStatus = this.getHighestPlatformStatus();
        this.changeDetectorRef.markForCheck();
    };
    //////////////////////////////////////////////
    //Header Methods
    //////////////////////////////////////////////
    DashboardHeader.prototype.getLocationHeader = function () {
        var locationHeader = "";
        if (this.dashboardService.getAllTenantLocations()) {
            var parent_1 = true;
            var totalCustCount = 0;
            var totalSelCount = 0;
            var customers = this.dashboardService.getAllTenantLocations();
            for (var _i = 0, customers_1 = customers; _i < customers_1.length; _i++) {
                var cust = customers_1[_i];
                totalCustCount = totalCustCount + cust.Locations.length;
                var selectedLoc = (cust.Locations.filter(function (c) { return c.Selected === true; }).length);
                totalSelCount = totalSelCount + selectedLoc;
            }
            parent_1 = (customers.filter(function (p) { return p.Selected === false; })).length > 0 ? false : true;
            if (parent_1) {
                //all high level customers are selected
                locationHeader = "All Locations (" + totalCustCount + ") ";
            }
            else {
                locationHeader = "Locations (" + totalSelCount + ") ";
            }
        }
        return locationHeader;
    };
    DashboardHeader.prototype.getTabHeader = function () {
        this.tabTimeFrame = "";
        var timeframe = this.dashboardService.getSelectedTimeframe();
        switch (timeframe) {
            case FilterTimeframe.Current:
                this.tabTimeFrame = "";
                break;
            case FilterTimeframe.EightHours:
                this.tabTimeFrame = "Last 8 Hours";
                break;
            case FilterTimeframe.TwelveHours:
                this.tabTimeFrame = "Last 12 Hours";
                break;
            case FilterTimeframe.TwentyFourHours:
                this.tabTimeFrame = "Last 24 Hours";
                break;
            case FilterTimeframe.LastWeek:
                this.tabTimeFrame = "Last Week";
                break;
            case FilterTimeframe.Custom:
                this.tabTimeFrame = "Custom Timeframe";
                break;
            default:
                this.tabTimeFrame = "";
                break;
        }
    };
    DashboardHeader.prototype.setAlarmResultsHeaderFilteredCountField = function () {
        if (((this.dashboardAlarmService.alarmFilterPrioritySelection) && (this.dashboardAlarmService.alarmFilterPrioritySelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterOperatorSelection) && (this.dashboardAlarmService.alarmFilterOperatorSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterDescriptionSelection) && (this.dashboardAlarmService.alarmFilterDescriptionSelection !== 'All')) ||
            ((this.dashboardAlarmService.alarmFilterStateSelection) && (this.dashboardAlarmService.alarmFilterStateSelection !== 0)) ||
            ((this.dashboardAlarmService.alarmFilterRobotSelection) && (this.dashboardAlarmService.alarmFilterRobotSelection !== 'All'))) {
            var count = this.alarms.length;
            this.alarmHeaderFilteredCriteria = count.toString();
        }
        else
            this.alarmHeaderFilteredCriteria = "";
    };
    DashboardHeader.prototype.setPatrolResultsHeaderFilteredCountField = function () {
        if ((this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            var count = this.patrolInstances.length; //templates???
            this.patrolHeaderFilteredCriteria = count.toString();
        }
        else
            this.patrolHeaderFilteredCriteria = "";
    };
    DashboardHeader.prototype.setDashboardTab = function (tab) {
        if (this.dashboardService.getSelectedDashboardTab() === tab)
            return;
        this.dashboardService.setSelectedDashboardTab(tab);
        this.changeDetectorRef.markForCheck();
    };
    DashboardHeader.prototype.showAlarmFilterCriteria = function () {
        this.dashboardService.showAlarmFilterCriteriaComponent();
    };
    DashboardHeader.prototype.showPatrolFilterCriteria = function () {
        this.dashboardService.showPatrolFilterCriteriaComponent();
    };
    DashboardHeader.prototype.removeSelectedAlarmFilters = function () {
        this.dashboardService.removeSelectedAlarmFilterCriteria();
    };
    DashboardHeader.prototype.removeSelectedPatrolFilters = function () {
        this.dashboardService.removeSelectedPatrolFilterCriteria();
    };
    //////////////////////////////////////////////
    //Alarm Methods
    //////////////////////////////////////////////
    //Critical
    DashboardHeader.prototype.getAlarmCritical = function () {
        this.alarmCriticalPriorityCount = this.alarms.filter(function (a) { return a.Priority === 1; }).length;
    };
    //High
    DashboardHeader.prototype.getAlarmHigh = function () {
        this.alarmHighPriorityCount = this.alarms.filter(function (a) { return a.Priority === 2; }).length;
    };
    //Medium
    DashboardHeader.prototype.getAlarmMedium = function () {
        this.alarmMediumPriorityCount = this.alarms.filter(function (a) { return a.Priority === 3; }).length;
    };
    //Low
    DashboardHeader.prototype.getAlarmLow = function () {
        this.alarmLowPriorityCount = this.alarms.filter(function (a) { return a.Priority === 4; }).length;
    };
    //Total
    DashboardHeader.prototype.getAlarmCount = function () {
        this.alarmCount = this.alarms.length;
    };
    //Highest Priority
    DashboardHeader.prototype.getHighestAlarmPriority = function () {
        var hPriority = 0;
        if (this.alarms && this.alarms.length > 0) {
            if (this.alarms.filter(function (a) { return a.Priority === 1; }).length > 0)
                hPriority = 1;
            else if ((this.alarms.filter(function (a) { return a.Priority === 2; }).length > 0) && (hPriority == 0))
                hPriority = 2;
            else if ((this.alarms.filter(function (a) { return a.Priority === 3; }).length > 0) && (hPriority == 0))
                hPriority = 3;
            else if ((this.alarms.filter(function (a) { return a.Priority === 4; }).length > 0) && (hPriority == 0))
                hPriority = 4;
            else if (hPriority == 0)
                hPriority = 5;
        }
        else {
            hPriority = 5; //5 means that there are no alarms in the system
        }
        this.highestAlarmPriority = hPriority.toString();
    };
    //////////////////////////////////////////////
    //Patrol Methods
    //////////////////////////////////////////////
    //Red - Critical
    DashboardHeader.prototype.getPatrolsCriticalCount = function () {
        this.patrolCriticalIDs = [];
        this.patrolCriticalCount = 0;
        var criticalPIs = this.patrolInstances.filter(function (p) { return (p.CurrentStatus === PatrolStatusValues.Failed) || (p.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints); });
        if ((criticalPIs != null) && (criticalPIs.length > 0)) {
            this.patrolCriticalIDs.concat(criticalPIs.map(function (x) { return x.InstanceId; }));
            this.patrolCriticalCount = criticalPIs.length;
        }
    };
    //Orange - Incomplete (checkpoints failed)
    DashboardHeader.prototype.getPatrolsIncompleteCount = function () {
        this.patrolIncompleteCount = 0;
        this.patrolIncompleteIDs = [];
        var failedPIs = this.patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.FailedCheckpoints; });
        if ((failedPIs != null) && (failedPIs.length > 0)) {
            this.patrolIncompleteIDs.concat(failedPIs.map(function (x) { return x.InstanceId; }));
            this.patrolIncompleteCount = failedPIs.length;
        }
    };
    //Amber - Aborted, Points Not Reached
    DashboardHeader.prototype.getPatrolsWarningCount = function () {
        this.patrolWarningCount = 0;
        var totalCount = 0;
        var pointNotReachedCount = 0;
        var pointCount = 0;
        var actionCount = 0;
        this.patrolWarningIDs = [];
        //check the patrols to see if any were aborted
        var pAborted = this.patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.Aborted; });
        if ((pAborted != null) && (pAborted.length > 0)) {
            this.patrolWarningIDs = this.patrolWarningIDs.concat(pAborted.map(function (x) { return x.InstanceId; }));
        }
        //check to see if any high level patrol statues are point not reached
        var pNotReached = this.patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.PointsNotReached; });
        if ((pNotReached != null) && (pNotReached.length > 0)) {
            this.patrolWarningIDs = this.patrolWarningIDs.concat(pNotReached.map(function (x) { return x.InstanceId; }));
        }
        var _loop_1 = function (pi) {
            var ptReached = pi.Points.filter(function (pt) { return (pt.CurrentStatus === PointStatusValues.Reached) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints); });
            if (ptReached.length > 0) {
                var _loop_2 = function (pti) {
                    var actionFailed = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported); });
                    if (actionFailed.length > 0) {
                        if (this_1.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                            this_1.patrolWarningIDs.push(pi.InstanceId);
                    }
                    //if the patrol is a running patrol:
                    //if a point has actions (i.e. its a checkpoint) and its status is 2 (reached) 
                    //but 1 or more of the points actions statuses is 1 (started) or 0 (unknown), then 
                    //get the checkpoints ordinal number and check to see if the next point after this one has a status or 1 (in transit) or 2(reached)
                    //if it does, then it means that this current point with actions (i.e. checkpoint) has failed
                    //return a status of 3 (failed) (Note!!! - this should role up to a patrol status of 6 once the patrol is completed)
                    var actionIncomplete = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown); });
                    if (actionIncomplete.length > 0) {
                        var nextPointOrdinal = ptReached.filter(function (o) { return o.Ordinal === (pti.Ordinal + 1); });
                        if (nextPointOrdinal.length > 0) {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown) {
                                if (this_1.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                                    this_1.patrolWarningIDs.push(pi.InstanceId);
                            }
                        }
                    }
                    ///
                };
                for (var _i = 0, ptReached_1 = ptReached; _i < ptReached_1.length; _i++) {
                    var pti = ptReached_1[_i];
                    _loop_2(pti);
                }
            }
            //point not reached
            var ptNotReached = pi.Points.filter(function (pt) { return (pt.CurrentStatus === PointStatusValues.NotReached) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints); });
            if (ptNotReached.length > 0) {
                if (this_1.patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                    this_1.patrolWarningIDs.push(pi.InstanceId);
            }
        };
        var this_1 = this;
        //the patrol may be still running:
        for (var _i = 0, _a = this.patrolInstances; _i < _a.length; _i++) {
            var pi = _a[_i];
            _loop_1(pi);
        }
        this.patrolWarningCount = this.patrolWarningIDs.length;
    };
    //Green - Successful
    DashboardHeader.prototype.getPatrolsSuccessfulCount = function () {
        this.patrolSuccessfulIDs = [];
        this.patrolSuccessfulCount = 0;
        var patrolInstanceCount = 0;
        this.patrolSubmittedTemplateIDs = [];
        var activePatrolTemplateIDs = this.patrolInstances.map(function (x) { return x.TemplateId; });
        var patrolInstanceSuccessful = [];
        var patrolInstanceSucc = this.patrolInstances.filter(function (p) { return ((p.CurrentStatus === PatrolStatusValues.Completed) ||
            (p.CurrentStatus === PatrolStatusValues.Paused) ||
            (p.CurrentStatus === PatrolStatusValues.Resumed) ||
            (p.CurrentStatus === PatrolStatusValues.Started)); });
        //&&
        //(!this.patrolWarningIDs.includes(p.InstanceId)) && 
        //(this.patrolFailIDs.indexOf(p.InstanceId) === -1) ));
        for (var _i = 0, patrolInstanceSucc_1 = patrolInstanceSucc; _i < patrolInstanceSucc_1.length; _i++) {
            var pis = patrolInstanceSucc_1[_i];
            if ((!this.patrolWarningIDs.includes(pis.InstanceId)) &&
                (!this.patrolIncompleteIDs.includes(pis.InstanceId))) {
                patrolInstanceSuccessful.push(pis);
            }
        }
        if ((patrolInstanceSuccessful != null) && (patrolInstanceSuccessful.length > 0)) {
            this.patrolSuccessfulIDs = this.patrolSuccessfulIDs.concat(patrolInstanceSuccessful.map(function (x) { return x.InstanceId; }));
            this.patrolSubmittedTemplateIDs = this.patrolSubmittedTemplateIDs.concat(patrolInstanceSuccessful.map(function (x) { return x.TemplateId; }));
            patrolInstanceCount = patrolInstanceSuccessful.length;
        }
        var patrolTemplateSubmitted = this.patrolTemplates.filter(function (pt) { return pt.IsPatrolSubmitted === true; });
        var patrolTemplateCount = 0;
        for (var _a = 0, patrolTemplateSubmitted_1 = patrolTemplateSubmitted; _a < patrolTemplateSubmitted_1.length; _a++) {
            var pts = patrolTemplateSubmitted_1[_a];
            if ((this.patrolSubmittedTemplateIDs.indexOf(pts.TemplateId) === -1) && (activePatrolTemplateIDs.indexOf(pts.TemplateId) === -1))
                patrolTemplateCount++;
        }
        this.patrolSuccessfulCount = patrolInstanceCount + patrolTemplateCount;
    };
    //Total 
    DashboardHeader.prototype.getPatrolsCount = function () {
        this.patrolCount = 0;
        this.patrolCount = this.patrolCriticalCount + this.patrolIncompleteCount + this.patrolWarningCount + this.patrolSuccessfulCount;
    };
    //Highest Priority
    DashboardHeader.prototype.getHighestPatrolStatus = function () {
        this.highestPatrolStatus = '';
        if (this.patrolInstances && this.patrolInstances.length > 0) {
            if (this.patrolCriticalCount > 0)
                this.highestPatrolStatus = 'failed';
            else if (this.patrolIncompleteCount > 0)
                this.highestPatrolStatus = 'error';
            else if (this.patrolWarningCount > 0)
                this.highestPatrolStatus = 'warning';
            else if (this.patrolSuccessfulCount > 0)
                this.highestPatrolStatus = 'healthy';
            else
                this.highestPatrolStatus = 'healthy';
        }
        else {
            this.highestPatrolStatus = 'healthy';
        }
    };
    //////////////////////////////////////////////
    //Platform Methods
    //////////////////////////////////////////////
    //Red - Failed
    DashboardHeader.prototype.getPlatformFailedCount = function () {
        var _this = this;
        this.robotFailedCount = this.platforms.filter(function (p) { return (_this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-failed'); }).length;
    };
    //Amber - Error
    DashboardHeader.prototype.getPlatformErrorCount = function () {
        var _this = this;
        this.robotErrorCount = this.platforms.filter(function (p) { return (_this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-error'); }).length;
    };
    //Green - Healthy
    DashboardHeader.prototype.getPlatformHealthyCount = function () {
        var _this = this;
        this.robotHealthyCount = this.platforms.filter(function (p) { return (_this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-healthy'); }).length;
    };
    //Gray - Disabled
    DashboardHeader.prototype.getPlatformDisabledCount = function () {
        var _this = this;
        this.robotDisabledCount = this.platforms.filter(function (p) { return (_this.dashboardPlatformService.getPlatformStatusClass(p) === 'platform-disabled'); }).length;
    };
    //Total
    DashboardHeader.prototype.getPlatformCount = function () {
        this.robotCount = this.platforms.length;
    };
    //Highest Priority
    DashboardHeader.prototype.getHighestPlatformStatus = function () {
        var hPriority = '';
        if (this.platforms && this.platforms.length > 0) {
            if (this.robotFailedCount > 0)
                hPriority = 'failed';
            else if (this.robotErrorCount > 0)
                hPriority = 'error';
            else if (this.robotHealthyCount > 0)
                hPriority = 'healthy';
            else if (this.robotDisabledCount > 0)
                hPriority = 'disabled';
            else
                hPriority = 'disabled';
        }
        else {
            hPriority = 'disabled';
        }
        return hPriority;
    };
    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    DashboardHeader.prototype.getSelectedTimeframe = function () {
        return this.dashboardService.getSelectedTimeframe();
    };
    DashboardHeader = __decorate([
        Component({
            selector: 'dashboard-header',
            templateUrl: 'dashboard-header.component.html',
            styleUrls: ['dashboard-header.component.css', 'dashboard.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            DashboardPatrolService,
            DashboardPlatformService,
            DomSanitizer,
            ChangeDetectorRef])
    ], DashboardHeader);
    return DashboardHeader;
}());
export { DashboardHeader };
//# sourceMappingURL=dashboard-header.component.js.map