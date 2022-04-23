import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import { AlarmService } from '../alarms/alarm.service';
import { Alarm } from '../alarms/alarm.class';
import { PlatformService } from '../platforms/platform.service';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolStatusValues, PatrolInstance, PatrolTemplate, AreaType } from '../patrols/patrol.class';
import { PointStatusValues, PointInstance } from '../patrols/point.class';
import { ActionStatusValues, ActionInstance } from '../patrols/action.class';
import { Platform } from '../platforms/platform.class';

import { FilterTimeframe, PatrolStatus, PatrolStatusObj, RobotAndDrone, PatrolCheckpointStatus } from './dashboard';
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

@Injectable()
export class DashboardPatrolService extends PatrolService{
    patrolInstances: PatrolInstance[] = []; //current patrol instances in the system
    patrolTemplates: PatrolTemplate[] = [];
    patrolRangeApiBaseUrl: string = '/patrols/range';
    exportStartDateTime: number;
    exportEndDateTime: number;

    //selectedCurrentPatrol: string = '';
    //selectedHistoricalPatrol: string = null;
    selectedPatrol: any;
    selectedPatrolAlarms: Alarm[] = [];
    selectedPlatform: Platform;

    //filter panel criteria
    patrolFilterAlarmPrioritySelection: number = 0;
    patrolFilterOperatorSelection: string = 'All';
    patrolFilterPatrolDisplayNameSelection: string = 'All';
    patrolFilterStatusSelection: number = 4;
    patrolFilterRobotSelection: string = 'All';
    patrolFilterCriteriaTotalCount: number = 0;

    onPatrolsLoaded: Subject<any> = new Subject();
    onNewPatrolInstance: Subject<any> = new Subject();
    onUpdatePatrolInstance: Subject<any> = new Subject();
    onCompletededPatrolInstance: Subject<any> = new Subject();
    onPatrolTemplatesLoaded: Subject<any> = new Subject();
    onUpdatePatrolTemplate: Subject<any> = new Subject();
    onPatrolTemplateDeleted: Subject<any> = new Subject();
    onRobotDroneSelected: Subject<any> = new Subject();
    onUpdatePatrolData: Subject<any> = new Subject();
    onFilterCriteriaChanged: Subject<any> = new Subject();

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(private alarmService: AlarmService,
        private dashboardService: DashboardService,
        private dashboardAlarmService: DashboardAlarmService,
        private dashboardPlatformService: DashboardPlatformService,
        private patrolService: PatrolService,
        private locationFilterPipe: LocationFilterPipe,
        protected httpService: HttpService,
        protected userService: UserService,
        protected locationFilterService: LocationFilterService,
        protected patrolAlarmPriorityPipe: PatrolAlarmPriorityPipe,
        protected patrolStatusPipe: PatrolStatusPipe,
        protected patrolRobotDronePipe: PatrolRobotDronePipe,
        protected patrolDisplayNamePipe: PatrolDisplayNamePipe,
        protected patrolOperatorPipe: PatrolOperatorPipe,
        protected hubService: HubService) {

        super(httpService, userService, locationFilterService, hubService);

        // Subscribe to get patrol instance notifications
        this.patrolService.onPatrolInstancesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.setPatrols()
            });

        this.patrolService.onNewInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleNewPatrol(patrol)
            });

        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleUpdatedPatrol(patrol)
            });

        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (patrol) => this.handleCompletedPatrol(patrol)
            });

        // Subscribe to get patrol template notifications
        this.patrolService.onPatrolTemplatesLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.setPatrolTemplates()
            });

        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (template) => this.handleUpdatedTemplate(template)
            });

        this.patrolService.onPatrolTemplateDeleted
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (templateID) => this.handleTemplateDeleted(templateID)
            });

        //subscribe to get location changes
        this.dashboardService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.handleLocationChanged()
            });

        //subscribe to get timeframe changes
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.updatePatrolsByTimeframe()
            });

        //TSR - debugging
        //this.setPatrols();
        //this.setPatrolTemplates();
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    updatePatrolsByTimeframe(): void {
        let startTime: Date;
        let endTime: Date;
        let url: string;

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
                this.httpService.get(url).then((historyPatrols) => {
                    this.patrolInstances = [];
                    for (let patrol of historyPatrols) {
                        this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    this.clearPatrolFilters(false);
                    this.onUpdatePatrolData.next();
                    console.log('Last 8 Hours Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
                });
                break;
            case FilterTimeframe.TwelveHours:
                startTime = this.dashboardService.getTimeFrameStartTime(12, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyPatrols) => {
                    this.patrolInstances = [];
                    for (let patrol of historyPatrols) {
                        this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    this.clearPatrolFilters(false);
                    this.onUpdatePatrolData.next();
                    console.log('Last 12 Hours Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
                });
                break;
            case FilterTimeframe.TwentyFourHours:
                startTime = this.dashboardService.getTimeFrameStartTime(24, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyPatrols) => {
                    this.patrolInstances = [];
                    for (let patrol of historyPatrols) {
                        this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    this.clearPatrolFilters(false);
                    this.onUpdatePatrolData.next();
                    console.log('Last 24 Hours Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
                });
                break;
            case FilterTimeframe.LastWeek:
                startTime = this.dashboardService.getTimeFrameStartTime(1, 'weeks');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.patrolRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyPatrols) => {
                    this.patrolInstances = [];
                    for (let patrol of historyPatrols) {
                        this.patrolInstances.push(new PatrolInstance(patrol));
                    }
                    this.clearPatrolFilters(false);
                    this.onUpdatePatrolData.next();
                    console.log('Last Week Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
                });
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime)) {
                    let startTimeStr: string = '';
                    let endTimeStr: string = '';
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
                    this.httpService.get(url).then((historyPatrols) => {
                        this.patrolInstances = [];
                        for (let patrol of historyPatrols) {
                            this.patrolInstances.push(new PatrolInstance(patrol));
                        }
                        this.clearPatrolFilters(false);
                        this.onUpdatePatrolData.next();
                        console.log('Custom Date Range Patrols (' + this.patrolInstances.length + ')', this.patrolInstances);
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
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////

    //Patrols
    setPatrols(): void {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolInstances = this.patrolService.patrolInstances;
            //this.patrolInstances = this.getPatrolTestData(); //hard coded test data for debugging
            this.onPatrolsLoaded.next();
        }

        this.dashboardService.patrolDataLoaded = true;
    }

    handleNewPatrol(patrol: PatrolInstance): void {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onNewPatrolInstance.next(patrol);
            }
        }
    }

    handleUpdatedPatrol(patrol: PatrolInstance): void {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onUpdatePatrolInstance.next(patrol);
            }
        }
    }

    handleCompletedPatrol(patrol: PatrolInstance): void {
        if (patrol) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onCompletededPatrolInstance.next(patrol);
            }
        }
    }

    //Patrol Templates
    setPatrolTemplates(): void {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            this.patrolTemplates = this.patrolService.patrolTemplates;
            this.onPatrolTemplatesLoaded.next();
        }
    }

    handleUpdatedTemplate(template: PatrolTemplate): void {
        this.onUpdatePatrolTemplate.next(template);
    }

    handleTemplateDeleted(templateID: string): void {
        this.onPatrolTemplateDeleted.next(templateID);
    }

    //location changed
    handleLocationChanged(): void {
        //this.onUpdatePatrolInstance.next();
        this.onUpdatePatrolData.next();
    }

    ///////////////////////////////////////////
    //Patrol Instance Methods
    ///////////////////////////////////////////
    getPatrols(): PatrolInstance[] {
        let filteredPlatrolInstances: PatrolInstance[] = [];
        if (this.patrolInstances) {
            //apply Location Filter
            let selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatrolInstances = this.locationFilterPipe.transform(this.patrolInstances, selectedLocations);

            //apply criteria filters
            if (this.patrolFilterAlarmPrioritySelection !== 0) {
                let patrolAlarms: Alarm[] = this.getAllPatrolsAlarms(filteredPlatrolInstances);
                filteredPlatrolInstances = this.patrolAlarmPriorityPipe.transform(filteredPlatrolInstances, patrolAlarms, this.patrolFilterAlarmPrioritySelection);
            }

            if ((this.patrolFilterOperatorSelection) && (this.patrolFilterOperatorSelection !== 'All'))
                filteredPlatrolInstances = this.patrolOperatorPipe.transform(filteredPlatrolInstances, this.patrolFilterOperatorSelection);

            if ((this.patrolFilterPatrolDisplayNameSelection) && (this.patrolFilterPatrolDisplayNameSelection !== 'All'))
                filteredPlatrolInstances = this.patrolDisplayNamePipe.transform(filteredPlatrolInstances, this.patrolFilterPatrolDisplayNameSelection);

            if (this.patrolFilterStatusSelection !== 4) //All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3
                filteredPlatrolInstances = this.patrolStatusPipe.transform(filteredPlatrolInstances, this.patrolFilterStatusSelection, this.getPatrolTemplates());

            if ((this.patrolFilterRobotSelection) && (this.patrolFilterRobotSelection !== 'All'))
                filteredPlatrolInstances = this.patrolRobotDronePipe.transform(filteredPlatrolInstances, this.patrolFilterRobotSelection);

            //sort the results by Last Updated Time
            this.genericDateSort(filteredPlatrolInstances, 'asc');
        }

        return filteredPlatrolInstances;
    } 

    genericDateSort(list: PatrolInstance[], sortOrder: string): void {
        list.sort(function (a, b) {
            let aSubmittedTime = a.SubmittedTime;
            let bSubmittedTime = b.SubmittedTime;
            let res = 0;

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
    }

    getPatrol(patrolID: string): PatrolInstance {
        let patrolInstance: PatrolInstance;
        let patrols: PatrolInstance[] = this.getPatrols(); //get the filtered patrols
        if (patrols) {
            let patrolInstances: PatrolInstance[] = this.patrolInstances.filter(p => p.id === patrolID);
            if ((patrolInstances) && (patrolInstances.length === 1))
                patrolInstance = patrolInstances[0];
        }
        return patrolInstance;
    } 

    getPatrolInstanceByPlatformId(platformID: string): PatrolInstance {
        let patrol: PatrolInstance;
        if (platformID) {
            patrol = this.patrolService.getPatrolInstanceByPlatformId(platformID);
        }
        return patrol;
    }

    getPatrolTestData(): PatrolInstance[] {
        let patrols = JSON.parse(`[
		    {
                "InstanceId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1496953858774.7686,
                "SubmittedTime": 1496953772269,
                "StartedTime": 1496932181000,
                "EndedTime": 1496932253000,
                "UserName": "live.com#ricky.crow@hexagonsi.com",
                "PlatformId": "Gamma2Platform8",
                "CurrentStatus": 2,
                "StatusHistory": [
                    {
                        "Status": 1,
                        "ReportedTime": 1496932181000
                    },
                    {
                        "Status": 2,
                        "ReportedTime": 1496932253000
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932181000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932197000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932197000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318653166296,
                                39.650303647176194
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932197000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932220000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07311914116146,
                                39.65030338902922
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932220000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932220000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932228000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932228000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07310640066864,
                                39.65028686762152
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932228000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932237000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07313255220654,
                                39.65028273726896
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932237000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932237000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932253000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318720221522,
                                39.65028609318042
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": ["5f962590-798f-410a-aaeb-4c428508a59a", "365f4d54-42d0-4ec0-9302-b4e7d0149f42"],
                "TemplateId": "118f0b9c-5e26-4bcb-a388-28447da91f27",
                "DisplayName": "Night Patrol",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 0,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "5c3a6aab-3725-4b2a-a577-6ad95c3adb66"
            },
            {
                "InstanceId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1496954769261.075,
                "SubmittedTime": 1496954559014,
                "StartedTime": 1496932968000,
                "EndedTime": 1496933027000,
                "UserName": "live.com#ricky.crow@hexagonsi.com",
                "PlatformId": "Gamma2Platform8",
                "CurrentStatus": 2,
                "StatusHistory": [
                    {
                        "Status": 2,
                        "ReportedTime": 1496933027000
                    },
                    {
                        "Status": 1,
                        "ReportedTime": 1496932968000
                    },
                    {
                        "Status": 2,
                        "ReportedTime": 1496933027000
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932968000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932968000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932976000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318653166296,
                                39.650303647176194
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932976000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932976000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496932994000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07311914116146,
                                39.65030338902922
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496932994000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496932994000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933002000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07310640066864,
                                39.65028686762152
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933002000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496933002000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933012000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07313255220654,
                                39.65028273726896
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933012000
                            },
                            {
                                "Status": 1,
                                "ReportedTime": 1496933012000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933027000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07318720221522,
                                39.65028609318042
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": ["762b6d03-ef88-499d-a3b6-2bb99c5a48a3"],
                "TemplateId": "018f0b9c-5e26-4bcb-a388-28447da91f29",
                "DisplayName": "Night Patrol",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "70cbe742-cf9a-40d4-b869-786d9b2548cc"
            },
            {
                "InstanceId": "f8020889-03bf-46c6-a4cc-8e9751f9bf98",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1496954948019.3616,
                "SubmittedTime": 1496954879270,
                "StartedTime": 1496933286000,
                "EndedTime": 1496933343000,
                "UserName": "live.com#ricky.crow@hexagonsi.com",
                "PlatformId": "Gamma2Platform8",
                "CurrentStatus": 2,
                "StatusHistory": [
                    {
                        "Status": 1,
                        "ReportedTime": 1496933286000
                    },
                    {
                        "Status": 2,
                        "ReportedTime": 1496933343000
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933286000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933298000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "87f4c9c4-26b8-4953-b9ad-511c6f140868",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07316112925764,
                                39.65031139158466
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933298000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933313000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a9f79ea8-39f2-44d8-8542-39d11e324317",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07311184366702,
                                39.650309584556105
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933313000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933320000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "df0e4bda-c408-48c6-a5f3-c5014a560fbe",
                        "DisplayName": "Point 3",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07309507986066,
                                39.650298484236735
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933320000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933329000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "5627b4e6-750b-47f7-b68e-7668a8d2e7cb",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07308938016652,
                                39.650280413945545
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1496933329000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1496933343000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "bd332d76-c70c-457d-8013-93bb798076c8",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07312525471208,
                                39.650304937911
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "f8020889-03bf-46c6-a4cc-8e9751f9bf98",
                "DisplayName": "Side Loading Dock",
                "Description": "This is a ricky note.",
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 1,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "8aa7197a-0655-443f-8463-1b11aff35b6f"
            },
            {
                "InstanceId": "9d3dc9cf-ce31-48ac-b75c-c122b805efc3",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1497119477127.409,
                "SubmittedTime": 1497119457874,
                "StartedTime": 1497119469000,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "a7f59624-018f-4a9c-89b2-96213966e4ea",
                "CurrentStatus": 6,
                "StatusHistory": [
                    {
                        "Status": 1,
                        "ReportedTime": 1497119469000
                    },
                    {
                        "Status": 6,
                        "ReportedTime": 1497119477127.409
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 1,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1497119469000
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07325693964958,
                                39.65030054941254
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.0732106715441,
                                39.65031448934783
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "3a64998f-7be0-45ce-a26b-3a39cdb9dea4",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "3",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "46945abd-0099-4117-a285-eb1f3119b271",
                                "Command": 3,
                                "Parameters": []
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "cb53bc68-0d03-426d-989c-9aea0c690000",
                                "Command": 2,
                                "Parameters": []
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.0732022896409,
                                39.65029435388487
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07321368902923,
                                39.65028196282784
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07325258105996,
                                39.65028222097489
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "218f0b9c-5e26-4bcb-a388-28447da91f25",
                "DisplayName": "Main Hallway",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "9d3dc9cf-ce31-48ac-b75c-c122b805efc3"
            },
            {
                "InstanceId": "6d3dc9cf-ce31-48ac-b75c-c122b805efd2",
                "RunNumber": 1,
                "MaxRunNumber": 0,
                "LastUpdateTime": 1497119477127.409,
                "SubmittedTime": 1497119457874,
                "StartedTime": 1497119469000,
                "EndedTime": 0,
                "UserName": "live.com#jeremy.leshko@hexagonsi.com",
                "PlatformId": "c6f59624-018f-4a9c-89b2-96213966e4ea",
                "CurrentStatus": 1,
                "StatusHistory": [
                    {
                        "Status": 1,
                        "ReportedTime": 1497119469000
                    }
                ],
                "Points": [
                    {
                        "CurrentStatus": 2,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1497119469000
                            },
                            {
                                "Status": 2,
                                "ReportedTime": 1497119477127.409
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "37be6939-2f91-4517-b8a3-2814b7721df1",
                        "DisplayName": "Point 1",
                        "Ordinal": 1,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07325693964958,
                                39.65030054941254
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 1,
                        "StatusHistory": [
                            {
                                "Status": 1,
                                "ReportedTime": 1497119477128
                            }
                        ],
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "e6910174-6197-435f-976c-e13a876229e0",
                        "DisplayName": "Point 2",
                        "Ordinal": 2,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.0732106715441,
                                39.65031448934783
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "3a64998f-7be0-45ce-a26b-3a39cdb9dea4",
                                "Command": 26,
                                "Parameters": [
                                    {
                                        "Name": 5,
                                        "Value": "3",
                                        "Type": 0
                                    }
                                ]
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "46945abd-0099-4117-a285-eb1f3119b271",
                                "Command": 3,
                                "Parameters": []
                            },
                            {
                                "CurrentStatus": 0,
                                "StatusHistory": null,
                                "AlarmIds": null,
                                "Image": null,
                                "ActionId": "cb53bc68-0d03-426d-989c-9aea0c690000",
                                "Command": 2,
                                "Parameters": []
                            }
                        ],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "a5aa5fdc-3bc0-4548-95f8-1860b5485472",
                        "DisplayName": "Checkpoint 1",
                        "Ordinal": 3,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.0732022896409,
                                39.65029435388487
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "758f77e8-54b9-4da7-9485-d2c2c3ad09ff",
                        "DisplayName": "Point 4",
                        "Ordinal": 4,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07321368902923,
                                39.65028196282784
                            ],
                            "type": "Point"
                        }
                    },
                    {
                        "CurrentStatus": 0,
                        "StatusHistory": null,
                        "Actions": [],
                        "AlarmIds": null,
                        "Telemetry": null,
                        "PointId": "766aa45e-356b-45c3-ba37-9e508b80e280",
                        "DisplayName": "Point 5",
                        "Ordinal": 5,
                        "Description": null,
                        "Position": {
                            "coordinates": [
                                -105.07325258105996,
                                39.65028222097489
                            ],
                            "type": "Point"
                        }
                    }
                ],
                "AlarmIds": null,
                "TemplateId": "318f0b9c-5e26-4bcb-a388-28447da91f24",
                "DisplayName": "Standard Loading Dock",
                "Description": null,
                "Type": 0,
                "IsTemplate": false,
                "IsDeleted": false,
                "AreaType": 2,
                "TenantId": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                "LocationId": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                "Version": 0,
                "id": "6d3dc9cf-ce31-48ac-b75c-c122b805efd2"
            }
		]`);
        return patrols;
    }

    getAreaType(type: AreaType): string {
        if (type != null)
        {
            return AreaType[type].toString().toLocaleLowerCase();
        }
        return '';
    }

    getPatrolStatusObj(patrolInstance: PatrolInstance): PatrolStatusObj {
        let patrolStatusObj: PatrolStatusObj;
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
            let patrolPoints: PointInstance[] = [];
            let ptReached = patrolInstance.Points.filter(pt => (pt.CurrentStatus === PointStatusValues.Reached) &&
                                                               (patrolInstance.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                                                               (patrolInstance.CurrentStatus !== PatrolStatusValues.FailedCheckpoints));
            if (ptReached.length > 0) {
                for (let pti of ptReached) {
                    let actionFailed = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported));   
                    if (actionFailed.length > 0) {
                        if (patrolPoints.indexOf(pti) === -1)
                            patrolPoints.push(pti)
                    }

                    //if a point has actions (i.e. its a checkpoint) and its status is 2 (reached) 
                    //but 1 or more of the points actions statuses is 1 (started) or 0 (unknown), then 
                    //get the checkpoints ordinal number and check to see if the next point after this one has a status or 1 (in transit) or 2(reached)
                    //if it does, then it means that this current point with actions (i.e. checkpoint) has failed
                    //return a status of 3 (action failed) (Note!!! - this should role up to a patrol status of 8 once the patrol is completed)
                    let actionIncomplete = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown));
                    if (actionIncomplete.length > 0)
                    {
                        let nextPointOrdinal: PointInstance[] = ptReached.filter(o => o.Ordinal === (pti.Ordinal + 1));
                        if (nextPointOrdinal.length > 0)
                        {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown)
                            {
                                if (patrolPoints.indexOf(pti) === -1)
                                    patrolPoints.push(pti);
                            }
                        }
                    }
                    ///
                }
            }

            if (patrolPoints.length > 0) {
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
                let pointStr: string = '';
                patrolPoints.forEach((item, index) => {
                    pointStr = pointStr + item.Ordinal.toString();
                    if ((index + 1) < patrolPoints.length) {
                        if ((index + 2) === patrolPoints.length) {
                            pointStr = pointStr + " and ";
                        } else {
                            pointStr = pointStr + ", ";
                        }
                    }
                });

                patrolStatusObj = {
                    Status: PatrolStatus.Incomplete,
                    Icon: "incomplete",
                    DisplayText: "Checkpoint " + pointStr + " Failed",
                    DisplayPercentage: 0
                };
                return patrolStatusObj;
            }
            else
            {
                //2nd check the points that were not reached
                let ptNotReached: PointInstance[] = patrolInstance.Points.filter(pt => pt.CurrentStatus === PointStatusValues.NotReached);
                if (ptNotReached.length > 0)
                {
                    //check to see if any of the points not reached had actions
                    //if so, mark it checkpoint failed - Orange
                    let ptNotReachedHasActions: PointInstance[] = ptNotReached.filter(pnr => (pnr.Actions !== null && pnr.Actions.length > 0));
                    if (ptNotReachedHasActions.length > 0)
                    {
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

                        let cPointStr: string = '';
                        ptNotReachedHasActions.forEach((item, index) => {
                            cPointStr = cPointStr + item.Ordinal.toString();
                            if ((index + 1) < ptNotReachedHasActions.length) {
                                if ((index + 2) === ptNotReachedHasActions.length) {
                                    cPointStr = cPointStr + " and ";
                                } else {
                                    cPointStr = cPointStr + ", ";
                                }
                            }
                        });

                        patrolStatusObj = {
                            Status: PatrolStatus.Incomplete,
                            Icon: "incomplete",
                            DisplayText: "Checkpoint " + cPointStr + " Failed",
                            DisplayPercentage: 0
                        };
                    }
                    else
                    {
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
                } else if (patrolInstance.CurrentStatus === PatrolStatusValues.Resumed) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Healthy,
                        Icon: "healthy",
                        DisplayText: "In Progress ",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                } else if (patrolInstance.CurrentStatus === PatrolStatusValues.Completed) {
                    patrolStatusObj = {
                        Status: PatrolStatus.Successful,
                        Icon: "successful",
                        DisplayText: "Successful",
                        DisplayPercentage: 0
                    };
                    return patrolStatusObj;
                } else if (patrolInstance.CurrentStatus === PatrolStatusValues.Started) {
                    let patrolCompleteness: string = this.patrolService.getPatrolCompletenessText(patrolInstance);
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
    }

    getPatrolElapsedTime(patrol: PatrolInstance): string {
        if (!patrol || !patrol.SubmittedTime) {
            return;
        }

        let result: string = ' ';

        let patrolStatus: PatrolStatusObj = this.getPatrolStatusObj(patrol);
        if ((patrol.CurrentStatus === PatrolStatusValues.Started) ||
            (patrol.CurrentStatus === PatrolStatusValues.Paused) ||
            (patrol.CurrentStatus === PatrolStatusValues.Resumed))
        {
            //this patrol is currently running
            //diff from submitted time until current
            result = moment.duration(moment().diff(patrol.SubmittedTime)).humanize();
        }
        else
        {
            //this patrol is historical
            //diff from submitted time until end time
            result = moment.duration(moment(patrol.EndedTime).diff(patrol.SubmittedTime)).humanize();
        }

        if (result.includes('second')) {
            let sec = moment.duration(moment(patrol.EndedTime).diff(patrol.SubmittedTime)).asSeconds();
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
    }

    convertPatrolTime(date: string, dateOnly?: boolean): string {
        let val1 = '';
        let val2 = '';
        if (moment().isSame(date, 'day')) {
            val1 = 'Today';
        } else if (moment().subtract(1, 'day').isSame(date, 'day')) {
            val1 = 'Yesterday';
        } else {
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
    }

    getCheckPointStatus(patrol: PatrolInstance): PatrolCheckpointStatus {
        let patrolCheckpointStatus: PatrolCheckpointStatus;
        let patrolPointsFailed: PointInstance[] = [];
        let actionSuccessfulCount: number = 0;

        for (let pti of patrol.Points) {
            if (pti.CurrentStatus === PointStatusValues.Reached) {
                let actionFailed = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported));
                if (actionFailed.length > 0) {
                    if (patrolPointsFailed.indexOf(pti) === -1)
                        patrolPointsFailed.push(pti)
                }
            }

            if (pti.CurrentStatus === PointStatusValues.NotReached) {
                if (pti.Actions && pti.Actions.length > 0)
                {
                    //this checkpoint was not reached but it had checkpoints
                    if (patrolPointsFailed.indexOf(pti) === -1)
                        patrolPointsFailed.push(pti)
                }
            }
            actionSuccessfulCount = actionSuccessfulCount + pti.Actions.filter(a => a.CurrentStatus === ActionStatusValues.Completed).length;
        }

        if (patrolPointsFailed.length > 0) {
            let pointStr: string = '';

            patrolPointsFailed.forEach((item, index) => {
                pointStr = pointStr + item.Ordinal.toString();
                if ((index + 1) < patrolPointsFailed.length) {
                    if ((index + 2) === patrolPointsFailed.length) {
                        pointStr = pointStr + " and ";
                    } else {
                        pointStr = pointStr + ", ";
                    }
                }
            });

            patrolCheckpointStatus = {
                FailedDisplayText: pointStr, //"Checkpoint " + pointStr + " Failed",
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
    }

    getAllPatrolsAlarms(patrols: PatrolInstance[]): Alarm[] {
        let patrolAlarms: Alarm[] = [];
        let alarmNotInService: string[] = [];

        if (patrols && patrols.length > 0) {
            let patrolInst: PatrolInstance[] = patrols.filter(p => p.AlarmIds && p.AlarmIds.length > 0);
            let alarmIDs: string[][] = patrolInst.map(function (p) {
                if (p.AlarmIds && p.AlarmIds.length > 0) {

                    let alarms: Alarm[] = [];
                    for (let aID of p.AlarmIds) {
                        let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
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


            let patrolPointInst: PatrolInstance[] = patrols.filter(p => p.Points && p.Points.length > 0);
            if (patrolPointInst) {
                for (let pInst of patrolPointInst) {
                    let ptInstAlarms: PointInstance[] = pInst.Points.filter(pt => pt.AlarmIds && pt.AlarmIds.length > 0);
                    if (ptInstAlarms.length > 0) {
                        let ptAlarmIDs: string[][] = ptInstAlarms.map(function (p) {
                            if (p.AlarmIds && p.AlarmIds.length > 0) {

                                let alarms: Alarm[] = [];
                                for (let aID of p.AlarmIds) {
                                    let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
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

                        if (ptAlarmIDs.length > 0) //may not need this anymore
                            alarmIDs = alarmIDs.concat(ptAlarmIDs);
                    }

                    let patrolPointActionInst: PointInstance[] = pInst.Points.filter(pt => pt.Actions && pt.Actions.length > 0);
                    let patrolPointActions: ActionInstance[][] = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                    for (let ptActionInst of patrolPointActions) {
                        let ptActionInstAlarms: ActionInstance[] = ptActionInst.filter(a => a.AlarmIds != null);
                        if (ptActionInstAlarms.length > 0) {
                            let ptActionAlarmIDs: string[][] = ptActionInstAlarms.map(function (p) {
                                if (p.AlarmIds && p.AlarmIds.length > 0) {

                                    let alarms: Alarm[] = [];
                                    for (let aID of p.AlarmIds) {
                                        let alarm = this.dashboardAlarmService.getFilteredAlarm(aID);
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
                            if (ptActionAlarmIDs.length > 0) //may not need this anymore
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
    }

    getPatrolAlarms(patrolInstance: PatrolInstance): Alarm[] {
        let patrolAlarms: Alarm[] = [];
        let alarmIDs: string[][] = [];
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
                let ptInstAlarms: PointInstance[] = patrolInstance.Points.filter(pt => pt.AlarmIds && pt.AlarmIds.length > 0);
                if (ptInstAlarms.length > 0) {
                    let ptAlarmIDs: string[][] = ptInstAlarms.map(function (p) { return p.AlarmIds; });
                    if (ptAlarmIDs.length > 0)
                        alarmIDs = alarmIDs.concat(ptAlarmIDs);
                }

                let patrolPointActionInst: PointInstance[] = patrolInstance.Points.filter(pt => pt.Actions && pt.Actions.length > 0);
                let patrolPointActions: ActionInstance[][] = patrolPointActionInst.map(function (pt) { return pt.Actions; });
                for (let ptActionInst of patrolPointActions) {
                    let ptActionInstAlarms: ActionInstance[] = ptActionInst.filter(a => a.AlarmIds != null);
                    if (ptActionInstAlarms.length > 0) {
                        let ptActionAlarmIDs: string[][] = ptActionInstAlarms.map(function (p) { return p.AlarmIds; });
                        if (ptActionAlarmIDs.length > 0)
                            alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                    }
                }
            }

            let alarmNotInService: string[] = [];
            //get the alarms for the patrol instance
            for (let a of alarmIDs) {
                if (a) {
                    if (a.length > 1) {
                        for (let aID of a) {
                            let alarm = this.dashboardAlarmService.getFilteredAlarm(aID); //TODO - this list needs to be different
                            if (alarm) {
                                patrolAlarms.push(alarm);
                            } else {
                                alarmNotInService.push(aID);
                            }
                        }
                    }
                    else {
                        let alarm = this.dashboardAlarmService.getFilteredAlarm(a[0]); //TODO - this list needs to be different
                        if (alarm) {
                            patrolAlarms.push(alarm);
                        } else {
                            alarmNotInService.push(a[0]);
                        }
                    }
                }
            }

            if (alarmNotInService.length > 0)
            {
                //get these alarms from the database

            }
        }

        return patrolAlarms;
    }

    selectPatrol(patrol: PatrolInstance, alarms: Alarm[], notifySelected: boolean = true) {
        if (patrol) { //TODO - handle if the patrol is a template that's pending

            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                if (patrol.InstanceId) {
                    //we have a patrol instance
                    patrol.selected = true;
                    this.selectedPatrol = patrol;
                    this.selectedPatrolAlarms = alarms;
                    this.selectedPatrolTemplatedID = patrol.TemplateId;
                    this.selectedPlatform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                } else {
                    //we have a patrol template (may need to do something different)
                    patrol.selected = true;
                    let patrolTemp: PatrolTemplate = this.getPatrolTemplate(patrol.TemplateId);
                    this.selectedPatrol = patrolTemp;
                    this.selectedPatrolAlarms = alarms;
                    this.selectedPatrolTemplatedID = patrol.TemplateId;
                    this.selectedPlatform = this.dashboardPlatformService.getPlatform(patrol.PlatformId);
                }
            } else {
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
    }

    deSelectPatrol(patrol: PatrolInstance, notifySelected: boolean = true)
    {
        if (patrol)
        {
            patrol.selected = false;
            this.selectedPatrol = null;
            this.selectedPatrolAlarms = [];
            this.selectedPlatform = null;
            this.onPatrolSelectionChange.next();

            if (notifySelected) {
                //this.alarmSelected.next(id);
            }
        }
    }

    ///////////////////////////////////////////
    //Patrol Filter Methods
    ///////////////////////////////////////////
    setRobotDroneFilter(robotDroneData: RobotAndDrone): void {
        this.onRobotDroneSelected.next(robotDroneData);
    }

    setPatrolFilter(filter: string, value: any): void {
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
    }

    clearPatrolFilters(notify: boolean): void {
        this.patrolFilterAlarmPrioritySelection = 0;
        this.patrolFilterOperatorSelection = 'All';
        this.patrolFilterPatrolDisplayNameSelection = 'All';
        this.patrolFilterStatusSelection = 4;
        this.patrolFilterRobotSelection = 'All';

        if (notify)
            this.onFilterCriteriaChanged.next();
    }

    ///////////////////////////////////////////
    //Patrol Template Methods
    ///////////////////////////////////////////
    getPatrolTemplates(): PatrolTemplate[] {
        let filteredPlatrolTemplates: PatrolTemplate[] = [];

        if (this.patrolTemplates) {
            //apply Location Filter
            let selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredPlatrolTemplates = this.locationFilterPipe.transform(this.patrolTemplates, selectedLocations);

            //TODO - apply filters to templates
            //if alarm priority or status is selected return and empty array - templates don't have those
            if (this.patrolFilterAlarmPrioritySelection !== 0) {
                //templates don't have alarms - return an empty array
                filteredPlatrolTemplates = [];
            }

            if ((this.patrolFilterOperatorSelection) && (this.patrolFilterOperatorSelection !== 'All'))
            {
                //the operator for a template is the person that created it not executed it - return an empty array
                filteredPlatrolTemplates = [];
            }

            if ((this.patrolFilterPatrolDisplayNameSelection) && (this.patrolFilterPatrolDisplayNameSelection !== 'All'))
                filteredPlatrolTemplates = this.patrolDisplayNamePipe.transform(filteredPlatrolTemplates, this.patrolFilterPatrolDisplayNameSelection);

            if (this.patrolFilterStatusSelection !== 4) //All: 4, Successful: 0, Warning: 1, Incomplete: 2, Critical: 3
            {
                //templates don't have statuses - return an empty array
                filteredPlatrolTemplates = [];
            }

            if ((this.patrolFilterRobotSelection) && (this.patrolFilterRobotSelection !== 'All'))
                filteredPlatrolTemplates = this.patrolRobotDronePipe.transform(filteredPlatrolTemplates, this.patrolFilterRobotSelection);
        }
        return filteredPlatrolTemplates;
    }

    ///////////////////////////////////////////
    //Overwritten Patrol Service Methods
    ///////////////////////////////////////////
    public loadPatrolTemplates(): void {
    }

    public loadPatrolInstances(): void {
    }

    protected loadActionDefinitions(): void {
	}

	public handleMessage(message: any): void {
	}


    public getPatrolInstance(patrolTemplateID: string): PatrolInstance {
        let patrols: PatrolInstance[] = this.getPatrols(); //get the filtered patrols
        for (let patrol in patrols) {
            if (patrols[patrol].TemplateId === patrolTemplateID) {
                return patrols[patrol];
            }
        }
        return null;
    }

    public getPatrolTemplate(patrolTemplateID: string): PatrolTemplate {
        let patrolTemplates: PatrolTemplate[] = this.getPatrolTemplates(); //get filter list
        for (let patrolTemplate in patrolTemplates) {
            if (patrolTemplates[patrolTemplate].TemplateId === patrolTemplateID) {
                return patrolTemplates[patrolTemplate];
            }
        }
        return null;
    }

}