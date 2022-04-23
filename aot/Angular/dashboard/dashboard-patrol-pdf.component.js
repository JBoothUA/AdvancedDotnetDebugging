var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, ElementRef, NgZone, trigger, state, transition, style, animate, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FilterTimeframe, PatrolStatus } from './dashboard';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardPDFPatrolService } from './dashboard-pdf-patrol.service';
import { Alarm } from '../alarms/alarm.class';
import { PatrolInstance, PatrolStatusValues } from '../patrols/patrol.class';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
var ResultsSize;
(function (ResultsSize) {
    ResultsSize[ResultsSize["Small"] = 750] = "Small";
    ResultsSize[ResultsSize["Medium"] = 910] = "Medium";
    ResultsSize[ResultsSize["Large"] = 1010] = "Large";
    ResultsSize[ResultsSize["None"] = 0] = "None";
})(ResultsSize || (ResultsSize = {}));
var DashboardPatrolPDF = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardPatrolPDF(dashboardPDFPatrolService, patrolStatusPipe, patrolRobotDronePipe, patrolAlarmPriorityPipe, changeDetectorRef, sanitizer, ngZone) {
        this.dashboardPDFPatrolService = dashboardPDFPatrolService;
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
    }
    DashboardPatrolPDF.prototype.ngOnInit = function () {
        this.setPatrolStatusChartData();
        this.setPatrolAlarmsChartData();
        this.masterPatrols = this.dashboardPDFPatrolService.getPatrols();
        this.initPatrolInstanceMap();
        //reset quickfilters
        this.patrolRobotDroneFilter = null;
        this.patrolAlarmPriorityFilter = 0;
        this.patrolResultCount = 0;
        //get filtered data
        this.updateFilteredPatrols();
    };
    DashboardPatrolPDF.prototype.ngAfterViewInit = function () {
        //this.resultsContainerDivSize = this.patrolResultsContainer.nativeElement.clientWidth - 8;
        //this.patrolResultsContainer.nativeElement.scrollTop = 0;
        this.updateData();
    };
    DashboardPatrolPDF.prototype.expandedMoreOperatorViewState = function () {
        if (this.moreOperatorExpanded) {
            return 'out';
        }
        return 'in';
    };
    DashboardPatrolPDF.prototype.toggleExpandedMoreOperatorView = function () {
        event.stopPropagation();
        this.moreOperatorExpanded = !this.moreOperatorExpanded;
    };
    DashboardPatrolPDF.prototype.expandedResultsViewState = function (patrolInstanceID) {
        if (!this.expandedResult[patrolInstanceID])
            this.expandedResult[patrolInstanceID] = 'in';
        return this.expandedResult[patrolInstanceID];
    };
    DashboardPatrolPDF.prototype.toggleExpandedResultsView = function (patrolInstanceID) {
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
    DashboardPatrolPDF.prototype.getFilteredPatrols = function () {
        var patrols = [];
        if (this.dashboardPDFPatrolService.getSelectedTimeframe() === FilterTimeframe.Current) {
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
    DashboardPatrolPDF.prototype.getAllFilteredPatrolsAlarms = function () {
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
                        var alarm = this.dashboardPDFPatrolService.getFilteredAlarm(aID);
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
                                    var alarm = this.dashboardPDFPatrolService.getFilteredAlarm(aID);
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
                                        var alarm = this.dashboardPDFPatrolService.getFilteredAlarm(aID);
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
                this.dashboardPDFPatrolService.loadAlarmsByIds(alarmNotInService).then(function (alarms) {
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
    DashboardPatrolPDF.prototype.getAllPatrolsAlarms = function () {
        var patrolAlarms = [];
        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            this.patrolToAlarmsMap.forEach(function (alarm, index) {
                patrolAlarms = patrolAlarms.concat(alarm);
            });
        }
        return patrolAlarms;
    };
    DashboardPatrolPDF.prototype.getPatrolAlarms = function (patrolID) {
        var patrolAlarms = [];
        if (this.patrolToAlarmsMap && this.patrolToAlarmsMap.size > 0) {
            if (this.patrolToAlarmsMap.has(patrolID))
                patrolAlarms = this.patrolToAlarmsMap.get(patrolID);
        }
        return patrolAlarms;
    };
    ////////
    //Patrols Notification
    ///////
    DashboardPatrolPDF.prototype.initPatrolInstanceMap = function () {
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
    DashboardPatrolPDF.prototype.addPatrolTemplateToMap = function (patrolTemplate) {
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
    DashboardPatrolPDF.prototype.updatePatrolInstanceInMap = function (patrolInstance) {
        if (patrolInstance) {
            //swap fake patrol template for real patrol instance
            this.patrolInstanceMap.set(patrolInstance.TemplateId, patrolInstance);
        }
    };
    DashboardPatrolPDF.prototype.clearPatrolInstanceMap = function () {
        if (this.patrolInstanceMap)
            this.patrolInstanceMap.clear();
        else
            this.patrolInstanceMap = new Map();
    };
    DashboardPatrolPDF.prototype.updateData = function () {
        //get the newly queried patrol data
        //this.masterPatrols = this.dashboardPatrolService.getPatrols();
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
        //this.determineDisplayItems();
        //TODO - select the previously selected patrol
        //hide the loading image
        //if (this.dashboardPDFService.getSelectedTimeframe() === FilterTimeframe.Current)
        //    setTimeout(() => { this.dashboardPDFService.onTimeframeChangeComplete.next(); }, 1000);
        //else
        //    this.dashboardPDFService.onTimeframeChangeComplete.next();
        //detect changes
        this.changeDetectorRef.detectChanges();
        console.log("before evoPdfConverter");
        if (typeof evoPdfConverter != "undefined") {
            console.log("evoPdfConverter is defined");
            evoPdfConverter.startConversion();
        }
    };
    ///////////////////////////////////////////
    //Patrol Status Chart Methods
    ///////////////////////////////////////////
    DashboardPatrolPDF.prototype.setPatrolStatusChartData = function () {
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
    DashboardPatrolPDF.prototype.updatePatrolStatusChartData = function () {
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
                var patrolStatusObj = this.dashboardPDFPatrolService.getPatrolStatusObj(patrol);
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
    DashboardPatrolPDF.prototype.patrolStatusChartClicked = function (status) {
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
    DashboardPatrolPDF.prototype.getPatrolStatusChartSelection = function () {
        return this.patrolStatusChartData.Selected;
    };
    ///////////////////////////////////////////
    //Robot And Drones Chart Methods
    ///////////////////////////////////////////
    //robotDroneSelected(robotDroneData: RobotAndDrone): void {
    //    if (robotDroneData) {
    //        if (this.patrolRobotDroneFilter) {
    //            if (this.patrolRobotDroneFilter.ID === robotDroneData.ID) {
    //                this.removePatrolFilter('RobotDrone');
    //                return;
    //            }
    //        }
    //        this.patrolRobotDroneFilter = robotDroneData;
    //        //this.setResultsHeaderRobotDroneCriteriaField();
    //        this.updateFilteredPatrols();
    //        this.updateResultsHeader();
    //        this.changeDetectorRef.markForCheck();
    //    } else {
    //        this.removePatrolFilter('RobotDrone');
    //    }
    //}
    ///////////////////////////////////////////
    //Alarms By Patrols Chart Methods
    ///////////////////////////////////////////
    DashboardPatrolPDF.prototype.setPatrolAlarmsChartData = function () {
        var ap = 0;
        var index = 0;
        var chartData = [];
        var chartLabel = [];
        var alarms = this.getAllPatrolsAlarms();
        for (var i = 0; i < 4; ++i) {
            index = i + 1;
            ap = alarms.filter(function (a) { return a.Priority === index; }).length;
            chartData[i] = ap;
            chartLabel[i] = this.dashboardPDFPatrolService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
        }
        this.patrolAlarmsChartData = chartData;
        this.patrolAlarmsChartLabels = chartLabel;
        this.patrolAlarmsChartTotal = alarms.length;
    };
    DashboardPatrolPDF.prototype.updatePatrolAlarmChartData = function () {
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
            labels[i] = this.dashboardPDFPatrolService.getAlarmPriorityDefn(index.toString()) +
                " (P" + index.toString() + ") - " + ap.toString();
            this.showPatrolAlarmsLegendData[i] = 'show';
            chart.data.datasets[0].backgroundColor[i] = this.patrolAlarmsChartColorsDefault[0].backgroundColor[i];
        }
        chart.update();
        this.patrolAlarmsChartTotal = alarms.length;
        this.patrolAlarmsChartLegendData = this.chartComponent.chart.generateLegend();
        //this.changeDetectorRef.detectChanges();
    };
    DashboardPatrolPDF.prototype.getPatrolAlarmsLegendCallback = function (chart) {
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
    DashboardPatrolPDF.prototype.chartClicked = function (e) {
        console.log(e);
    };
    DashboardPatrolPDF.prototype.patrolAlarmsLegendClicked = function (e, dataValue, legendItemID) {
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
    DashboardPatrolPDF.prototype.getPatrolAlarmsLegendViewState = function (legendItemID) {
        if (!this.showPatrolAlarmsLegendData[legendItemID])
            this.showPatrolAlarmsLegendData[legendItemID] = 'show';
        return this.showPatrolAlarmsLegendData[legendItemID];
    };
    //////////////////////////////////////////////
    //Results Header Methods
    //////////////////////////////////////////////
    DashboardPatrolPDF.prototype.updateResultsHeader = function () {
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
    DashboardPatrolPDF.prototype.setResultsHeaderFilteredCriteriaField = function () {
        if ((this.dashboardPDFPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPDFPatrolService.patrolFilterOperatorSelection) && (this.dashboardPDFPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPDFPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPDFPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPDFPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPDFPatrolService.patrolFilterRobotSelection) && (this.dashboardPDFPatrolService.patrolFilterRobotSelection !== 'All'))) {
            var count = this.masterPatrols.length; //templates???
            this.headerFilteredCriteriaField = " " + count.toString();
        }
        else
            this.headerFilteredCriteriaField = "";
    };
    DashboardPatrolPDF.prototype.setResultsHeaderAllPatrolStatusCriteriaField = function () {
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
        else if ((this.dashboardPDFPatrolService.patrolFilterAlarmPrioritySelection !== 0) ||
            ((this.dashboardPDFPatrolService.patrolFilterOperatorSelection) && (this.dashboardPDFPatrolService.patrolFilterOperatorSelection !== 'All')) ||
            ((this.dashboardPDFPatrolService.patrolFilterPatrolDisplayNameSelection) && (this.dashboardPDFPatrolService.patrolFilterPatrolDisplayNameSelection !== 'All')) ||
            (this.dashboardPDFPatrolService.patrolFilterStatusSelection !== 4) ||
            ((this.dashboardPDFPatrolService.patrolFilterRobotSelection) && (this.dashboardPDFPatrolService.patrolFilterRobotSelection !== 'All'))) {
            this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerAllPatrolStatusCriteriaField = " All ";
    };
    DashboardPatrolPDF.prototype.setResultsHeaderActiveOrTimeframeField = function () {
        var timeframe = this.dashboardPDFPatrolService.getSelectedTimeframe();
        if (timeframe === FilterTimeframe.Current) {
            this.headerActiveCriteriaField = "Active";
            this.headerTimeframeCriteriaField = "";
        }
        else {
            this.headerActiveCriteriaField = '';
            if (timeframe === FilterTimeframe.Custom) {
                if ((this.dashboardPDFPatrolService.customStartDateTime) && (this.dashboardPDFPatrolService.customEndDateTime)) {
                    this.headerTimeframeCriteriaField = "between " + this.formatDate(this.dashboardPDFPatrolService.customStartDateTime) + " and " + this.formatDate(this.dashboardPDFPatrolService.customEndDateTime);
                }
                else if (this.dashboardPDFPatrolService.customStartDateTime) {
                    this.headerTimeframeCriteriaField = "after " + this.formatDate(this.dashboardPDFPatrolService.customStartDateTime);
                }
                else if (this.dashboardPDFPatrolService.customEndDateTime) {
                    this.headerTimeframeCriteriaField = "before " + this.formatDate(this.dashboardPDFPatrolService.customEndDateTime);
                }
            }
            else
                this.headerTimeframeCriteriaField = "over the " + this.dashboardPDFPatrolService.getSelectedTimeframeString(timeframe);
        }
    };
    DashboardPatrolPDF.prototype.setResultsHeaderRobotDroneCriteriaField = function () {
        if (this.patrolRobotDroneFilter) {
            this.headerRobotDroneCriteriaField = " for " + this.patrolRobotDroneFilter.DisplayName;
            if (this.headerAllPatrolStatusCriteriaField === " All ")
                this.headerAllPatrolStatusCriteriaField = "";
        }
        else
            this.headerRobotDroneCriteriaField = "";
    };
    DashboardPatrolPDF.prototype.setResultsHeaderAlarmPriorityCriteriaField = function () {
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
    DashboardPatrolPDF.prototype.getResultTotalCount = function () {
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
    DashboardPatrolPDF.prototype.getTimeframeRangeString = function () {
        var rangeStr = '';
        var timeframe = this.dashboardPDFPatrolService.getSelectedTimeframe();
        var startTime = (this.dashboardPDFPatrolService.customStartDateTime) ? this.dashboardPDFPatrolService.customStartDateTime.toLocaleTimeString() : null;
        var endTime = (this.dashboardPDFPatrolService.customEndDateTime) ? this.dashboardPDFPatrolService.customEndDateTime.toLocaleTimeString() : null;
        switch (timeframe) {
            case FilterTimeframe.Current:
                rangeStr = startTime + ", " + this.formatDate(this.dashboardPDFPatrolService.customStartDateTime);
                break;
            case FilterTimeframe.EightHours:
            case FilterTimeframe.TwelveHours:
            case FilterTimeframe.TwentyFourHours:
            case FilterTimeframe.LastWeek:
                rangeStr = startTime + " - " + endTime + ", " + this.formatDate(this.dashboardPDFPatrolService.customStartDateTime);
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardPDFPatrolService.customStartDateTime) && (this.dashboardPDFPatrolService.customEndDateTime)) {
                    rangeStr = this.formatDate(this.dashboardPDFPatrolService.customStartDateTime) + " " + startTime + " - " + this.formatDate(this.dashboardPDFPatrolService.customEndDateTime) + " " + endTime;
                }
                else if (this.dashboardPDFPatrolService.customStartDateTime) {
                    //rangeStr = "After " + startTime + ", " + this.formatDate(this.dashboardPDFService.customStartDateTime);
                    //end time is not set to it is a range of startime to current time
                    //set end time to current time
                    var custDate = new Date();
                    endTime = custDate.toLocaleTimeString();
                    rangeStr = this.formatDate(this.dashboardPDFPatrolService.customStartDateTime) + " " + startTime + " - " + this.formatDate(custDate) + " " + endTime;
                }
                else if (this.dashboardPDFPatrolService.customEndDateTime) {
                    rangeStr = "Before " + endTime + ", " + this.formatDate(this.dashboardPDFPatrolService.customEndDateTime);
                }
                break;
            default:
                rangeStr = "";
                break;
        }
        return rangeStr;
    };
    DashboardPatrolPDF.prototype.formatDate = function (date) {
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
    DashboardPatrolPDF.prototype.updateFilteredPatrols = function () {
        if (this.dashboardPDFPatrolService.getSelectedTimeframe() === FilterTimeframe.Current) {
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
    DashboardPatrolPDF.prototype.getPatrolStatusObj = function (patrol) {
        var patrolStatusObjs = [];
        if (patrol) {
            var patrolStatusObj = this.dashboardPDFPatrolService.getPatrolStatusObj(patrol);
            if (patrolStatusObj)
                patrolStatusObjs.push(patrolStatusObj);
        }
        return patrolStatusObjs;
    };
    DashboardPatrolPDF.prototype.getPatrolAlarmsPriority = function (patrolInstance) {
        var hPriority = 0;
        if (patrolInstance) {
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
    DashboardPatrolPDF.prototype.getPatrolAlarmsPriorityArray = function (patrolInstance) {
        var hPriority = [];
        if (patrolInstance) {
            var hp = this.getPatrolAlarmsPriority(patrolInstance);
            hPriority.push(hp);
        }
        return hPriority;
    };
    DashboardPatrolPDF.prototype.getPatrolAlarmsPriorityObjectArray = function (patrolInstance) {
        var alarmPriority = [];
        if (patrolInstance) {
            var ap = this.getPatrolAlarmsPriorityCount(patrolInstance);
            if (ap)
                alarmPriority.push(ap);
        }
        return alarmPriority;
    };
    DashboardPatrolPDF.prototype.getPatrolAlarmsPriorityCount = function (patrolInstance) {
        var alarmCount;
        if (patrolInstance) {
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
    DashboardPatrolPDF.prototype.getPatrolAlarmsCount = function (patrolInstance) {
        var count = 0;
        if ((patrolInstance) && (patrolInstance.AlarmIds)) {
            count = patrolInstance.AlarmIds.length;
        }
        return count;
    };
    DashboardPatrolPDF.prototype.getPatrolSubmittedTime = function (submittedTime) {
        var result = this.dashboardPDFPatrolService.convertPatrolTime(submittedTime);
        if (result) {
            var s = result.split("-");
            var r = "<span style='font-size: 16px; position: relative;float: left;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; position: relative;float: left;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    __decorate([
        ViewChild(BaseChartDirective),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrolPDF.prototype, "chartComponent", void 0);
    __decorate([
        ViewChild('patrolAlarmsChart'),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrolPDF.prototype, "patrolAlarmsChartComponents", void 0);
    __decorate([
        ViewChild('patrolStatusChart'),
        __metadata("design:type", BaseChartDirective)
    ], DashboardPatrolPDF.prototype, "patrolStatusChartComponents", void 0);
    __decorate([
        ViewChild('patrolReportResultsDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrolPDF.prototype, "patrolResultsDiv", void 0);
    __decorate([
        ViewChild('patrolReportResultsContentDiv'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrolPDF.prototype, "patrolResultsContentDiv", void 0);
    __decorate([
        ViewChild('patrolReportResultsContainer'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrolPDF.prototype, "patrolResultsContainer", void 0);
    __decorate([
        ViewChild('patrolReportResults'),
        __metadata("design:type", ElementRef)
    ], DashboardPatrolPDF.prototype, "patrolReportResults", void 0);
    DashboardPatrolPDF = __decorate([
        Component({
            selector: 'dashboard-patrol-pdf',
            templateUrl: 'dashboard-patrol-pdf.component.html',
            styleUrls: ['dashboard-patrol-pdf.component.css', 'dashboard.component.css'],
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
        __metadata("design:paramtypes", [DashboardPDFPatrolService,
            PatrolStatusPipe,
            PatrolRobotDronePipe,
            PatrolAlarmPriorityPipe,
            ChangeDetectorRef,
            DomSanitizer,
            NgZone])
    ], DashboardPatrolPDF);
    return DashboardPatrolPDF;
}());
export { DashboardPatrolPDF };
//# sourceMappingURL=dashboard-patrol-pdf.component.js.map