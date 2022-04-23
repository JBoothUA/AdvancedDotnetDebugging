var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild, ElementRef, NgZone, trigger, state, transition, style, animate, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';
import { FilterTimeframe, PatrolStatus, SliderType } from './dashboard';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../shared/http.service';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { DashboardSlider } from './dashboard-slider.component';
import { Alarm } from '../alarms/alarm.class';
import { PatrolInstance, PatrolStatusValues, isPatrolTemplate, isPatrolInstance } from '../patrols/patrol.class';
//import { PatrolProgressbar } from '../patrols/patrol-progressbar.component';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
var ResultsSize;
(function (ResultsSize) {
    //Small = 774, //add 10 for scroll and 5 buffer
    //Large = 934, //add 10 for scroll and 5 buffer
    //None = 0
    ResultsSize[ResultsSize["Small"] = 750] = "Small";
    ResultsSize[ResultsSize["Medium"] = 910] = "Medium";
    ResultsSize[ResultsSize["Large"] = 1010] = "Large";
    ResultsSize[ResultsSize["None"] = 0] = "None";
})(ResultsSize || (ResultsSize = {}));
var DashboardPatrol = /** @class */ (function () {
    ////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardPatrol(dashboardService, dashboardAlarmService, dashboardPlatformService, dashboardPatrolService, httpService, patrolStatusPipe, patrolRobotDronePipe, patrolAlarmPriorityPipe, changeDetectorRef, sanitizer, ngZone) {
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.dashboardPlatformService = dashboardPlatformService;
        this.dashboardPatrolService = dashboardPatrolService;
        this.httpService = httpService;
        this.patrolStatusPipe = patrolStatusPipe;
        this.patrolRobotDronePipe = patrolRobotDronePipe;
        this.patrolAlarmPriorityPipe = patrolAlarmPriorityPipe;
        this.changeDetectorRef = changeDetectorRef;
        this.sanitizer = sanitizer;
        this.ngZone = ngZone;
        //Class Variables
        this.resultsContainerDivSize = 750;
        this.expandedResult = new Map();
        this.expandedPatrolID = null;
        this.headerActiveField = '';
        //patrol props
        //patrols: PatrolInstance[] = [];
        this.masterPatrols = [];
        this.patrolTemplates = [];
        this.historicalPatrols = [];
        this.patrolToAlarmsMap = new Map();
        //patrol by status stacked bar chart props
        this.patrolStatusChartDataArray = [];
        this.patrolStatusChartData = null; //this object is used for Patrol Status Filter as well
        this.patrolStatusEnum = PatrolStatus;
        this.patrolStatusChartTotal = 0;
        this.patrolStatusChartIndexStart = -1;
        this.patrolStatusChartIndexEnd = -1;
        this.showPatrolStatusLegendData = new Map();
        this.patrolStatusChartSelectedDataValue = -1;
        this.patrolStatusChartSelectedLegendItemID = '-1';
        //Robot and Drones on Patrols Slider
        this.sliderTypeEnum = SliderType;
        this.patrolAlarmsChartLabels = [];
        this.patrolAlarmsChartTotal = 0;
        this.patrolAlarmsChartColors = [{ backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"] }];
        this.patrolAlarmsChartColorsDefault = [{ backgroundColor: ["#D62329", "#DB7828", "#F3B518", "#27BBA1"] }];
        this.patrolAlarmsChartColorsOpacity = [{
                backgroundColor: ["rgba(214,35,41,0.3)", "rgba(219,120,40,0.3)",
                    "rgba(243,181,24,0.3)", "rgba(39,187,161,0.3)"]
            }];
        this.patrolAlarmsChartType = 'doughnut';
        this.patrolAlarmsChartOptions = {
            legendCallback: this.getPatrolAlarmsLegendCallback,
            cutoutPercentage: 70,
            elements: { arc: { borderWidth: 0 } },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        //get the concerned dataset
                        var dataset = data.datasets[tooltipItem.datasetIndex];
                        var currentValue = dataset.data[tooltipItem.index];
                        return currentValue;
                    }
                },
                displayColors: false,
                position: 'nearest',
                mode: 'point',
                enabled: false
            }
        };
        this.showPatrolAlarmsLegendData = new Map();
        this.patrolAlarmsChartSelectedDataValue = -1;
        this.patrolAlarmsChartSelectedLegendItemID = '-1';
        //export props
        this.exporting = false;
        //results header props
        this.headerFilteredCriteriaField = '';
        this.headerAllPatrolStatusCriteriaField = '';
        this.headerActiveCriteriaField = '';
        this.headerTimeframeCriteriaField = '';
        this.headerRobotDroneCriteriaField = '';
        this.headerAlarmPriorityCriteriaField = '';
        //search props
        this.patrolPlaceHolderSearch = "Search Patrols";
        //patrol results props
        this.patrolInstanceMap = new Map();
        this.filteredPatrolInstanceMap = new Map();
        this.moreOperatorExpanded = false;
        this.showAlarmResultsColumn = true;
        this.showRobotDroneResultsColumn = true;
        this.showSubmittedTimeResultsColumn = true;
        this.patrolStatusValuesEnum = PatrolStatusValues;
        this.filterTimeframe = FilterTimeframe;
        this.currentScroll = 0;
        //quick filter - local page filters
        this.patrolRobotDroneFilter = null;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolResultCount = 0;
        //Subjects
        this.ngUnsubscribe = new Subject();
        //filter panel or main menu was toggled
        this.dashboardService.onLeftPanelToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (event) { return _this.onResize(event); }
        });
        //filter selections
        this.dashboardPatrolService.onRobotDroneSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (robotDroneData) { return _this.robotDroneSelected(robotDroneData); }
        });
        this.dashboardPatrolService.onFilterCriteriaChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleFilterCriteriaChanged(); }
        });
        //TODO add filter criteria changed event here
        //on timeframe change
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.timeframeChanged(); }
        });
        //alarm data
        this.dashboardAlarmService.updateAlarmData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdatedAlarmData(); }
        });
        this.dashboardAlarmService.onNewAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleNewAlarmData(); }
        });
        //on patrol instance updates
        this.dashboardPatrolService.onPatrolsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedPatrolData(); }
        });
        this.dashboardPatrolService.onNewPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleNewPatrolInstance(patrol); }
        });
        this.dashboardPatrolService.onUpdatePatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleUpdatedPatrolInstance(patrol); }
        });
        this.dashboardPatrolService.onCompletededPatrolInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleCompletededPatrolInstance(patrol); }
        });
        //patrol template updates
        this.dashboardPatrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLoadedPatrolData(); }
        });
        this.dashboardPatrolService.onUpdatePatrolTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (template) { return _this.handleUpdatePatrolTemplate(template); }
        });
        this.dashboardPatrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (templateID) { return _this.handlePatrolTemplateDeleted(templateID); }
        });
        //platform update??
        //filter or time change
        this.dashboardPatrolService.onUpdatePatrolData
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleUpdatePatrolData(); }
        });
    }
    DashboardPatrol.prototype.ngOnInit = function () {
        this.setPatrolStatusChartData();
        this.setPatrolAlarmsChartData();
        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        //this.ngZone.runOutsideAngular(() => {
        //    this.alarmResultsContainer.nativeElement.addEventListener('scroll', (e: any) => {
        //        this.onContainerScroll(e);
        //    });
        //});
        //TSR* 
        //get patrol data
        if (this.dashboardService.patrolDataLoaded) {
            this.masterPatrols = this.dashboardPatrolService.getPatrols();
            this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
            this.initPatrolInstanceMap();
        }
        else {
            this.masterPatrols = [];
            this.patrolTemplates = [];
        }
        //reset quick filters
        this.patrolRobotDroneFilter = null;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolResultCount = 0;
        //get filtered data
        this.updateFilteredPatrols();
    };
    DashboardPatrol.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.resultsContainerDivSize = this.patrolResultsContainer.nativeElement.clientWidth - 8;
        this.patrolResultsContainer.nativeElement.scrollTop = 0;
        this.updateData();
        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(function () {
            _this.patrolResultsContainer.nativeElement.addEventListener('scroll', function (e) {
                _this.onContainerScroll(e);
            });
        });
    };
    DashboardPatrol.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    DashboardPatrol.prototype.onResize = function (event) {
        this.resultsContainerDivSize = this.patrolResultsContainer.nativeElement.clientWidth - 8;
        this.determineDisplayItems();
    };
    DashboardPatrol.prototype.expandedMoreOperatorViewState = function () {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    };
    DashboardPatrol.prototype.toggleExpandedMoreOperatorView = function () {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    };
    DashboardPatrol.prototype.expandedResultsViewState = function (patrolInstanceID) {
        if (!this.expandedResult[patrolInstanceID])
            this.expandedResult[patrolInstanceID] = 'in';
        return this.expandedResult[patrolInstanceID];
    };
    DashboardPatrol.prototype.toggleExpandedResultsView = function (patrolInstanceID) {
        event.stopPropagation();
        if (this.expandedPatrolID && this.expandedPatrolID !== patrolInstanceID) {
            this.expandedResult[this.expandedPatrolID] = 'in';
        }
        if (this.expandedResult[patrolInstanceID] === 'out')
            this.expandedResult[patrolInstanceID] = 'in';
        else {
            this.expandedResult[patrolInstanceID] = 'out';
            this.expandedPatrolID = patrolInstanceID;
        }
    };
    DashboardPatrol.prototype.onContainerScroll = function (event) {
        this.currentScroll = this.patrolResultsContainer.nativeElement.scrollTop;
    };
    DashboardPatrol.prototype.maintainScroll = function () {
        this.patrolResultsContainer.nativeElement.scrollTop = this.currentScroll;
    };
    DashboardPatrol.prototype.updateScroll = function (patrol, newPatrol) {
        // Get the dom element of the alarm being added/removed
        var item = document.getElementById('patrol_result_item_' + patrol.InstanceId);
        if (item) {
            // If the patrol item is in or above the viewable section of the patrol container, 
            // change the current scroll top to prevent the scroll offset from changed
            if (item.offsetTop < this.patrolResultsContainer.nativeElement.scrollTop + this.patrolResultsContainer.nativeElement.clientHeight) {
                //if (newPatrol) {
                //    this.currentScroll += $(item).find('.lpItem').height() + 2; // +2 to account for border
                //} else {
                this.currentScroll -= item.children[0].clientHeight;
                //}
            }
        }
        this.maintainScroll();
    };
    DashboardPatrol.prototype.getFilteredPatrols = function () {
        var patrols = [];
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //processing current data - use the filtered map object
            if (this.filteredPatrolInstanceMap.size > 0) {
                patrols = Array.from(this.filteredPatrolInstanceMap.values());
            }
        }
        else {
            //processing timeframe data - use array returned from the query
            patrols = this.historicalPatrols;
        }
        return patrols;
    };
    DashboardPatrol.prototype.getAllFilteredPatrolsAlarms = function () {
        var _this = this;
        var patrolAlarms = [];
        var patrols = this.getFilteredPatrols();
        var alarmNotInService = [];
        this.patrolToAlarmsMap.clear();
        if (patrols && patrols.length > 0) {
            var patrolInst = patrols.filter(function (p) { return p.AlarmIds && p.AlarmIds.length > 0; });
            var alarmIDs = patrolInst.map(function (p) {
                if (p.AlarmIds && p.AlarmIds.length > 0) {
                    var alarms = [];
                    for (var _i = 0, _a = p.AlarmIds; _i < _a.length; _i++) {
                        var aID = _a[_i];
                        var alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                        if (alarm)
                            alarms.push(alarm);
                        else {
                            alarmNotInService.push(aID);
                        }
                    }
                    this.patrolToAlarmsMap.set(p.id, alarms);
                    return p.AlarmIds; //may not need this anymore
                }
            }, this);
            var patrolPointInst = patrols.filter(function (p) { return p.Points && p.Points.length > 0; });
            if (patrolPointInst) {
                var _loop_1 = function (pInst) {
                    var ptInstAlarms = pInst.Points.filter(function (pt) { return pt.AlarmIds && pt.AlarmIds.length > 0; });
                    if (ptInstAlarms.length > 0) {
                        var ptAlarmIDs = ptInstAlarms.map(function (p) {
                            if (p.AlarmIds && p.AlarmIds.length > 0) {
                                var alarms = [];
                                for (var _i = 0, _a = p.AlarmIds; _i < _a.length; _i++) {
                                    var aID = _a[_i];
                                    var alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                                    if (alarm)
                                        alarms.push(alarm);
                                    else {
                                        alarmNotInService.push(aID);
                                    }
                                }
                                if (this.patrolToAlarmsMap.has(pInst.id)) {
                                    var updAlarms = this.patrolToAlarmsMap.get(pInst.id);
                                    updAlarms = updAlarms.concat(alarms);
                                    this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                }
                                else {
                                    this.patrolToAlarmsMap.set(pInst.id, alarms);
                                }
                                return p.AlarmIds; //may not need this anymore
                            }
                        }, this_1);
                        if (ptAlarmIDs.length > 0)
                            alarmIDs = alarmIDs.concat(ptAlarmIDs);
                    }
                    var patrolPointActionInst = pInst.Points.filter(function (pt) { return pt.Actions && pt.Actions.length > 0; });
                    var patrolPointActions = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                    for (var _i = 0, patrolPointActions_1 = patrolPointActions; _i < patrolPointActions_1.length; _i++) {
                        var ptActionInst = patrolPointActions_1[_i];
                        var ptActionInstAlarms = ptActionInst.filter(function (a) { return a.AlarmIds !== null; });
                        if (ptActionInstAlarms.length > 0) {
                            var ptActionAlarmIDs = ptActionInstAlarms.map(function (p) {
                                if (p.AlarmIds && p.AlarmIds.length > 0) {
                                    var alarms = [];
                                    for (var _i = 0, _a = p.AlarmIds; _i < _a.length; _i++) {
                                        var aID = _a[_i];
                                        var alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
                                        if (alarm)
                                            alarms.push(alarm);
                                        else {
                                            alarmNotInService.push(aID);
                                        }
                                    }
                                    if (this.patrolToAlarmsMap.has(pInst.id)) {
                                        var updAlarms = this.patrolToAlarmsMap.get(pInst.id);
                                        updAlarms = updAlarms.concat(alarms);
                                        this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                    }
                                    else {
                                        this.patrolToAlarmsMap.set(pInst.id, alarms);
                                    }
                                    return p.AlarmIds;
                                }
                            }, this_1);
                            if (ptActionAlarmIDs.length > 0)
                                alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                        }
                    }
                };
                var this_1 = this;
                for (var _i = 0, patrolPointInst_1 = patrolPointInst; _i < patrolPointInst_1.length; _i++) {
                    var pInst = patrolPointInst_1[_i];
                    _loop_1(pInst);
                }
            }
            if (alarmNotInService.length > 0) {
                //TODO Test this scenario - if in last 8 hours search but patrol ran into 9th hour and alarm happened in to 9th hour
                //get these alarms from the database
                this.dashboardAlarmService.loadAlarmsByIds(alarmNotInService).then(function (alarms) {
                    if (alarms && alarms.length > 0) {
                        for (var _i = 0, alarms_1 = alarms; _i < alarms_1.length; _i++) {
                            var dbAlarms = alarms_1[_i];
                            var alarm = new Alarm(dbAlarms);
                            if (alarm.PatrolId) {
                                if (_this.patrolToAlarmsMap.has(alarm.PatrolId)) {
                                    var updAlarms = _this.patrolToAlarmsMap.get(alarm.PatrolId);
                                    updAlarms = updAlarms.concat(alarms);
                                }
                                else {
                                    _this.patrolToAlarmsMap.set(alarm.PatrolId, alarms);
                                }
                            }
                        }
                        _this.changeDetectorRef.detectChanges;
                    }
                });
            }
        }
    };
    DashboardPatrol.prototype.getAllPatrolsAlarms = function () {
        var patrolAlarms = [];
        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            this.patrolToAlarmsMap.forEach(function (alarm, index) {
                patrolAlarms = patrolAlarms.concat(alarm);
            });
        }
        return patrolAlarms;
    };
    DashboardPatrol.prototype.getAllPatrolsAlarmIDs = function () {
        var patrolAlarms = [];
        var patrolAlarmIDs = [];
        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            this.patrolToAlarmsMap.forEach(function (alarm, index) {
                patrolAlarms = patrolAlarms.concat(alarm);
            });
            if (patrolAlarms.length > 0) {
                patrolAlarmIDs = patrolAlarms.map(function (a) {
                    return a.Id;
                });
            }
        }
        return patrolAlarmIDs;
    };
    DashboardPatrol.prototype.getPatrolAlarms = function (patrolID) {
        var patrolAlarms = [];
        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            if (this.patrolToAlarmsMap.has(patrolID))
                patrolAlarms = this.patrolToAlarmsMap.get(patrolID);
        }
        return patrolAlarms;
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    DashboardPatrol.prototype.timeframeChanged = function () {
        //clear selected patrol
        if (this.dashboardPatrolService.selectedPatrol !== null)
            this.dashboardPatrolService.deSelectPatrol(this.dashboardPatrolService.selectedPatrol, true);
    };
    DashboardPatrol.prototype.handleFilterCriteriaChanged = function () {
        this.masterPatrols = this.dashboardPatrolService.getPatrols();
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.initPatrolInstanceMap();
        }
        this.updateData();
    };
    ////////
    //Alarm Notification
    ///////
    DashboardPatrol.prototype.handleUpdatedAlarmData = function () {
        this.updateData();
    };
    DashboardPatrol.prototype.handleNewAlarmData = function () {
        //process new alarm
        this.updateData();
    };
    ////////
    //Patrols Notification
    ///////
    DashboardPatrol.prototype.handleUpdatePatrolData = function () {
        //a filter was changed or a new timeframe was triggered
        this.masterPatrols = this.dashboardPatrolService.getPatrols();
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.initPatrolInstanceMap();
        }
        this.updateData();
    };
    DashboardPatrol.prototype.handleLoadedPatrolData = function () {
        this.masterPatrols = this.dashboardPatrolService.getPatrols();
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        this.initPatrolInstanceMap();
    };
    DashboardPatrol.prototype.handleUpdatePatrolTemplate = function (patrolTemplate) {
        //update master list
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            //check to see if the patrol has been submitted and if so add it to the map
            //otherwise remove it ***ONLY IF*** the template is still in the map and not the instance 
            //(i.e for some reason execute patrol failed to send back an instance - we need to remove the tempary patrol instance or the template)
            if (patrolTemplate.IsPatrolSubmitted && !this.patrolInstanceMap.has(patrolTemplate.TemplateId)) {
                this.addPatrolTemplateToMap(patrolTemplate);
            }
            else if (!patrolTemplate.IsPatrolSubmitted && this.patrolInstanceMap.has(patrolTemplate.TemplateId)) {
                //check to see if the object is a template
                var item = this.patrolInstanceMap.get(patrolTemplate.TemplateId);
                if (isPatrolTemplate(item))
                    this.removePatrolTemplateFromMap(patrolTemplate);
            }
            //do normal procecessings for updates
            this.updateData();
        }
    };
    DashboardPatrol.prototype.handlePatrolTemplateDeleted = function (templateID) {
        this.patrolTemplates = this.dashboardPatrolService.getPatrolTemplates();
    };
    DashboardPatrol.prototype.handleNewPatrolInstance = function (patrol) {
        //update master list
        this.masterPatrols = this.dashboardPatrolService.getPatrols();
        //add new patrol to dictionary (replace tempary patrol template)
        this.updatePatrolInstanceInMap(patrol);
    };
    DashboardPatrol.prototype.handleUpdatedPatrolInstance = function (patrolInstance) {
        if (patrolInstance) {
            this.updatePatrolInstanceInMap(patrolInstance);
            this.updateData();
        }
    };
    DashboardPatrol.prototype.handleCompletededPatrolInstance = function (patrolInstance) {
        if (patrolInstance) {
            if (patrolInstance.RunSetData && patrolInstance.RunSetData.NextRun) {
                //this is a repeat patrol
                //switch the patrol instance back to a patrol template with a waiting icon
                var pTemplate = void 0;
                var pts = this.patrolTemplates.filter(function (pt) { return pt.TemplateId === patrolInstance.TemplateId; });
                if (pts && pts.length > 0) {
                    pTemplate = pts[0];
                    if (pTemplate.IsPatrolSubmitted)
                        this.addPatrolTemplateToMap(pTemplate);
                }
            }
            else {
                var item = this.patrolInstanceMap.get(patrolInstance.TemplateId);
                if (isPatrolInstance(item)) {
                    //wait 90 seconds then remove the patrol from the dashboard
                    //setTimeout(() => this.removePatrolInstanceFromMap(patrolInstance), 90000);
                    this.removePatrolInstanceFromMap(patrolInstance);
                }
            }
            this.updateData();
        }
    };
    DashboardPatrol.prototype.initPatrolInstanceMap = function () {
        //clear out existing data
        this.clearPatrolInstanceMap();
        //load all patrols and submitted patrol templates into map
        if (this.masterPatrols || this.patrolTemplates) {
            for (var _i = 0, _a = this.masterPatrols; _i < _a.length; _i++) {
                var pi = _a[_i];
                this.updatePatrolInstanceInMap(pi);
            }
            for (var _b = 0, _c = this.patrolTemplates; _b < _c.length; _b++) {
                var pt = _c[_b];
                if (pt.IsPatrolSubmitted && !this.patrolInstanceMap.has(pt.TemplateId)) {
                    this.addPatrolTemplateToMap(pt);
                }
            }
        }
    };
    DashboardPatrol.prototype.addPatrolTemplateToMap = function (patrolTemplate) {
        //create a temporary patrol instance for the template so it will show up in the 
        //results as a pending patrol
        var pTempSubmitted = new PatrolInstance();
        pTempSubmitted.TemplateId = patrolTemplate.TemplateId;
        pTempSubmitted.CurrentStatus = PatrolStatusValues.Unknown;
        pTempSubmitted.AreaType = patrolTemplate.AreaType;
        pTempSubmitted.DisplayName = patrolTemplate.DisplayName;
        pTempSubmitted.Points = [];
        pTempSubmitted.TenantId = patrolTemplate.TenantId;
        pTempSubmitted.LocationId = patrolTemplate.LocationId;
        pTempSubmitted.AlarmIds = [];
        pTempSubmitted.PlatformId = patrolTemplate.PlatformSubmittedId;
        pTempSubmitted.IsTemplate = patrolTemplate.IsTemplate;
        pTempSubmitted.InstanceId = null;
        pTempSubmitted.RunSetData = patrolTemplate.RunSetData;
        pTempSubmitted.UserName = patrolTemplate.UserName;
        this.patrolInstanceMap.set(pTempSubmitted.TemplateId, pTempSubmitted);
    };
    DashboardPatrol.prototype.removePatrolTemplateFromMap = function (patrolTemplate) {
        if (this.patrolInstanceMap.has(patrolTemplate.TemplateId)) {
            //TODO
            //Wait a 90 seconds then remove it from the instance list
            this.patrolInstanceMap.delete(patrolTemplate.TemplateId);
            //setTimeout(() => this.completeInstance(updatedInstance), 1000);
        }
    };
    DashboardPatrol.prototype.updatePatrolInstanceInMap = function (patrolInstance) {
        if (patrolInstance) {
            //swap fake patrol template for real patrol instance
            this.patrolInstanceMap.set(patrolInstance.TemplateId, patrolInstance);
        }
    };
    DashboardPatrol.prototype.removePatrolInstanceFromMap = function (patrolInstance) {
        if (this.patrolInstanceMap.has(patrolInstance.TemplateId)) {
            this.patrolInstanceMap.delete(patrolInstance.TemplateId);
            if (patrolInstance.selected)
                this.dashboardPatrolService.deSelectPatrol(patrolInstance, true);
        }
    };
    DashboardPatrol.prototype.clearPatrolInstanceMap = function () {
        if (this.patrolInstanceMap)
            this.patrolInstanceMap.clear();
        else
            this.patrolInstanceMap = new Map();
    };
    DashboardPatrol.prototype.updateData = function () {
        //get the newly queried patrol data
        //this.masterPatrols = this.dashboardPatrolService.getPatrols();
        var _this = this;
        //reset local filters
        this.patrolResultCount = 0;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolRobotDroneFilter = null;
        this.setPatrolStatusChartData();
        //get filtered data
        this.updateFilteredPatrols();
        this.getAllFilteredPatrolsAlarms();
        //update the chart data
        this.updatePatrolStatusChartData();
        this.updatePatrolAlarmChartData();
        //update the Patrol Results Header section
        this.updateResultsHeader();
        //determine the results display columns
        this.determineDisplayItems();
        //TODO - select the previously selected patrol
        //hide the loading image
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current)
            setTimeout(function () { _this.dashboardService.onTimeframeChangeComplete.next(); }, 1000);
        else
            this.dashboardService.onTimeframeChangeComplete.next();
        //detect changes
        this.changeDetectorRef.detectChanges();
    };
    ///////////////////////////////////////////
    //Patrol Status Chart Methods
    ///////////////////////////////////////////
    DashboardPatrol.prototype.setPatrolStatusChartData = function () {
        this.patrolStatusChartData = {
            Critical: 0,
            Incomplete: 0,
            Warning: 0,
            Successful: 0,
            Selected: PatrolStatus.None
        };
        this.patrolStatusChartDataArray = [(this.patrolStatusChartData.Successful * 10),
            (this.patrolStatusChartData.Warning * 10),
            (this.patrolStatusChartData.Incomplete * 10),
            (this.patrolStatusChartData.Critical * 10)];
        this.patrolStatusChartTotal = 0;
    };
    DashboardPatrol.prototype.updatePatrolStatusChartData = function () {
        var patrols = this.getFilteredPatrols();
        if (patrols && patrols.length > 0) {
            var criticalCount = 0;
            var incompleteCount = 0;
            var warningCount = 0;
            var successfulCount = 0;
            var calcSize = 0;
            var fStatus = 0;
            var eStatus = 0;
            var wStatus = 0;
            var sStatus = 0;
            for (var _i = 0, patrols_1 = patrols; _i < patrols_1.length; _i++) {
                var patrol = patrols_1[_i];
                var patrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
                if (patrolStatusObj) {
                    switch (patrolStatusObj.Status) {
                        case PatrolStatus.Critical:
                            criticalCount++;
                            fStatus = 1;
                            break;
                        case PatrolStatus.Incomplete:
                            incompleteCount++;
                            eStatus = 1;
                            break;
                        case PatrolStatus.Warning:
                            warningCount++;
                            wStatus = 1;
                            break;
                        case PatrolStatus.Healthy:
                        case PatrolStatus.Successful:
                            successfulCount++;
                            sStatus = 1;
                            break;
                        default:
                            break;
                    }
                }
                else {
                    console.log("Unknow Patrol.  ID = '" + patrol.id + "'");
                }
            }
            this.patrolStatusChartData = {
                Critical: criticalCount,
                Incomplete: incompleteCount,
                Warning: warningCount,
                Successful: successfulCount,
                Selected: PatrolStatus.None
            };
            var totalStatus = fStatus + eStatus + wStatus + sStatus;
            if (totalStatus === 4)
                calcSize = 25;
            else if (totalStatus === 3)
                calcSize = 33.34;
            else if (totalStatus === 2)
                calcSize = 50;
            else if (totalStatus === 1)
                calcSize = 100;
            this.patrolStatusChartDataArray = [];
            this.patrolStatusChartIndexStart = -1;
            this.patrolStatusChartIndexEnd = -1;
            if (successfulCount > 0) {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Successful * calcSize));
                this.patrolStatusChartIndexStart = 0;
                if (warningCount === 0 && incompleteCount === 0 && criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 0;
            }
            else
                this.patrolStatusChartDataArray.push((0));
            if (warningCount > 0) {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Warning * calcSize));
                if (successfulCount === 0)
                    this.patrolStatusChartIndexStart = 1;
                if (incompleteCount === 0 && criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 1;
            }
            else
                this.patrolStatusChartDataArray.push((0));
            if (incompleteCount > 0) {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Incomplete * calcSize));
                if (successfulCount === 0 && warningCount === 0)
                    this.patrolStatusChartIndexStart = 2;
                if (criticalCount === 0)
                    this.patrolStatusChartIndexEnd = 2;
            }
            else
                this.patrolStatusChartDataArray.push((0));
            if (criticalCount > 0) {
                this.patrolStatusChartDataArray.push((this.patrolStatusChartData.Critical * calcSize));
                if (successfulCount === 0 && warningCount === 0 && incompleteCount === 0)
                    this.patrolStatusChartIndexStart = 3;
                this.patrolStatusChartIndexEnd = 3;
            }
            else
                this.patrolStatusChartDataArray.push((0));
            this.patrolStatusChartTotal = criticalCount + incompleteCount + warningCount + successfulCount;
            ////////////////////////////////
            //// TEST DATA
            ////////////////////////////////
            //this.patrolStatusChartData = {
            //    Failed: 0,
            //    Error: 2,
            //    Warning: 4,
            //    Successful: 5,
            //    Selected: PatrolStatus.None
            //};
            //this.patrolStatusChartDataArray = [(this.patrolStatusChartData.Successful * 10),
            //(this.patrolStatusChartData.Warning * 10),
            //(this.patrolStatusChartData.Error * 10)];//, (this.patrolStatusChartData.Failed * 10)];
            //this.patrolStatusChartTotal = 11;
            ////////////////////////////////
        }
        else {
            this.patrolStatusChartData = {
                Critical: 0,
                Incomplete: 0,
                Warning: 0,
                Successful: 0,
                Selected: PatrolStatus.None
            };
            this.patrolStatusChartDataArray = [];
            this.patrolStatusChartTotal = 0;
        }
    };
    DashboardPatrol.prototype.patrolStatusChartClicked = function (status) {
        //0 = successful, 1 = warning, 2 = error, 3 = failed
        switch (status) {
            case PatrolStatus.Successful:
                if (this.patrolStatusChartData.Successful === 0)
                    return;
                break;
            case PatrolStatus.Warning:
                if (this.patrolStatusChartData.Warning === 0)
                    return;
                break;
            case PatrolStatus.Incomplete:
                if (this.patrolStatusChartData.Incomplete === 0)
                    return;
                break;
            case PatrolStatus.Critical:
                if (this.patrolStatusChartData.Critical === 0)
                    return;
                break;
            default:
                break;
        }
        if (this.patrolStatusChartData.Selected === status) {
            //the user selected to turn off the status filter
            this.patrolStatusChartData.Selected = PatrolStatus.None;
        }
        else {
            //the user selected to turn on or change the status filter
            this.patrolStatusChartData.Selected = status;
        }
        //apply filter to results
        this.updateFilteredPatrols();
        //this.setResultsHeaderAllPatrolStatusCriteriaField();
        this.updateResultsHeader();
    };
    DashboardPatrol.prototype.getPatrolStatusChartSelection = function () {
        return this.patrolStatusChartData.Selected;
    };
    ///////////////////////////////////////////
    //Robot And Drones Chart Methods
    ///////////////////////////////////////////
    DashboardPatrol.prototype.robotDroneSelected = function (robotDroneData) {
        if (robotDroneData) {
            if (this.patrolRobotDroneFilter) {
                if (this.patrolRobotDroneFilter.ID === robotDroneData.ID) {
                    this.removePatrolFilter('RobotDrone');
                    return;
                }
            }
            this.patrolRobotDroneFilter = robotDroneData;
            //this.setResultsHeaderRobotDroneCriteriaField();
            this.updateFilteredPatrols();
            this.updateResultsHeader();
            this.changeDetectorRef.markForCheck();
        }
        else {
            this.removePatrolFilter('RobotDrone');
        }
    };
    ///////////////////////////////////////////
    //Alarms By Patrols Chart Methods
    ///////////////////////////////////////////
    DashboardPatrol.prototype.setPatrolAlarmsChartData = function () {
        var ap = 0;
        var index = 0;
        var chartData = [];
        var chartLabel = [];
        //get all of the alarmIDs from the patrols
        //let alarms: Alarm[] = this.getAllFilteredPatrolsAlarms();
        var alarms = this.getAllPatrolsAlarms();
        for (var i = 0; i < 4; ++i) {
            index = i + 1;
            ap = alarms.filter(function (a) { return a.Priority === index; }).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
        }
        this.patrolAlarmsChartData = chartData;
        this.patrolAlarmsChartLabels = chartLabel;
        this.patrolAlarmsChartTotal = alarms.length;
    };
    DashboardPatrol.prototype.updatePatrolAlarmChartData = function () {
        var chart = this.chartComponent.chart;
        var data = chart.data;
        var datasets = data.datasets;
        var labels = data.labels;
        var ap = 0;
        var index = 0;
        var alarms = this.getAllPatrolsAlarms();
        for (var i = 0; i < datasets[0].data.length; ++i) {
            index = i + 1;
            ap = alarms.filter(function (a) { return a.Priority === index; }).length;
            datasets[0].data[i] = ap;
            labels[i] = this.dashboardAlarmService.getAlarmPriorityDefn(index.toString()) + " (P" + index.toString() + ") - " + ap.toString();
            this.showPatrolAlarmsLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[i];
        }
        chart.update();
        this.patrolAlarmsChartTotal = alarms.length;
        this.patrolAlarmsChartLegendData = this.chartComponent.chart.generateLegend();
        //this.changeDetectorRef.detectChanges();
    };
    DashboardPatrol.prototype.getPatrolAlarmsLegendCallback = function (chart) {
        var legendData = [];
        if (chart) {
            var data = chart.data;
            var datasets = data.datasets;
            var labels = data.labels;
            if (datasets.length) {
                var empty = false;
                for (var i = 0; i < datasets[0].data.length; ++i) {
                    if (datasets[0].data[i] === 0)
                        empty = true;
                    else
                        empty = false;
                    legendData[i] = {
                        DataValue: datasets[0].data[i],
                        Priority: "P" + (i + 1).toString(),
                        Empty: empty,
                        Label: labels[i],
                        LegendItemIndex: i
                    };
                }
            }
        }
        return legendData;
    };
    DashboardPatrol.prototype.chartClicked = function (e) {
        console.log(e);
    };
    DashboardPatrol.prototype.patrolAlarmsLegendClicked = function (e, dataValue, legendItemID) {
        if (dataValue >= 0) {
            var chart = this.chartComponent.chart;
            var index = this.chartComponent.chart.legend.legendItems[legendItemID].index;
            if (chart.data.datasets[0].data[index] !== 0) {
                var selectedPriorityFilter = (this.patrolAlarmPriorityFilter === 0) ? index : (this.patrolAlarmPriorityFilter - 1);
                if (index !== selectedPriorityFilter) {
                    //they picked a different item
                    //hide the one already selected
                    this.showPatrolAlarmsLegendData[selectedPriorityFilter] = 'hide';
                    chart.data.datasets[0].backgroundColor[selectedPriorityFilter] = this.patrolAlarmsChartColorsOpacity[0].backgroundColor[selectedPriorityFilter];
                    //show the new one that was selected
                    this.showPatrolAlarmsLegendData[index] = 'show';
                    chart.data.datasets[0].backgroundColor[index] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[index];
                }
                else {
                    for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
                        if (i !== index) {
                            if (this.showPatrolAlarmsLegendData[i] === 'hide') {
                                this.showPatrolAlarmsLegendData[i] = 'show';
                                chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[i];
                            }
                            else {
                                this.showPatrolAlarmsLegendData[i] = 'hide';
                                chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsOpacity[0].backgroundColor[i];
                            }
                        }
                    }
                }
                if ((this.patrolAlarmPriorityFilter) && (this.patrolAlarmPriorityFilter === (index + 1))) {
                    //the user selected to turn off the priority filter
                    this.patrolAlarmPriorityFilter = 0;
                    this.patrolAlarmsChartSelectedDataValue = -1;
                    this.patrolAlarmsChartSelectedLegendItemID = '-1';
                }
                else {
                    //the user selected  to turn on the priority filter
                    this.patrolAlarmPriorityFilter = index + 1;
                    this.patrolAlarmsChartSelectedDataValue = dataValue;
                    this.patrolAlarmsChartSelectedLegendItemID = legendItemID;
                }
                this.updateFilteredPatrols();
                //this.setResultsHeaderAlarmPriorityCriteriaField();
                this.updateResultsHeader();
                chart.update();
            }
        }
    };
    DashboardPatrol.prototype.getPatrolAlarmsLegendViewState = function (legendItemID) {
        if (!this.showPatrolAlarmsLegendData[legendItemID])
            this.showPatrolAlarmsLegendData[legendItemID] = 'show';
        return this.showPatrolAlarmsLegendData[legendItemID];
    };
    //////////////////////////////////////////////
    //Export Methods
    //////////////////////////////////////////////
    DashboardPatrol.prototype.exportPDF = function () {
        var _this = this;
        this.exporting = true;
        this.changeDetectorRef.markForCheck();
        var criteria = {};
        criteria["Priority"] = this.dashboardPatrolService.patrolFilterAlarmPrioritySelection;
        criteria["Operator"] = this.dashboardPatrolService.patrolFilterOperatorSelection;
        criteria["DisplayName"] = this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection;
        criteria["Status"] = this.dashboardPatrolService.patrolFilterStatusSelection;
        criteria["Robot"] = this.dashboardPatrolService.patrolFilterRobotSelection;
        var startTime;
        var endTime;
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            startTime = moment().valueOf();
            endTime = 0;
        }
        else {
            startTime = this.dashboardAlarmService.exportStartDateTime;
            endTime = this.dashboardAlarmService.exportEndDateTime;
        }
        var reportData = {
            //Alarms: null,
            //Patrols: null,
            //Platforms: null,
            PatrolAlarmIDs: this.getAllPatrolsAlarmIDs(),
            SelectedLocationIDs: this.dashboardService.getSelectedLocationIDs(),
            SelectedPriorities: [this.patrolAlarmPriorityFilter],
            SelectedRobot: (this.patrolRobotDroneFilter !== null) ? this.patrolRobotDroneFilter.ID : null,
            //SelectedLOI: null,
            SelectedTimeframe: this.dashboardService.getSelectedTimeframe().toString(),
            ExportStartTime: startTime,
            ExportEndTime: endTime,
            Criteria: criteria,
            CurrentUser: null,
            User: null,
            URL: null,
            ReportType: 'Patrol',
            WebProxyHostname: null,
            WebProxyPortNumber: 0,
            WebProxyUsername: null,
            WebProxyPassword: null,
            WebProxyType: null
        };
        this.httpService.postPdf("/Report/URLToPDF/", reportData, null, true).then(function (pdfBytes) {
            if (pdfBytes) {
                console.log('PDF File has been downloaded');
                var pdfFileUrl = URL.createObjectURL(pdfBytes, { oneTimeOnly: true });
                _this.exporting = false;
                _this.changeDetectorRef.markForCheck();
                //download it
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style.display = "none";
                a.href = pdfFileUrl;
                a.download = "SmartCommandPatrolReport.pdf";
                a.click();
                document.body.removeChild(a);
                //revoke the url
                window.URL.revokeObjectURL(pdfFileUrl);
            }
        });
    };
    //////////////////////////////////////////////
    //Results Header Methods
    //////////////////////////////////////////////
    DashboardPatrol.prototype.updateResultsHeader = function () {
        //this is invoked on startup
        //set the headerFilteredCountField field - filter criteria from the patrol section in the filter panel
        this.setResultsHeaderFilteredCriteriaField();
        //set the patrolAllPatrolStatusCountField field
        this.setResultsHeaderAllPatrolStatusCriteriaField();
        ////set the patrolActiveFilter and patrolTimeframeFilter filters
        this.setResultsHeaderActiveOrTimeframeField();
        ////set the patrolRobotAndDroneField field
        this.setResultsHeaderRobotDroneCriteriaField();
        ////set the patrolAlarmPriorityField field
        this.setResultsHeaderAlarmPriorityCriteriaField();
    };
    DashboardPatrol.prototype.setResultsHeaderFilteredCriteriaField = function () {
        if ((this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            var count = this.masterPatrols.length; //templates???
            this.headerFilteredCriteriaField = " " + count.toString();
        }
        else
            this.headerFilteredCriteriaField = "";
    };
    DashboardPatrol.prototype.setResultsHeaderAllPatrolStatusCriteriaField = function () {
        if (this.patrolStatusChartData.Selected !== PatrolStatus.None) {
            var count = 0;
            var status_1 = '';
            switch (this.patrolStatusChartData.Selected) {
                case PatrolStatus.Successful:
                    count = this.patrolStatusChartData.Successful;
                    status_1 = 'Successful';
                    break;
                case PatrolStatus.Warning:
                    count = this.patrolStatusChartData.Warning;
                    status_1 = 'Warning';
                    break;
                case PatrolStatus.Incomplete:
                    count = this.patrolStatusChartData.Incomplete;
                    status_1 = 'Incomplete';
                    break;
                case PatrolStatus.Critical:
                    count = this.patrolStatusChartData.Critical;
                    status_1 = 'Critical';
                    break;
                default:
                    break;
            }
            if (this.patrolResultCount < count)
                count = this.patrolResultCount;
            //this.headerAllPatrolStatusCriteriaField = " (" + count.toString() + ") " + status;
            this.headerAllPatrolStatusCriteriaField = " " + status_1;
        }
        else if ((this.dashboardPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPatrolService.patrolFilterOperatorSelection) && (this.dashboardPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPatrolService.patrolFilterRobotSelection) && (this.dashboardPatrolService.patrolFilterRobotSelection !== 'All'))) {
            this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerAllPatrolStatusCriteriaField = " All ";
    };
    DashboardPatrol.prototype.setResultsHeaderActiveOrTimeframeField = function () {
        var timeframe = this.dashboardService.getSelectedTimeframe();
        if (timeframe === FilterTimeframe.Current) {
            this.headerActiveCriteriaField = "Active";
            this.headerTimeframeCriteriaField = "";
        }
        else {
            this.headerActiveCriteriaField = '';
            if (timeframe === FilterTimeframe.Custom) {
                if ((this.dashboardService.customStartDateTime) && (this.dashboardService.customEndDateTime)) {
                    this.headerTimeframeCriteriaField = "between " + this.formatDate(this.dashboardService.customStartDateTime) + " and " + this.formatDate(this.dashboardService.customEndDateTime);
                }
                else if (this.dashboardService.customStartDateTime) {
                    this.headerTimeframeCriteriaField = "after " + this.formatDate(this.dashboardService.customStartDateTime);
                }
                else if (this.dashboardService.customEndDateTime) {
                    this.headerTimeframeCriteriaField = "before " + this.formatDate(this.dashboardService.customEndDateTime);
                }
            }
            else
                this.headerTimeframeCriteriaField = "over the " + this.dashboardService.getSelectedTimeframeString(timeframe);
        }
    };
    DashboardPatrol.prototype.setResultsHeaderRobotDroneCriteriaField = function () {
        if (this.patrolRobotDroneFilter) {
            this.headerRobotDroneCriteriaField = " for " + this.patrolRobotDroneFilter.DisplayName;
            if (this.headerAllPatrolStatusCriteriaField === " All ")
                this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerRobotDroneCriteriaField = "";
    };
    DashboardPatrol.prototype.setResultsHeaderAlarmPriorityCriteriaField = function () {
        if (this.patrolAlarmPriorityFilter > 0) {
            var count = 0;
            //get the alarm count for the filter patrols in the result list
            var filteredAlarms = this.getAllPatrolsAlarms();
            //if (this.headerAllPatrolStatusCriteriaField.includes('All'))
            //    count = filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length;
            //else if (this.patrolResoultCount < filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length)
            //    count = this.patrolResoultCount;
            //else
            //count = filteredAlarms.filter(a => a.Priority === this.patrolAlarmPriorityFilter).length;
            //this.headerAlarmPriorityCriteriaField = " with (" + count.toString() + ") " +
            //        "P" + this.patrolAlarmPriorityFilter.toString() + " Alarms";
            this.headerAlarmPriorityCriteriaField = " with " + "P" + this.patrolAlarmPriorityFilter.toString() + " Alarms";
            if (this.headerAllPatrolStatusCriteriaField === " All ")
                this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerAlarmPriorityCriteriaField = "";
    };
    DashboardPatrol.prototype.getResultTotalCount = function () {
        var countStr = '';
        if ((this.headerAllPatrolStatusCriteriaField !== '' && this.headerAllPatrolStatusCriteriaField !== ' All ') ||
            (this.headerRobotDroneCriteriaField !== '') ||
            (this.headerAlarmPriorityCriteriaField !== '')) {
            countStr = this.getFilteredPatrols().length.toString();
        }
        else
            countStr = this.headerFilteredCriteriaField;
        return countStr;
    };
    DashboardPatrol.prototype.removePatrolFilter = function (filter) {
        switch (filter) {
            case 'AllPatrolStatus':
                this.patrolStatusChartData.Selected = PatrolStatus.None;
                this.updateFilteredPatrols();
                //this.setResultsHeaderAllPatrolStatusCriteriaField();
                this.updateResultsHeader();
                break;
            case 'RobotDrone':
                this.patrolRobotDroneFilter = null;
                this.updateFilteredPatrols();
                //this.setResultsHeaderAllPatrolStatusCriteriaField();
                //this.setResultsHeaderRobotDroneCriteriaField();
                this.updateResultsHeader();
                break;
            case 'Alarm':
                this.patrolAlarmsLegendClicked('', this.patrolAlarmsChartSelectedDataValue, this.patrolAlarmsChartSelectedLegendItemID);
                break;
            default:
                break;
        }
        this.changeDetectorRef.markForCheck();
    };
    DashboardPatrol.prototype.showPatrolFilterCriteria = function () {
        this.dashboardService.showPatrolFilterCriteriaComponent();
    };
    DashboardPatrol.prototype.formatDate = function (date) {
        var dateStr = '';
        if (date) {
            var m = date.getMonth() + 1;
            var d = date.getDate();
            var y = date.getFullYear();
            dateStr = m + "/" + d + "/" + y;
        }
        return dateStr;
    };
    //////////////////////////////////////////////
    //Results Items Methods
    //////////////////////////////////////////////
    DashboardPatrol.prototype.updateFilteredPatrols = function () {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            var patrolInstances = Array.from(this.patrolInstanceMap.values());
            patrolInstances = this.patrolStatusPipe.transform(patrolInstances, this.patrolStatusChartData.Selected, this.patrolTemplates);
            if (this.patrolRobotDroneFilter) {
                var platformID = this.patrolRobotDroneFilter.ID;
                patrolInstances = this.patrolRobotDronePipe.transform(patrolInstances, platformID);
            }
            patrolInstances = this.patrolAlarmPriorityPipe.transform(patrolInstances, this.getAllPatrolsAlarms(), this.patrolAlarmPriorityFilter);
            this.filteredPatrolInstanceMap = new Map();
            for (var _i = 0, patrolInstances_1 = patrolInstances; _i < patrolInstances_1.length; _i++) {
                var pi = patrolInstances_1[_i];
                this.filteredPatrolInstanceMap.set(pi.TemplateId, pi);
            }
            this.patrolResultCount = patrolInstances.length;
        }
        else {
            this.historicalPatrols = this.patrolStatusPipe.transform(this.masterPatrols, this.patrolStatusChartData.Selected, this.patrolTemplates);
            if (this.patrolRobotDroneFilter) {
                var platformID = this.patrolRobotDroneFilter.ID;
                this.historicalPatrols = this.patrolRobotDronePipe.transform(this.historicalPatrols, platformID);
            }
            this.historicalPatrols = this.patrolAlarmPriorityPipe.transform(this.historicalPatrols, this.getAllPatrolsAlarms(), this.patrolAlarmPriorityFilter);
            this.patrolResultCount = this.historicalPatrols.length;
        }
    };
    DashboardPatrol.prototype.getPatrolStatusObj = function (patrol) {
        var patrolStatusObjs = [];
        if (patrol) {
            var patrolStatusObj = this.dashboardPatrolService.getPatrolStatusObj(patrol);
            if (patrolStatusObj)
                patrolStatusObjs.push(patrolStatusObj);
        }
        return patrolStatusObjs;
    };
    DashboardPatrol.prototype.getPatrolAlarmsPriority = function (patrolInstance) {
        var hPriority = 0;
        if (patrolInstance) {
            //let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance);
            var patrolAlarms = this.getPatrolAlarms(patrolInstance.id);
            if ((patrolAlarms) && (patrolAlarms.length > 0)) {
                if (patrolAlarms.filter(function (a) { return a.Priority === 1; }).length > 0)
                    hPriority = 1;
                else if ((patrolAlarms.filter(function (a) { return a.Priority === 2; }).length > 0) && (hPriority === 0))
                    hPriority = 2;
                else if ((patrolAlarms.filter(function (a) { return a.Priority === 3; }).length > 0) && (hPriority === 0))
                    hPriority = 3;
                else if ((patrolAlarms.filter(function (a) { return a.Priority === 4; }).length > 0) && (hPriority === 0))
                    hPriority = 4;
                else
                    hPriority = 0;
            }
        }
        return hPriority;
    };
    DashboardPatrol.prototype.getPatrolAlarmsPriorityArray = function (patrolInstance) {
        var hPriority = [];
        if (patrolInstance) {
            var hp = this.getPatrolAlarmsPriority(patrolInstance);
            hPriority.push(hp);
        }
        return hPriority;
    };
    DashboardPatrol.prototype.getPatrolAlarmsPriorityObjectArray = function (patrolInstance) {
        var alarmPriority = [];
        if (patrolInstance) {
            var ap = this.getPatrolAlarmsPriorityCount(patrolInstance);
            if (ap)
                alarmPriority.push(ap);
        }
        return alarmPriority;
    };
    DashboardPatrol.prototype.getPatrolAlarmsPriorityCount = function (patrolInstance) {
        var alarmCount;
        if (patrolInstance) {
            //let patrolAlarms: Alarm[] = this.getPatrolAlarms(patrolInstance);
            var patrolAlarms = this.getPatrolAlarms(patrolInstance.id);
            if ((patrolAlarms) && (patrolAlarms.length > 0)) {
                alarmCount = {
                    P1: patrolAlarms.filter(function (a) { return a.Priority === 1; }).length,
                    P2: patrolAlarms.filter(function (a) { return a.Priority === 2; }).length,
                    P3: patrolAlarms.filter(function (a) { return a.Priority === 3; }).length,
                    P4: patrolAlarms.filter(function (a) { return a.Priority === 4; }).length,
                    Total: patrolAlarms.length
                };
            }
        }
        return alarmCount;
    };
    //getPatrolAlarms(patrolInstance: PatrolInstance): Alarm[] {
    //    return this.dashboardPatrolService.getPatrolAlarms(patrolInstance);
    //}
    DashboardPatrol.prototype.getPatrolAlarmsCount = function (patrolInstance) {
        var count = 0;
        if ((patrolInstance) && (patrolInstance.AlarmIds)) {
            count = patrolInstance.AlarmIds.length;
        }
        return count;
    };
    DashboardPatrol.prototype.getPatrolSubmittedTime = function (submittedTime) {
        var result = this.dashboardPatrolService.convertPatrolTime(submittedTime);
        if (result) {
            var s = result.split("-");
            var r = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardPatrol.prototype.determineDisplayItems = function () {
        ////determine if the Robot and Drones columns should be shwown
        //if (this.resultsContentDivSize >= ResultsSize.Large) {
        //    this.showRobotDroneResultsColumn = true;
        //}
        //else if (this.resultsContentDivSize < ResultsSize.Large) {
        //    this.showRobotDroneResultsColumn = false;
        //}
        if (this.resultsContainerDivSize >= ResultsSize.Large) {
            this.showRobotDroneResultsColumn = true;
            this.showSubmittedTimeResultsColumn = true;
        }
        else if ((this.resultsContainerDivSize >= ResultsSize.Medium) && (this.resultsContainerDivSize < ResultsSize.Large)) {
            this.showRobotDroneResultsColumn = true;
            this.showSubmittedTimeResultsColumn = false;
        }
        else if ((this.resultsContainerDivSize > ResultsSize.Small) && (this.resultsContainerDivSize < ResultsSize.Medium)) {
            this.showRobotDroneResultsColumn = false;
            this.showSubmittedTimeResultsColumn = false;
        }
        else if (this.resultsContainerDivSize <= ResultsSize.Small) {
            this.showRobotDroneResultsColumn = false;
            this.showSubmittedTimeResultsColumn = false;
        }
        this.changeDetectorRef.markForCheck(); //detectChanges()
    };
    DashboardPatrol.prototype.selectPatrol = function (patrol) {
        if (patrol.selected) {
            this.dashboardPatrolService.deSelectPatrol(patrol, true);
        }
        else {
            if (this.dashboardPatrolService.selectedPatrol !== null)
                this.dashboardPatrolService.deSelectPatrol(this.dashboardPatrolService.selectedPatrol, true);
            var patrolAlarms = null;
            if (patrol.InstanceId) {
                patrolAlarms = this.getPatrolAlarms(patrol.InstanceId);
            }
            this.dashboardPatrolService.selectPatrol(patrol, patrolAlarms, true);
        }
        //this.changeDetectorRef.detectChanges();
    };
    __decorate([
        ViewChild('dbRobotDronePatrolSlider'),
        __metadata("design:type", DashboardSlider)
    ], DashboardPatrol.prototype, "dashboardRobotDronePatrolSlider", void 0);
    __decorate([
        ViewChild(BaseChartDirective),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrol.prototype, "chartComponent", void 0);
    __decorate([
        ViewChild('patrolAlarmsChart'),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrol.prototype, "patrolAlarmsChartComponents", void 0);
    __decorate([
        ViewChild('patrolStatusChart'),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrol.prototype, "patrolStatusChartComponents", void 0);
    __decorate([
        ViewChild('patrolReportResultsDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrol.prototype, "patrolResultsDiv", void 0);
    __decorate([
        ViewChild('patrolReportResultsContentDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrol.prototype, "patrolResultsContentDiv", void 0);
    __decorate([
        ViewChild('patrolReportResultsContainer'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrol.prototype, "patrolResultsContainer", void 0);
    __decorate([
        ViewChild('patrolReportResults'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrol.prototype, "patrolReportResults", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], DashboardPatrol.prototype, "searchterm", void 0);
    DashboardPatrol = __decorate([
        Component({
            selector: 'dashboard-patrol',
            templateUrl: 'dashboard-patrol.component.html',
            styleUrls: ['dashboard-patrol.component.css', 'dashboard.component.css'],
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
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            DashboardPlatformService,
            DashboardPatrolService,
            HttpService,
            PatrolStatusPipe,
            PatrolRobotDronePipe,
            PatrolAlarmPriorityPipe,
            ChangeDetectorRef,
            DomSanitizer,
            NgZone])
    ], DashboardPatrol);
    return DashboardPatrol;
}());
export { DashboardPatrol };
//# sourceMappingURL=dashboard-patrol.component.js.map