var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import * as moment from 'moment';
import { AlarmService } from '../alarms/alarm.service';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolStatusValues, PatrolInstance, AreaType } from '../patrols/patrol.class';
import { PointStatusValues } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';
import { FilterTimeframe, PatrolStatus } from './dashboard';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolDisplayNamePipe } from './patrol-displayname.pipe';
import { PatrolOperatorPipe } from './patrol-operator.pipe';
import { HubService } from '../shared/hub.service';
var DashboardPatrolService = /** @class */ (function (_super) {
    __extends(DashboardPatrolService, _super);
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function DashboardPatrolService(alarmService, dashboardService, dashboardAlarmService, dashboardPlatformService, patrolService, locationFilterPipe, httpService, userService, locationFilterService, patrolAlarmPriorityPipe, patrolStatusPipe, patrolRobotDronePipe, patrolDisplayNamePipe, patrolOperatorPipe, hubService) {
        var _this = _super.call(this, httpService, userService, locationFilterService, hubService) || this;
        _this.alarmService = alarmService;
        _this.dashboardService = dashboardService;
        _this.dashboardAlarmService = dashboardAlarmService;
        _this.dashboardPlatformService = dashboardPlatformService;
        _this.patrolService = patrolService;
        _this.locationFilterPipe = locationFilterPipe;
        _this.httpService = httpService;
        _this.userService = userService;
        _this.locationFilterService = locationFilterService;
        _this.patrolAlarmPriorityPipe = patrolAlarmPriorityPipe;
        _this.patrolStatusPipe = patrolStatusPipe;
        _this.patrolRobotDronePipe = patrolRobotDronePipe;
        _this.patrolDisplayNamePipe = patrolDisplayNamePipe;
        _this.patrolOperatorPipe = patrolOperatorPipe;
        _this.hubService = hubService;
        _this.patrolInstances = []; //current patrol instances in the system
        _this.patrolTemplates = [];
        _this.patrolRangeApiBaseUrl = '/patrols/range';
        _this.selectedPatrolAlarms = [];
        //filter panel criteria
        _this.patrolFilterAlarmPrioritySelection = 0;
        _this.patrolFilterOperatorSelection = 'All';
        _this.patrolFilterPatrolDisplayNameSelection = 'All';
        _this.patrolFilterStatusSelection = 4;
        _this.patrolFilterRobotSelection = 'All';
        _this.patrolFilterCriteriaTotalCount = 0;
        _this.onPatrolsLoaded = new Subject();
        _this.onNewPatrolInstance = new Subject();
        _this.onUpdatePatrolInstance = new Subject();
        _this.onCompletededPatrolInstance = new Subject();
        _this.onPatrolTemplatesLoaded = new Subject();
        _this.onUpdatePatrolTemplate = new Subject();
        _this.onPatrolTemplateDeleted = new Subject();
        _this.onRobotDroneSelected = new Subject();
        _this.onUpdatePatrolData = new Subject();
        _this.onFilterCriteriaChanged = new Subject();
        // Subscribe to get patrol instance notifications
        _this.patrolService.onPatrolInstancesLoaded
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.setPatrols(); }
        });
        _this.patrolService.onNewInstance
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleNewPatrol(patrol); }
        });
        _this.patrolService.onUpsertInstance
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleUpdatedPatrol(patrol); }
        });
        _this.patrolService.onPatrolInstanceComplete
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.handleCompletedPatrol(patrol); }
        });
        // Subscribe to get patrol template notifications
        _this.patrolService.onPatrolTemplatesLoaded
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.setPatrolTemplates(); }
        });
        _this.patrolService.onUpsertTemplate
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (template) { return _this.handleUpdatedTemplate(template); }
        });
        _this.patrolService.onPatrolTemplateDeleted
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (templateID) { return _this.handleTemplateDeleted(templateID); }
        });
        //subscribe to get location changes
        _this.dashboardService.locationsChanged
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.handleLocationChanged(); }
        });
        //subscribe to get timeframe changes
        _this.dashboardService.onTimeframeChange
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.updatePatrolsByTimeframe(); }
        });
        return _this;
        //TSR - debugging
        //this.setPatrols();
        //this.setPatrolTemplates();
    }
    DashboardPatrolService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    DashboardPatrolService.prototype.updatePatrolsByTimeframe = function () {
        var _this = this;
        var startTime;
        var endTime;
        var url;
        //this.timeframeUpdate.next();
        switch (this.dashboardService.getSelectedTimeframe()) {
            case FilterTimeframe.Current:
                if (this.patrolService.patrolInstances)
                    this.patrolInstances = this.patrolService.patrolInstances;
                else
                    this.patrolInstances = [];
                this.exportStartDateTime = 0;
                this.exportEndDateTime = 0;
                this.clearPatrolFilters(false);
                this.onUpdatePatrolData.next();
                console.log('Current Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
                break;
            case FilterTimeframe.EightHours:
                //this is local time for now
                startTime = this.dashboardService.getTimeFrameStartTime(8, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyPatrols) {
                    _this.patrolInstances = [];
                    for (var _i = 0, historyPatrols_1 = historyPatrols; _i < historyPatrols_1.length; _i++) {
                        var patrol = historyPatrols_1[_i];
                        _this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    _this.clearPatrolFilters(false);
                    _this.onUpdatePatrolData.next();
                    console.log('Last 8 Hours Patrols (' + _this.patrolInstances.length + ')', _this.patrolInstances);
                });
                break;
            case FilterTimeframe.TwelveHours:
                startTime = this.dashboardService.getTimeFrameStartTime(12, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyPatrols) {
                    _this.patrolInstances = [];
                    for (var _i = 0, historyPatrols_2 = historyPatrols; _i < historyPatrols_2.length; _i++) {
                        var patrol = historyPatrols_2[_i];
                        _this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    _this.clearPatrolFilters(false);
                    _this.onUpdatePatrolData.next();
                    console.log('Last 12 Hours Patrols (' + _this.patrolInstances.length + ')', _this.patrolInstances);
                });
                break;
            case FilterTimeframe.TwentyFourHours:
                startTime = this.dashboardService.getTimeFrameStartTime(24, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyPatrols) {
                    _this.patrolInstances = [];
                    for (var _i = 0, historyPatrols_3 = historyPatrols; _i < historyPatrols_3.length; _i++) {
                        var patrol = historyPatrols_3[_i];
                        _this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    _this.clearPatrolFilters(false);
                    _this.onUpdatePatrolData.next();
                    console.log('Last 24 Hours Patrols (' + _this.patrolInstances.length + ')', _this.patrolInstances);
                });
                break;
            case FilterTimeframe.LastWeek:
                startTime = this.dashboardService.getTimeFrameStartTime(1, 'weeks');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyPatrols) {
                    _this.patrolInstances = [];
                    for (var _i = 0, historyPatrols_4 = historyPatrols; _i < historyPatrols_4.length; _i++) {
                        var patrol = historyPatrols_4[_i];
                        _this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    _this.clearPatrolFilters(false);
                    _this.onUpdatePatrolData.next();
                    console.log('Last Week Patrols (' + _this.patrolInstances.length + ')', _this.patrolInstances);
                });
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime)) {
                    var startTimeStr = '';
                    var endTimeStr = '';
                    this.exportStartDateTime = 0;
                    this.exportEndDateTime = 0;
                    if (this.dashboardService.customStartDateTime) {
                        this.exportStartDateTime = moment.utc(this.dashboardService.customStartDateTime).valueOf();
                        startTimeStr = moment.utc(this.dashboardService.customStartDateTime).toJSON();
                    }
                    if (this.dashboardService.customEndDateTime) {
                        this.exportEndDateTime = moment.utc(this.dashboardService.customEndDateTime).valueOf();
                        endTimeStr = moment.utc(this.dashboardService.customEndDateTime).toJSON();
                    }
                    url = this.patrolRangeApiBaseUrl + '?startDate=' + startTimeStr + '&endDate=' + endTimeStr;
                    this.httpService.get(url).then(function (historyPatrols) {
                        _this.patrolInstances = [];
                        for (var _i = 0, historyPatrols_5 = historyPatrols; _i < historyPatrols_5.length; _i++) {
                            var patrol = historyPatrols_5[_i];
                            _this.patrolInstances.push(new PatrolInstance(patrol));
                        }
                        _this.clearPatrolFilters(false);
                        _this.onUpdatePatrolData.next();
                        console.log('Custom Date Range Patrols (' + _this.patrolInstances.length + ')', _this.patrolInstances);
                    });
                }
                else {
                    this.patrolInstances = [];
                    this.clearPatrolFilters(false);
                    this.onUpdatePatrolData.next();
                }
                break;
            default:
                this.patrolInstances = [];
                this.clearPatrolFilters(false);
                this.onUpdatePatrolData.next();
                break;
        }
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    //Patrols
    DashboardPatrolService.prototype.setPatrols = function () {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolInstances = this.patrolService.patrolInstances;
            //this.patrolInstances = this.getPatrolTestData(); //hard coded test data for debugging
            this.onPatrolsLoaded.next();
        }
        this.dashboardService.patrolDataLoaded = true;
    };
    DashboardPatrolService.prototype.handleNewPatrol = function (patrol) {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onNewPatrolInstance.next(patrol);
            }
        }
    };
    DashboardPatrolService.prototype.handleUpdatedPatrol = function (patrol) {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onUpdatePatrolInstance.next(patrol);
            }
        }
    };
    DashboardPatrolService.prototype.handleCompletedPatrol = function (patrol) {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onCompletededPatrolInstance.next(patrol);
            }
        }
    };
    //Patrol Templates
    DashboardPatrolService.prototype.setPatrolTemplates = function () {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolTemplates = this.patrolService.patrolTemplates;
            this.onPatrolTemplatesLoaded.next();
        }
    };
    DashboardPatrolService.prototype.handleUpdatedTemplate = function (template) {
        this.onUpdatePatrolTemplate.next(template);
    };
    DashboardPatrolService.prototype.handleTemplateDeleted = function (templateID) {
        this.onPatrolTemplateDeleted.next(templateID);
    };
    //location changed
    DashboardPatrolService.prototype.handleLocationChanged = function () {
        //this.onUpdatePatrolInstance.next();
        this.onUpdatePatrolData.next();
    };
    ///////////////////////////////////////////
    //Patrol Instance Methods
    ///////////////////////////////////////////
    DashboardPatrolService.prototype.getPatrols = function () {
        var filteredPlatrolInstances = [];
        if (this.patrolInstances) {
            //apply Location Filter
            var selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatrolInstances = this.locationFilterPipe.transform(this.patrolInstances, selectedLocations);
            //apply criteria filters
            if (this.patrolFilterAlarmPrioritySelection !== 0) {
                var patrolAlarms = this.getAllPatrolsAlarms(filteredPlatrolInstances);
                filteredPlatrolInstances = this.patrolAlarmPriorityPipe.transform(filteredPlatrolInstances, patrolAlarms, this.patrolFilterAlarmPrioritySelection);
            }
            if ((this.patrolFilterOperatorSelection) && (this.patrolFilterOperatorSelection !== 'All'))
                filteredPlatrolInstances = this.patrolOperatorPipe.transform(filteredPlatrolInstances, this.patrolFilterOperatorSelection);
            if ((this.patrolFilterPatrolDisplayNameSelection) && (this.patrolFilterPatrolDisplayNameSelection !== 'All'))
                filteredPlatrolInstances = this.patrolDisplayNamePipe.transform(filteredPlatrolInstances, this.patrolFilterPatrolDisplayNameSelection);
            if (this.patrolFilterStatusSelection !== 4)
                filteredPlatrolInstances = this.patrolStatusPipe.transform(filteredPlatrolInstances, this.patrolFilterStatusSelection, this.getPatrolTemplates());
            if ((this.patrolFilterRobotSelection) && (this.patrolFilterRobotSelection !== 'All'))
                filteredPlatrolInstances = this.patrolRobotDronePipe.transform(filteredPlatrolInstances, this.patrolFilterRobotSelection);
            //sort the results by Last Updated Time
            this.genericDateSort(filteredPlatrolInstances, 'asc');
        }
        return filteredPlatrolInstances;
    };
    DashboardPatrolService.prototype.genericDateSort = function (list, sortOrder) {
        list.sort(function (a, b) {
            var aSubmittedTime = a.SubmittedTime;
            var bSubmittedTime = b.SubmittedTime;
            var res = 0;
            if (aSubmittedTime < bSubmittedTime) {
                res = 1;
            }
            if (aSubmittedTime > bSubmittedTime) {
                res = -1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            return res;
        });
    };
    DashboardPatrolService.prototype.getPatrol = function (patrolID) {
        var patrolInstance;
        var patrols = this.getPatrols(); //get the filtered patrols
        if (patrols) {
            var patrolInstances = this.patrolInstances.filter(function (p) { return p.id === patrolID; });
            if ((patrolInstances) && (patrolInstances.length === 1))
                patrolInstance = patrolInstances[0];
        }
        return patrolInstance;
    };
    DashboardPatrolService.prototype.getPatrolInstanceByPlatformId = function (platformID) {
        var patrol;
        if (platformID) {
            patrol = this.patrolService.getPatrolInstanceByPlatformId(platformID);
        }
        return patrol;
    };
    DashboardPatrolService.prototype.getPatrolTestData = function () {
        var patrols = JSON.parse("[\n\t\t    {\n                \"InstanceId\": \"018f0b9c-5e26-4bcb-a388-28447da91f29\",\n                \"RunNumber\": 1,\n                \"MaxRunNumber\": 0,\n                \"LastUpdateTime\": 1496953858774.7686,\n                \"SubmittedTime\": 1496953772269,\n                \"StartedTime\": 1496932181000,\n                \"EndedTime\": 1496932253000,\n                \"UserName\": \"live.com#ricky.crow@hexagonsi.com\",\n                \"PlatformId\": \"Gamma2Platform8\",\n                \"CurrentStatus\": 2,\n                \"StatusHistory\": [\n                    {\n                        \"Status\": 1,\n                        \"ReportedTime\": 1496932181000\n                    },\n                    {\n                        \"Status\": 2,\n                        \"ReportedTime\": 1496932253000\n                    }\n                ],\n                \"Points\": [\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932181000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932197000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932197000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"37be6939-2f91-4517-b8a3-2814b7721df1\",\n                        \"DisplayName\": \"Point 1\",\n                        \"Ordinal\": 1,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07318653166296,\n                                39.650303647176194\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932197000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932220000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"e6910174-6197-435f-976c-e13a876229e0\",\n                        \"DisplayName\": \"Point 2\",\n                        \"Ordinal\": 2,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07311914116146,\n                                39.65030338902922\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932220000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932220000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932228000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932228000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"a5aa5fdc-3bc0-4548-95f8-1860b5485472\",\n                        \"DisplayName\": \"Point 3\",\n                        \"Ordinal\": 3,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07310640066864,\n                                39.65028686762152\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932228000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932237000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"758f77e8-54b9-4da7-9485-d2c2c3ad09ff\",\n                        \"DisplayName\": \"Point 4\",\n                        \"Ordinal\": 4,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07313255220654,\n                                39.65028273726896\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932237000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932237000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932253000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"766aa45e-356b-45c3-ba37-9e508b80e280\",\n                        \"DisplayName\": \"Point 5\",\n                        \"Ordinal\": 5,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07318720221522,\n                                39.65028609318042\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    }\n                ],\n                \"AlarmIds\": [\"5f962590-798f-410a-aaeb-4c428508a59a\", \"365f4d54-42d0-4ec0-9302-b4e7d0149f42\"],\n                \"TemplateId\": \"118f0b9c-5e26-4bcb-a388-28447da91f27\",\n                \"DisplayName\": \"Night Patrol\",\n                \"Description\": null,\n                \"Type\": 0,\n                \"IsTemplate\": false,\n                \"IsDeleted\": false,\n                \"AreaType\": 0,\n                \"TenantId\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                \"LocationId\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                \"Version\": 0,\n                \"id\": \"5c3a6aab-3725-4b2a-a577-6ad95c3adb66\"\n            },\n            {\n                \"InstanceId\": \"018f0b9c-5e26-4bcb-a388-28447da91f29\",\n                \"RunNumber\": 1,\n                \"MaxRunNumber\": 0,\n                \"LastUpdateTime\": 1496954769261.075,\n                \"SubmittedTime\": 1496954559014,\n                \"StartedTime\": 1496932968000,\n                \"EndedTime\": 1496933027000,\n                \"UserName\": \"live.com#ricky.crow@hexagonsi.com\",\n                \"PlatformId\": \"Gamma2Platform8\",\n                \"CurrentStatus\": 2,\n                \"StatusHistory\": [\n                    {\n                        \"Status\": 2,\n                        \"ReportedTime\": 1496933027000\n                    },\n                    {\n                        \"Status\": 1,\n                        \"ReportedTime\": 1496932968000\n                    },\n                    {\n                        \"Status\": 2,\n                        \"ReportedTime\": 1496933027000\n                    }\n                ],\n                \"Points\": [\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932968000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932968000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932976000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"37be6939-2f91-4517-b8a3-2814b7721df1\",\n                        \"DisplayName\": \"Point 1\",\n                        \"Ordinal\": 1,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07318653166296,\n                                39.650303647176194\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932976000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932976000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496932994000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"e6910174-6197-435f-976c-e13a876229e0\",\n                        \"DisplayName\": \"Point 2\",\n                        \"Ordinal\": 2,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07311914116146,\n                                39.65030338902922\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932994000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496932994000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933002000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"a5aa5fdc-3bc0-4548-95f8-1860b5485472\",\n                        \"DisplayName\": \"Point 3\",\n                        \"Ordinal\": 3,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07310640066864,\n                                39.65028686762152\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933002000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933002000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933012000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"758f77e8-54b9-4da7-9485-d2c2c3ad09ff\",\n                        \"DisplayName\": \"Point 4\",\n                        \"Ordinal\": 4,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07313255220654,\n                                39.65028273726896\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933012000\n                            },\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933012000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933027000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"766aa45e-356b-45c3-ba37-9e508b80e280\",\n                        \"DisplayName\": \"Point 5\",\n                        \"Ordinal\": 5,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07318720221522,\n                                39.65028609318042\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    }\n                ],\n                \"AlarmIds\": [\"762b6d03-ef88-499d-a3b6-2bb99c5a48a3\"],\n                \"TemplateId\": \"018f0b9c-5e26-4bcb-a388-28447da91f29\",\n                \"DisplayName\": \"Night Patrol\",\n                \"Description\": null,\n                \"Type\": 0,\n                \"IsTemplate\": false,\n                \"IsDeleted\": false,\n                \"AreaType\": 2,\n                \"TenantId\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                \"LocationId\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                \"Version\": 0,\n                \"id\": \"70cbe742-cf9a-40d4-b869-786d9b2548cc\"\n            },\n            {\n                \"InstanceId\": \"f8020889-03bf-46c6-a4cc-8e9751f9bf98\",\n                \"RunNumber\": 1,\n                \"MaxRunNumber\": 0,\n                \"LastUpdateTime\": 1496954948019.3616,\n                \"SubmittedTime\": 1496954879270,\n                \"StartedTime\": 1496933286000,\n                \"EndedTime\": 1496933343000,\n                \"UserName\": \"live.com#ricky.crow@hexagonsi.com\",\n                \"PlatformId\": \"Gamma2Platform8\",\n                \"CurrentStatus\": 2,\n                \"StatusHistory\": [\n                    {\n                        \"Status\": 1,\n                        \"ReportedTime\": 1496933286000\n                    },\n                    {\n                        \"Status\": 2,\n                        \"ReportedTime\": 1496933343000\n                    }\n                ],\n                \"Points\": [\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933286000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933298000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"87f4c9c4-26b8-4953-b9ad-511c6f140868\",\n                        \"DisplayName\": \"Point 1\",\n                        \"Ordinal\": 1,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07316112925764,\n                                39.65031139158466\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933298000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933313000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"a9f79ea8-39f2-44d8-8542-39d11e324317\",\n                        \"DisplayName\": \"Point 2\",\n                        \"Ordinal\": 2,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07311184366702,\n                                39.650309584556105\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933313000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933320000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"df0e4bda-c408-48c6-a5f3-c5014a560fbe\",\n                        \"DisplayName\": \"Point 3\",\n                        \"Ordinal\": 3,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07309507986066,\n                                39.650298484236735\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933320000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933329000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"5627b4e6-750b-47f7-b68e-7668a8d2e7cb\",\n                        \"DisplayName\": \"Point 4\",\n                        \"Ordinal\": 4,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07308938016652,\n                                39.650280413945545\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1496933329000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1496933343000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"bd332d76-c70c-457d-8013-93bb798076c8\",\n                        \"DisplayName\": \"Point 5\",\n                        \"Ordinal\": 5,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07312525471208,\n                                39.650304937911\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    }\n                ],\n                \"AlarmIds\": null,\n                \"TemplateId\": \"f8020889-03bf-46c6-a4cc-8e9751f9bf98\",\n                \"DisplayName\": \"Side Loading Dock\",\n                \"Description\": \"This is a ricky note.\",\n                \"Type\": 0,\n                \"IsTemplate\": false,\n                \"IsDeleted\": false,\n                \"AreaType\": 1,\n                \"TenantId\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                \"LocationId\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                \"Version\": 0,\n                \"id\": \"8aa7197a-0655-443f-8463-1b11aff35b6f\"\n            },\n            {\n                \"InstanceId\": \"9d3dc9cf-ce31-48ac-b75c-c122b805efc3\",\n                \"RunNumber\": 1,\n                \"MaxRunNumber\": 0,\n                \"LastUpdateTime\": 1497119477127.409,\n                \"SubmittedTime\": 1497119457874,\n                \"StartedTime\": 1497119469000,\n                \"EndedTime\": 0,\n                \"UserName\": \"live.com#jeremy.leshko@hexagonsi.com\",\n                \"PlatformId\": \"a7f59624-018f-4a9c-89b2-96213966e4ea\",\n                \"CurrentStatus\": 6,\n                \"StatusHistory\": [\n                    {\n                        \"Status\": 1,\n                        \"ReportedTime\": 1497119469000\n                    },\n                    {\n                        \"Status\": 6,\n                        \"ReportedTime\": 1497119477127.409\n                    }\n                ],\n                \"Points\": [\n                    {\n                        \"CurrentStatus\": 1,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1497119469000\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"37be6939-2f91-4517-b8a3-2814b7721df1\",\n                        \"DisplayName\": \"Point 1\",\n                        \"Ordinal\": 1,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07325693964958,\n                                39.65030054941254\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"e6910174-6197-435f-976c-e13a876229e0\",\n                        \"DisplayName\": \"Point 2\",\n                        \"Ordinal\": 2,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.0732106715441,\n                                39.65031448934783\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"3a64998f-7be0-45ce-a26b-3a39cdb9dea4\",\n                                \"Command\": 26,\n                                \"Parameters\": [\n                                    {\n                                        \"Name\": 5,\n                                        \"Value\": \"3\",\n                                        \"Type\": 0\n                                    }\n                                ]\n                            },\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"46945abd-0099-4117-a285-eb1f3119b271\",\n                                \"Command\": 3,\n                                \"Parameters\": []\n                            },\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"cb53bc68-0d03-426d-989c-9aea0c690000\",\n                                \"Command\": 2,\n                                \"Parameters\": []\n                            }\n                        ],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"a5aa5fdc-3bc0-4548-95f8-1860b5485472\",\n                        \"DisplayName\": \"Checkpoint 1\",\n                        \"Ordinal\": 3,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.0732022896409,\n                                39.65029435388487\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"758f77e8-54b9-4da7-9485-d2c2c3ad09ff\",\n                        \"DisplayName\": \"Point 4\",\n                        \"Ordinal\": 4,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07321368902923,\n                                39.65028196282784\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"766aa45e-356b-45c3-ba37-9e508b80e280\",\n                        \"DisplayName\": \"Point 5\",\n                        \"Ordinal\": 5,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07325258105996,\n                                39.65028222097489\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    }\n                ],\n                \"AlarmIds\": null,\n                \"TemplateId\": \"218f0b9c-5e26-4bcb-a388-28447da91f25\",\n                \"DisplayName\": \"Main Hallway\",\n                \"Description\": null,\n                \"Type\": 0,\n                \"IsTemplate\": false,\n                \"IsDeleted\": false,\n                \"AreaType\": 2,\n                \"TenantId\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                \"LocationId\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                \"Version\": 0,\n                \"id\": \"9d3dc9cf-ce31-48ac-b75c-c122b805efc3\"\n            },\n            {\n                \"InstanceId\": \"6d3dc9cf-ce31-48ac-b75c-c122b805efd2\",\n                \"RunNumber\": 1,\n                \"MaxRunNumber\": 0,\n                \"LastUpdateTime\": 1497119477127.409,\n                \"SubmittedTime\": 1497119457874,\n                \"StartedTime\": 1497119469000,\n                \"EndedTime\": 0,\n                \"UserName\": \"live.com#jeremy.leshko@hexagonsi.com\",\n                \"PlatformId\": \"c6f59624-018f-4a9c-89b2-96213966e4ea\",\n                \"CurrentStatus\": 1,\n                \"StatusHistory\": [\n                    {\n                        \"Status\": 1,\n                        \"ReportedTime\": 1497119469000\n                    }\n                ],\n                \"Points\": [\n                    {\n                        \"CurrentStatus\": 2,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1497119469000\n                            },\n                            {\n                                \"Status\": 2,\n                                \"ReportedTime\": 1497119477127.409\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"37be6939-2f91-4517-b8a3-2814b7721df1\",\n                        \"DisplayName\": \"Point 1\",\n                        \"Ordinal\": 1,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07325693964958,\n                                39.65030054941254\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 1,\n                        \"StatusHistory\": [\n                            {\n                                \"Status\": 1,\n                                \"ReportedTime\": 1497119477128\n                            }\n                        ],\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"e6910174-6197-435f-976c-e13a876229e0\",\n                        \"DisplayName\": \"Point 2\",\n                        \"Ordinal\": 2,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.0732106715441,\n                                39.65031448934783\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"3a64998f-7be0-45ce-a26b-3a39cdb9dea4\",\n                                \"Command\": 26,\n                                \"Parameters\": [\n                                    {\n                                        \"Name\": 5,\n                                        \"Value\": \"3\",\n                                        \"Type\": 0\n                                    }\n                                ]\n                            },\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"46945abd-0099-4117-a285-eb1f3119b271\",\n                                \"Command\": 3,\n                                \"Parameters\": []\n                            },\n                            {\n                                \"CurrentStatus\": 0,\n                                \"StatusHistory\": null,\n                                \"AlarmIds\": null,\n                                \"Image\": null,\n                                \"ActionId\": \"cb53bc68-0d03-426d-989c-9aea0c690000\",\n                                \"Command\": 2,\n                                \"Parameters\": []\n                            }\n                        ],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"a5aa5fdc-3bc0-4548-95f8-1860b5485472\",\n                        \"DisplayName\": \"Checkpoint 1\",\n                        \"Ordinal\": 3,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.0732022896409,\n                                39.65029435388487\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"758f77e8-54b9-4da7-9485-d2c2c3ad09ff\",\n                        \"DisplayName\": \"Point 4\",\n                        \"Ordinal\": 4,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07321368902923,\n                                39.65028196282784\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    },\n                    {\n                        \"CurrentStatus\": 0,\n                        \"StatusHistory\": null,\n                        \"Actions\": [],\n                        \"AlarmIds\": null,\n                        \"Telemetry\": null,\n                        \"PointId\": \"766aa45e-356b-45c3-ba37-9e508b80e280\",\n                        \"DisplayName\": \"Point 5\",\n                        \"Ordinal\": 5,\n                        \"Description\": null,\n                        \"Position\": {\n                            \"coordinates\": [\n                                -105.07325258105996,\n                                39.65028222097489\n                            ],\n                            \"type\": \"Point\"\n                        }\n                    }\n                ],\n                \"AlarmIds\": null,\n                \"TemplateId\": \"318f0b9c-5e26-4bcb-a388-28447da91f24\",\n                \"DisplayName\": \"Standard Loading Dock\",\n                \"Description\": null,\n                \"Type\": 0,\n                \"IsTemplate\": false,\n                \"IsDeleted\": false,\n                \"AreaType\": 2,\n                \"TenantId\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                \"LocationId\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                \"Version\": 0,\n                \"id\": \"6d3dc9cf-ce31-48ac-b75c-c122b805efd2\"\n            }\n\t\t]");
        return patrols;
    };
    DashboardPatrolService.prototype.getAreaType = function (type) {
        if (type != null) {
            return AreaType[type].toString().toLocaleLowerCase();
        }
        return '';
    };
    DashboardPatrolService.prototype.getPatrolStatusObj = function (patrolInstance) {
        var patrolStatusObj;
        if (patrolInstance) {
            //look at the high level patrol status
            //if failed, aborted or Unknown - show it
            //if started, paused or resumed then look at the point status
            //if point status is not reached (??), or checkpoint is failed, unknown or unsupported 
            // - get the last point or checkpoint that had the problem and show it
            //otherwise show In Progress with percentage
            //if completed with no errors - show it
            //ask about Unknown status
            //if (patrolInstance.CurrentStatus === PatrolStatusValues.Unknown) {
            //    patrolStatusObj = {
            //        Status: PatrolStatus.Warning,
            //        Icon: "checkpoint-failed",
            //        DisplayText: "Patrol Aborted",
            //        DisplayPercentage: 0
            //    };
            //    return patrolStatusObj;
            //}
            //red
            if ((patrolInstance.CurrentStatus === PatrolStatusValues.Failed) || (patrolInstance.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints)) {
                patrolStatusObj = {
                    Status: PatrolStatus.Critical,
                    Icon: "critical-error",
                    DisplayText: "Patrol Failed",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            //orange
            if (patrolInstance.CurrentStatus === PatrolStatusValues.FailedCheckpoints) {
                patrolStatusObj = {
                    Status: PatrolStatus.Incomplete,
                    Icon: "incomplete",
                    DisplayText: "Incomplete",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            //amber
            if (patrolInstance.CurrentStatus === PatrolStatusValues.Aborted) {
                patrolStatusObj = {
                    Status: PatrolStatus.Warning,
                    Icon: "aborted",
                    DisplayText: "Patrol Aborted",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            if (patrolInstance.CurrentStatus === PatrolStatusValues.PointsNotReached) {
                patrolStatusObj = {
                    Status: PatrolStatus.Warning,
                    Icon: "warning",
                    DisplayText: "Patrol Not Reached",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            //if the patrol is currently running:
            //1st check the points that were reached
            //for any actions that may have failed
            var patrolPoints_1 = [];
            var ptReached = patrolInstance.Points.filter(function (pt) { return (pt.CurrentStatus === PointStatusValues.Reached) &&
                (patrolInstance.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                (patrolInstance.CurrentStatus !== PatrolStatusValues.FailedCheckpoints); });
            if (ptReached.length > 0) {
                var _loop_1 = function (pti) {
                    var actionFailed = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported); });
                    if (actionFailed.length > 0) {
                        if (patrolPoints_1.indexOf(pti) === -1)
                            patrolPoints_1.push(pti);
                    }
                    //if a point has actions (i.e. its a checkpoint) and its status is 2 (reached) 
                    //but 1 or more of the points actions statuses is 1 (started) or 0 (unknown), then 
                    //get the checkpoints ordinal number and check to see if the next point after this one has a status or 1 (in transit) or 2(reached)
                    //if it does, then it means that this current point with actions (i.e. checkpoint) has failed
                    //return a status of 3 (action failed) (Note!!! - this should role up to a patrol status of 8 once the patrol is completed)
                    var actionIncomplete = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown); });
                    if (actionIncomplete.length > 0) {
                        var nextPointOrdinal = ptReached.filter(function (o) { return o.Ordinal === (pti.Ordinal + 1); });
                        if (nextPointOrdinal.length > 0) {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown) {
                                if (patrolPoints_1.indexOf(pti) === -1)
                                    patrolPoints_1.push(pti);
                            }
                        }
                    }
                    ///
                };
                for (var _i = 0, ptReached_1 = ptReached; _i < ptReached_1.length; _i++) {
                    var pti = ptReached_1[_i];
                    _loop_1(pti);
                }
            }
            if (patrolPoints_1.length > 0) {
                //we have actinos that have failed for a patrol point
                //check to see if the patrol is paused
                //if so mark the paused status Incomplete
                if (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Incomplete,
                        Icon: "paused",
                        DisplayText: "Patrol Paused",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                }
                //if the patrol is not paused, specify the actions that failed
                var pointStr_1 = '';
                patrolPoints_1.forEach(function (item, index) {
                    pointStr_1 = pointStr_1 + item.Ordinal.toString();
                    if ((index + 1) < patrolPoints_1.length) {
                        if ((index + 2) === patrolPoints_1.length) {
                            pointStr_1 = pointStr_1 + " and ";
                        }
                        else {
                            pointStr_1 = pointStr_1 + ", ";
                        }
                    }
                });
                patrolStatusObj = {
                    Status: PatrolStatus.Incomplete,
                    Icon: "incomplete",
                    DisplayText: "Checkpoint " + pointStr_1 + " Failed",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            else {
                //2nd check the points that were not reached
                var ptNotReached = patrolInstance.Points.filter(function (pt) { return pt.CurrentStatus === PointStatusValues.NotReached; });
                if (ptNotReached.length > 0) {
                    //check to see if any of the points not reached had actions
                    //if so, mark it checkpoint failed - Orange
                    var ptNotReachedHasActions_1 = ptNotReached.filter(function (pnr) { return (pnr.Actions !== null && pnr.Actions.length > 0); });
                    if (ptNotReachedHasActions_1.length > 0) {
                        //check to see if the patrol is paused
                        //if so mark the paused status Incomplete
                        if (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                            patrolStatusObj = {
                                Status: PatrolStatus.Incomplete,
                                Icon: "paused",
                                DisplayText: "Patrol Paused",
                                DisplayPercentage: 0
                            };
                            return patrolStatusObj;
                        }
                        var cPointStr_1 = '';
                        ptNotReachedHasActions_1.forEach(function (item, index) {
                            cPointStr_1 = cPointStr_1 + item.Ordinal.toString();
                            if ((index + 1) < ptNotReachedHasActions_1.length) {
                                if ((index + 2) === ptNotReachedHasActions_1.length) {
                                    cPointStr_1 = cPointStr_1 + " and ";
                                }
                                else {
                                    cPointStr_1 = cPointStr_1 + ", ";
                                }
                            }
                        });
                        patrolStatusObj = {
                            Status: PatrolStatus.Incomplete,
                            Icon: "incomplete",
                            DisplayText: "Checkpoint " + cPointStr_1 + " Failed",
                            DisplayPercentage: 0
                        };
                    }
                    else {
                        //check to see if the patrol is paused
                        //if so mark the paused status Warning - Amber
                        if (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                            patrolStatusObj = {
                                Status: PatrolStatus.Warning,
                                Icon: "paused",
                                DisplayText: "Patrol Paused",
                                DisplayPercentage: 0
                            };
                            return patrolStatusObj;
                        }
                        patrolStatusObj = {
                            Status: PatrolStatus.Warning,
                            Icon: "warning",
                            DisplayText: "Point Not Reached",
                            DisplayPercentage: 0
                        };
                    }
                    return patrolStatusObj;
                }
                //green
                if (patrolInstance.CurrentStatus === PatrolStatusValues.Paused) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Healthy,
                        Icon: "paused",
                        DisplayText: "Patrol Paused",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                }
                else if (patrolInstance.CurrentStatus === PatrolStatusValues.Resumed) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Healthy,
                        Icon: "healthy",
                        DisplayText: "In Progress ",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                }
                else if (patrolInstance.CurrentStatus === PatrolStatusValues.Completed) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Successful,
                        Icon: "successful",
                        DisplayText: "Successful",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                }
                else if (patrolInstance.CurrentStatus === PatrolStatusValues.Started) {
                    var patrolCompleteness = this.patrolService.getPatrolCompletenessText(patrolInstance);
                    patrolStatusObj = {
                        Status: PatrolStatus.Healthy,
                        Icon: "healthy",
                        DisplayText: "In Progress " + patrolCompleteness + "%",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                }
            }
        }
        return patrolStatusObj;
    };
    DashboardPatrolService.prototype.getPatrolElapsedTime = function (patrol) {
        if (!patrol || !patrol.SubmittedTime) {
            return;
        }
        var result = ' ';
        var patrolStatus = this.getPatrolStatusObj(patrol);
        if ((patrol.CurrentStatus === PatrolStatusValues.Started) ||
            (patrol.CurrentStatus === PatrolStatusValues.Paused) ||
            (patrol.CurrentStatus === PatrolStatusValues.Resumed)) {
            //this patrol is currently running
            //diff from submitted time until current
            result = moment.duration(moment().diff(patrol.SubmittedTime)).humanize();
        }
        else {
            //this patrol is historical
            //diff from submitted time until end time
            result = moment.duration(moment(patrol.EndedTime).diff(patrol.SubmittedTime)).humanize();
        }
        if (result.includes('second')) {
            var sec = moment.duration(moment(patrol.EndedTime).diff(patrol.SubmittedTime)).asSeconds();
            if (sec)
                sec = Math.round(sec);
            return sec + ' sec';
        }
        result = result.replace('year', 'yr');
        result = result.replace('month', 'mth');
        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result;
    };
    DashboardPatrolService.prototype.convertPatrolTime = function (date, dateOnly) {
        var val1 = '';
        var val2 = '';
        if (moment().isSame(date, 'day')) {
            val1 = 'Today';
        }
        else if (moment().subtract(1, 'day').isSame(date, 'day')) {
            val1 = 'Yesterday';
        }
        else {
            val1 = moment(date).format('M/D/YY');
        }
        if (dateOnly) {
            return val1;
        }
        if (val1 !== '') {
            val2 = ' - ';
        }
        val2 += moment(date).format('h:mm:ssa');
        return val1 + val2;
    };
    DashboardPatrolService.prototype.getCheckPointStatus = function (patrol) {
        var patrolCheckpointStatus;
        var patrolPointsFailed = [];
        var actionSuccessfulCount = 0;
        for (var _i = 0, _a = patrol.Points; _i < _a.length; _i++) {
            var pti = _a[_i];
            if (pti.CurrentStatus === PointStatusValues.Reached) {
                var actionFailed = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported); });
                if (actionFailed.length > 0) {
                    if (patrolPointsFailed.indexOf(pti) === -1)
                        patrolPointsFailed.push(pti);
                }
            }
            if (pti.CurrentStatus === PointStatusValues.NotReached) {
                if (pti.Actions && pti.Actions.length > 0) {
                    //this checkpoint was not reached but it had checkpoints
                    if (patrolPointsFailed.indexOf(pti) === -1)
                        patrolPointsFailed.push(pti);
                }
            }
            actionSuccessfulCount = actionSuccessfulCount + pti.Actions.filter(function (a) { return a.CurrentStatus === ActionStatusValues.Completed; }).length;
        }
        if (patrolPointsFailed.length > 0) {
            var pointStr_2 = '';
            patrolPointsFailed.forEach(function (item, index) {
                pointStr_2 = pointStr_2 + item.Ordinal.toString();
                if ((index + 1) < patrolPointsFailed.length) {
                    if ((index + 2) === patrolPointsFailed.length) {
                        pointStr_2 = pointStr_2 + " and ";
                    }
                    else {
                        pointStr_2 = pointStr_2 + ", ";
                    }
                }
            });
            patrolCheckpointStatus = {
                FailedDisplayText: pointStr_2,
                SuccessfulCount: 0,
                Icon: "checkpoint-failed"
            };
        }
        else {
            patrolCheckpointStatus = {
                FailedDisplayText: "",
                SuccessfulCount: actionSuccessfulCount,
                Icon: "successful"
            };
        }
        return patrolCheckpointStatus;
    };
    DashboardPatrolService.prototype.getAllPatrolsAlarms = function (patrols) {
        var patrolAlarms = [];
        var alarmNotInService = [];
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
                    patrolAlarms = patrolAlarms.concat(alarms);
                    return p.AlarmIds; //may not need this anymore
                }
            }, this);
            var patrolPointInst = patrols.filter(function (p) { return p.Points && p.Points.length > 0; });
            if (patrolPointInst) {
                for (var _i = 0, patrolPointInst_1 = patrolPointInst; _i < patrolPointInst_1.length; _i++) {
                    var pInst = patrolPointInst_1[_i];
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
                                //if (this.patrolToAlarmsMap.has(pInst.id)) {
                                //    let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(pInst.id);
                                //    updAlarms = updAlarms.concat(alarms);
                                //    this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                //} else {
                                //    this.patrolToAlarmsMap.set(pInst.id, alarms);
                                //}
                                patrolAlarms = patrolAlarms.concat(alarms);
                                return p.AlarmIds; //may not need this anymore
                            }
                        }, this);
                        if (ptAlarmIDs.length > 0)
                            alarmIDs = alarmIDs.concat(ptAlarmIDs);
                    }
                    var patrolPointActionInst = pInst.Points.filter(function (pt) { return pt.Actions && pt.Actions.length > 0; });
                    var patrolPointActions = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                    for (var _a = 0, patrolPointActions_1 = patrolPointActions; _a < patrolPointActions_1.length; _a++) {
                        var ptActionInst = patrolPointActions_1[_a];
                        var ptActionInstAlarms = ptActionInst.filter(function (a) { return a.AlarmIds != null; });
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
                                    //if (this.patrolToAlarmsMap.has(pInst.id)) {
                                    //    let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(pInst.id);
                                    //    updAlarms = updAlarms.concat(alarms);
                                    //    this.patrolToAlarmsMap.set(pInst.id, updAlarms);
                                    //} else {
                                    //    this.patrolToAlarmsMap.set(pInst.id, alarms);
                                    //}
                                    patrolAlarms = patrolAlarms.concat(alarms);
                                    return p.AlarmIds;
                                }
                            }, this);
                            if (ptActionAlarmIDs.length > 0)
                                alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                        }
                    }
                }
            }
            //if (alarmNotInService.length > 0) { //TODO Test this scenario - if in last 8 hours search but patrol ran into 9th hour and alarm happened in to 9th hour
            //    //get these alarms from the database
            //    this.dashboardAlarmService.loadAlarmsByIds(alarmNotInService).then((alarms) => {
            //        if (alarms && alarms.length > 0) {
            //            for (let dbAlarms of alarms) {
            //                let alarm: Alarm = new Alarm(dbAlarms);
            //                if (alarm.PatrolId) {
            //                    if (this.patrolToAlarmsMap.has(alarm.PatrolId)) {
            //                        let updAlarms: Alarm[] = this.patrolToAlarmsMap.get(alarm.PatrolId);
            //                        updAlarms = updAlarms.concat(alarms);
            //                    } else {
            //                        this.patrolToAlarmsMap.set(alarm.PatrolId, alarms);
            //                    }
            //                }
            //            }
            //            this.changeDetectorRef.detectChanges;
            //        }
            //    });
            //}
        }
        return patrolAlarms;
    };
    DashboardPatrolService.prototype.getPatrolAlarms = function (patrolInstance) {
        var patrolAlarms = [];
        var alarmIDs = [];
        //if ((patrolInstance) && (patrolInstance.AlarmIds)) {
        //    for (let alarmID of patrolInstance.AlarmIds) {
        //        let alarm = this.dashboardAlarmService.getFilteredAlarm(alarmID);
        //        if (alarm) {
        //            patrolAlarms.push(alarm);
        //        }
        //    }
        //}
        if (patrolInstance) {
            if (patrolInstance.AlarmIds && patrolInstance.AlarmIds.length > 0)
                alarmIDs.push(patrolInstance.AlarmIds);
            if (patrolInstance.Points) {
                var ptInstAlarms = patrolInstance.Points.filter(function (pt) { return pt.AlarmIds && pt.AlarmIds.length > 0; });
                if (ptInstAlarms.length > 0) {
                    var ptAlarmIDs = ptInstAlarms.map(function (p) { return p.AlarmIds; });
                    if (ptAlarmIDs.length > 0)
                        alarmIDs = alarmIDs.concat(ptAlarmIDs);
                }
                var patrolPointActionInst = patrolInstance.Points.filter(function (pt) { return pt.Actions && pt.Actions.length > 0; });
                var patrolPointActions = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                for (var _i = 0, patrolPointActions_2 = patrolPointActions; _i < patrolPointActions_2.length; _i++) {
                    var ptActionInst = patrolPointActions_2[_i];
                    var ptActionInstAlarms = ptActionInst.filter(function (a) { return a.AlarmIds != null; });
                    if (ptActionInstAlarms.length > 0) {
                        var ptActionAlarmIDs = ptActionInstAlarms.map(function (p) { return p.AlarmIds; });
                        if (ptActionAlarmIDs.length > 0)
                            alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                    }
                }
            }
            var alarmNotInService = [];
            //get the alarms for the patrol instance
            for (var _a = 0, alarmIDs_1 = alarmIDs; _a < alarmIDs_1.length; _a++) {
                var a = alarmIDs_1[_a];
                if (a) {
                    if (a.length > 1) {
                        for (var _b = 0, a_1 = a; _b < a_1.length; _b++) {
                            var aID = a_1[_b];
                            var alarm = this.dashboardAlarmService.getFilteredAlarm(aID); //TODO - this list needs to be different
                            if (alarm) {
                                patrolAlarms.push(alarm);
                            }
                            else {
                                alarmNotInService.push(aID);
                            }
                        }
                    }
                    else {
                        var alarm = this.dashboardAlarmService.getFilteredAlarm(a[0]); //TODO - this list needs to be different
                        if (alarm) {
                            patrolAlarms.push(alarm);
                        }
                        else {
                            alarmNotInService.push(a[0]);
                        }
                    }
                }
            }
            if (alarmNotInService.length > 0) {
                //get these alarms from the database
            }
        }
        return patrolAlarms;
    };
    DashboardPatrolService.prototype.selectPatrol = function (patrol, alarms, notifySelected) {
        if (notifySelected === void 0) { notifySelected = true; }
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                if (patrol.InstanceId) {
                    //we have a patrol instance
                    patrol.selected = true;
                    this.selectedPatrol = patrol;
                    this.selectedPatrolAlarms = alarms;
                    this.selectedPatrolTemplatedID = patrol.TemplateId;
                    this.selectedPlatform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                }
                else {
                    //we have a patrol template (may need to do something different)
                    patrol.selected = true;
                    var patrolTemp = this.getPatrolTemplate(patrol.TemplateId);
                    this.selectedPatrol = patrolTemp;
                    this.selectedPatrolAlarms = alarms;
                    this.selectedPatrolTemplatedID = patrol.TemplateId;
                    this.selectedPlatform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                }
            }
            else {
                patrol.selected = true;
                this.selectedPatrol = patrol;
                this.selectedPatrolAlarms = alarms;
                this.selectedPatrolTemplatedID = patrol.TemplateId;
                this.selectedPlatform = null; //don't show the robot
            }
        }
        this.onPatrolSelectionChange.next(this.selectedPatrolTemplatedID);
        if (notifySelected) {
            //this.alarmSelected.next(id);
        }
    };
    DashboardPatrolService.prototype.deSelectPatrol = function (patrol, notifySelected) {
        if (notifySelected === void 0) { notifySelected = true; }
        if (patrol) {
            patrol.selected = false;
            this.selectedPatrol = null;
            this.selectedPatrolAlarms = [];
            this.selectedPlatform = null;
            this.onPatrolSelectionChange.next();
            if (notifySelected) {
                //this.alarmSelected.next(id);
            }
        }
    };
    ///////////////////////////////////////////
    //Patrol Filter Methods
    ///////////////////////////////////////////
    DashboardPatrolService.prototype.setRobotDroneFilter = function (robotDroneData) {
        this.onRobotDroneSelected.next(robotDroneData);
    };
    DashboardPatrolService.prototype.setPatrolFilter = function (filter, value) {
        switch (filter) {
            case 'alarmpriority':
                this.patrolFilterAlarmPrioritySelection = value;
                break;
            case 'operator':
                this.patrolFilterOperatorSelection = value;
                break;
            case 'displayname':
                this.patrolFilterPatrolDisplayNameSelection = value;
                break;
            case 'status':
                this.patrolFilterStatusSelection = value;
                break;
            case 'robot':
                this.patrolFilterRobotSelection = value;
                break;
            default:
                break;
        }
        this.onFilterCriteriaChanged.next();
    };
    DashboardPatrolService.prototype.clearPatrolFilters = function (notify) {
        this.patrolFilterAlarmPrioritySelection = 0;
        this.patrolFilterOperatorSelection = 'All';
        this.patrolFilterPatrolDisplayNameSelection = 'All';
        this.patrolFilterStatusSelection = 4;
        this.patrolFilterRobotSelection = 'All';
        if (notify)
            this.onFilterCriteriaChanged.next();
    };
    ///////////////////////////////////////////
    //Patrol Template Methods
    ///////////////////////////////////////////
    DashboardPatrolService.prototype.getPatrolTemplates = function () {
        var filteredPlatrolTemplates = [];
        if (this.patrolTemplates) {
            //apply Location Filter
            var selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatrolTemplates = this.locationFilterPipe.transform(this.patrolTemplates, selectedLocations);
            //TODO - apply filters to templates
            //if alarm priority or status is selected return and empty array - templates don't have those
            if (this.patrolFilterAlarmPrioritySelection !== 0) {
                //templates don't have alarms - return an empty array
                filteredPlatrolTemplates = [];
            }
            if ((this.patrolFilterOperatorSelection) && (this.patrolFilterOperatorSelection !== 'All')) {
                //the operator for a template is the person that created it not executed it - return an empty array
                filteredPlatrolTemplates = [];
            }
            if ((this.patrolFilterPatrolDisplayNameSelection) && (this.patrolFilterPatrolDisplayNameSelection !== 'All'))
                filteredPlatrolTemplates = this.patrolDisplayNamePipe.transform(filteredPlatrolTemplates, this.patrolFilterPatrolDisplayNameSelection);
            if (this.patrolFilterStatusSelection !== 4) {
                //templates don't have statuses - return an empty array
                filteredPlatrolTemplates = [];
            }
            if ((this.patrolFilterRobotSelection) && (this.patrolFilterRobotSelection !== 'All'))
                filteredPlatrolTemplates = this.patrolRobotDronePipe.transform(filteredPlatrolTemplates, this.patrolFilterRobotSelection);
        }
        return filteredPlatrolTemplates;
    };
    ///////////////////////////////////////////
    //Overwritten Patrol Service Methods
    ///////////////////////////////////////////
    DashboardPatrolService.prototype.loadPatrolTemplates = function () {
    };
    DashboardPatrolService.prototype.loadPatrolInstances = function () {
    };
    DashboardPatrolService.prototype.loadActionDefinitions = function () {
    };
    DashboardPatrolService.prototype.handleMessage = function (message) {
    };
    DashboardPatrolService.prototype.getPatrolInstance = function (patrolTemplateID) {
        var patrols = this.getPatrols(); //get the filtered patrols
        for (var patrol in patrols) {
            if (patrols[patrol].TemplateId === patrolTemplateID) {
                return patrols[patrol];
            }
        }
        return null;
    };
    DashboardPatrolService.prototype.getPatrolTemplate = function (patrolTemplateID) {
        var patrolTemplates = this.getPatrolTemplates(); //get filter list
        for (var patrolTemplate in patrolTemplates) {
            if (patrolTemplates[patrolTemplate].TemplateId === patrolTemplateID) {
                return patrolTemplates[patrolTemplate];
            }
        }
        return null;
    };
    DashboardPatrolService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AlarmService,
            DashboardService,
            DashboardAlarmService,
            DashboardPlatformService,
            PatrolService,
            LocationFilterPipe,
            HttpService,
            UserService,
            LocationFilterService,
            PatrolAlarmPriorityPipe,
            PatrolStatusPipe,
            PatrolRobotDronePipe,
            PatrolDisplayNamePipe,
            PatrolOperatorPipe,
            HubService])
    ], DashboardPatrolService);
    return DashboardPatrolService;
}(PatrolService));
export { DashboardPatrolService };
//# sourceMappingURL=dashboard-patrol.service.js.map