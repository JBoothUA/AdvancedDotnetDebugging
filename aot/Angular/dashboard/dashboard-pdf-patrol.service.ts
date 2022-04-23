declare let reportAlarms: any;
declare let reportPlatforms: any;
declare let reportSelectedLocationIDs: string[];
declare let reportCriteria: any;
declare let reportReportType: string;
declare let reportSelectedTimeframe: string;
declare let reportExportStartTime: number;
declare let reportExportEndTime: number;

declare let reportPatrols: any;
declare let reportPatrolTemplates: any;

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';

import { UserService } from '../shared/user.service';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe, TenantLocation, PatrolStatus, PatrolStatusObj, RobotAndDrone, PatrolCheckpointStatus } from './dashboard';
import { Platform, PlatformMode, ErrorState } from './../platforms/platform.class';
import { Alarm } from '../alarms/alarm.class';
import { PatrolInstance, PatrolStatusValues, PatrolTemplate, AreaType } from "../patrols/patrol.class";
import { PointStatusValues, PointInstance } from '../patrols/point.class';
import { ActionStatusValues, ActionInstance } from '../patrols/action.class';
import { AppSettings } from '../shared/app-settings';
import { PatrolService } from '../patrols/patrol.service';
import { PlatformService } from '../platforms/platform.service';
import { LocationFilterService } from '../shared/location-filter.service';

import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';

import { PatrolAlarmPriorityPipe } from './patrol-alarmpriority.pipe';
import { PatrolStatusPipe } from './patrol-status.pipe';
import { PatrolRobotDronePipe } from './patrol-robotdrone.pipe';
import { PatrolDisplayNamePipe } from './patrol-displayname.pipe';
import { PatrolOperatorPipe } from './patrol-operator.pipe';

import { AlarmService } from '../alarms/alarm.service';
import { HttpService } from '../shared/http.service';
import { HubService } from '../shared/hub.service';

interface PlatformState {
    Id: string;
    Selected: boolean;
    Expanded: boolean;
}

@Injectable()
export class DashboardPDFPatrolService extends PatrolService {
    platforms: Platform[] = [];
    alarms: Alarm[] = [];
    patrols: PatrolInstance[] = [];
    patrolTemplates: PatrolTemplate[] = [];

    tenants: Tenant[] = [];
    selectedLocations: string[] = [];
    selectedTimeframe: FilterTimeframe = FilterTimeframe.None;
    locationHeader: string = '';
    view: string = 'dashboard';
    customStartDateTime: Date;
    customEndDateTime: Date;

    alarmFilterPrioritySelection: number = 0;
    alarmFilterOperatorSelection: string = 'All';
    alarmFilterDescriptionSelection: string = 'All';
    alarmFilterStateSelection: number = 0;
    alarmFilterRobotSelection: string = 'All';
    alarmApiBaseUrl: string = '/alarms/';

    //filter panel criteria
    patrolFilterAlarmPrioritySelection: number = 0;
    patrolFilterOperatorSelection: string = 'All';
    patrolFilterPatrolDisplayNameSelection: string = 'All';
    patrolFilterStatusSelection: number = 4;
    patrolFilterRobotSelection: string = 'All';
    patrolFilterCriteriaTotalCount: number = 0;

    constructor(private patrolService: PatrolService,
        private platformService: PlatformService,
        private alarmPriorityPipe: AlarmPriorityPipe,
        private alarmOperatorPipe: AlarmOperatorPipe,
        private alarmDescriptionPipe: AlarmDescriptionPipe,
        private alarmStatePipe: AlarmStatePipe,
        private alarmPlatformPipe: AlarmPlatformPipe,
        protected patrolAlarmPriorityPipe: PatrolAlarmPriorityPipe,
        protected patrolStatusPipe: PatrolStatusPipe,
        protected patrolRobotDronePipe: PatrolRobotDronePipe,
        protected patrolDisplayNamePipe: PatrolDisplayNamePipe,
        protected patrolOperatorPipe: PatrolOperatorPipe,
        protected locationFilterPipe: LocationFilterPipe,
        protected locationFilterService: LocationFilterService,
        protected userService: UserService,
        protected httpService: HttpService,
        protected appSettings: AppSettings,
        protected hubService: HubService) {

        super(httpService, userService, locationFilterService, hubService);

        this.loadTenants();
        this.loadSelectedLocationsIDs();

        this.loadAlarms();
        this.loadPlatforms();
        this.loadPatrols();
        this.loadPatrolTemplates();

        this.loadAlarmFilters();
        //this.loadPatrolFilters();

        this.setSelectedTimeframe();
        this.loadCustomDateTimes();
    }

    ///////////////////////////////////////////
    //Tenant Methods
    ///////////////////////////////////////////
    loadTenants() {
        this.tenants = [];

        let t = this.userService.currentUser.tenant;
        let ct = this.userService.currentUser.childTenants;

        if (t != null) {
            let parentTenant = new Tenant(t);
            this.tenants.push(parentTenant);
        }

        if (ct != null) {
            for (let cTenant of ct) {
                let childTenant = new Tenant(cTenant);
                this.tenants.push(childTenant);
            }
        }

    }

    loadSelectedLocationsIDs() {
        this.selectedLocations = reportSelectedLocationIDs;
    }

    getTenant(tenantId: string): Tenant {
        if (tenantId) {
            if (this.tenants) {
                let tentant = this.tenants.filter(t => t.Id === tenantId);
                if (tentant.length > 0) {
                    let newTenant: Tenant = new Tenant(tentant[0]);
                    return newTenant;
                }
            }
        }
        return null;
    }

    getLocation(tenantId: string, locationId: string): Location {
        if (tenantId && locationId) {
            if (this.tenants && this.tenants.length > 0) {
                let tenant: Tenant[] = this.tenants.filter(t => t.Id === tenantId);
                if (tenant.length > 0) {
                    if (tenant[0].Locations && tenant[0].Locations.length > 0) {
                        let loc = tenant[0].Locations.filter(location => location.Id === locationId);
                        if (loc.length > 0) {
                            let newLoc: Location = new Location(loc[0]);
                            return newLoc;
                        }
                    }
                }
            }
        }
        return null;
    }

    getTenantName(tenantID: string): string {
        let name: string = "";
        let tenant = this.getTenant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    }

    getTenantLocationAddr(tenantID: string, locID: string): string {
        let addr: string = "";
        let loc = this.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    }

    getTenantLocationName(tenantID: string, locID: string): string {
        let name: string = "";
        let loc = this.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    }

    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    getSelectedTimeframe(): FilterTimeframe {
        return this.selectedTimeframe;
    }

    getSelectedTimeframeString(selTimeFrame: FilterTimeframe): string {
        let timeframeStr: string = '';

        switch (selTimeFrame) {
            case FilterTimeframe.Current:
                timeframeStr = "Current Conditions";
                break;
            case FilterTimeframe.EightHours:
                timeframeStr = "Last 8 hours";
                break;
            case FilterTimeframe.TwelveHours:
                timeframeStr = "Last 12 hours";
                break;
            case FilterTimeframe.TwentyFourHours:
                timeframeStr = "Last 24 hours";
                break;
            case FilterTimeframe.LastWeek:
                timeframeStr = "Last Week";
                break;
            case FilterTimeframe.Custom: //test this
                timeframeStr = "";
                break;
            default:
                timeframeStr = "";
                break;
        }
        return timeframeStr;
    }

    setSelectedTimeframe(): void {
        this.selectedTimeframe = parseInt(reportSelectedTimeframe);
    }

    loadCustomDateTimes(): void {
        if (reportExportStartTime > 0)
            this.customStartDateTime = new Date(reportExportStartTime);
        if (reportExportEndTime > 0)
            this.customEndDateTime = new Date(reportExportEndTime);
    }

    ///////////////////////////////////////////
    //Alarm Methods
    ///////////////////////////////////////////
    loadAlarms(): any {
        this.alarms = [];
        for (let alarm of reportAlarms) {
            this.alarms.push(new Alarm(alarm));
        }
    }

    loadAlarmFilters() {
        if ((reportCriteria) && (reportReportType == "Alarm")) {
            this.alarmFilterPrioritySelection = parseInt(reportCriteria["Priority"]);
            this.alarmFilterOperatorSelection = reportCriteria["Operator"];
            this.alarmFilterDescriptionSelection = reportCriteria["Description"];
            this.alarmFilterStateSelection = parseInt(reportCriteria["Status"]);
            this.alarmFilterRobotSelection = reportCriteria["Robot"];
        }
    }

    getAlarms(): Alarm[] {
        let filteredAlarms: Alarm[] = [];

        if (this.alarms) {
            //apply Location Filter
            filteredAlarms = this.locationFilterPipe.transform(this.alarms, this.selectedLocations);

            //apply any alarm criteria filters
            if ((this.alarmFilterPrioritySelection) && (this.alarmFilterPrioritySelection !== 0))
                filteredAlarms = this.alarmPriorityPipe.transform(filteredAlarms, this.alarmFilterPrioritySelection);

            if ((this.alarmFilterOperatorSelection) && (this.alarmFilterOperatorSelection !== 'All'))
                filteredAlarms = this.alarmOperatorPipe.transform(filteredAlarms, this.alarmFilterOperatorSelection);

            if ((this.alarmFilterDescriptionSelection) && (this.alarmFilterDescriptionSelection !== 'All'))
                filteredAlarms = this.alarmDescriptionPipe.transform(filteredAlarms, this.alarmFilterDescriptionSelection);

            if ((this.alarmFilterStateSelection) && (this.alarmFilterStateSelection !== 0))
                filteredAlarms = this.alarmStatePipe.transform(filteredAlarms, this.alarmFilterStateSelection);

            if ((this.alarmFilterRobotSelection) && (this.alarmFilterRobotSelection !== 'All'))
                filteredAlarms = this.alarmPlatformPipe.transform(filteredAlarms, this.alarmFilterRobotSelection);

            //sort the results by Last Updated Time
            this.genericDateSort(filteredAlarms, 'asc');
        }
        return filteredAlarms;
    }

    getFilteredAlarm(alarmID: string): Alarm {
        let alarm: Alarm;
        if (alarmID) {
            let alarms = this.getAlarms();
            let alarmArray = alarms.filter(a => a.Id === alarmID);
            if (alarmArray)
                alarm = alarmArray[0];
        }
        return alarm;
    }

    genericDateSort(list: Alarm[], sortOrder: string): void {
        list.sort(function (a, b) {
            let aDate = new Date(a.ReportedTime);
            let bDate = new Date(b.ReportedTime);
            let res = 0;

            if (aDate < bDate) {
                res = 1;
            }
            if (aDate > bDate) {
                res = -1;
            }

            if (sortOrder === 'asc') {
                res = res * -1;
            }

            return res;
        });
    }

    getAlarmPriorityDefn(priority: string): string {

        let ps: string = "";

        switch (priority) {
            case "1":
                ps = "Critical";
                break;
            case "2":
                ps = "High";
                break;
            case "3":
                ps = "Medium";
                break;
            case "4":
                ps = "Low";
                break;
            case "5":
                ps = "Normal";
                break;
            default:
                break;
        }

        return ps;
    }

    getAlarmTime(alarm: Alarm): string {
        if (!alarm || !alarm.ReportedTime) {
            return;
        }

        let result: string = ' ';

        if ((alarm.State !== 3) && (alarm.State !== 4)) {
            //this is an active alarm - diff from reported time until current
            result = moment.duration(moment().diff(alarm.ReportedTime)).humanize();
        }
        else if (alarm.State == 3) {
            //this is a cleared alarm - diff from reported time until cleared time
            if (alarm.Cleared)
                result = moment.duration(moment(alarm.ReportedTime).diff(alarm.Cleared.Timestamp)).humanize();
        }
        else if (alarm.State == 4) {
            //this is a dismissed alarm - diff from reported time until dismissed time
            if (alarm.Dismissed)
                result = moment.duration(moment(alarm.ReportedTime).diff(alarm.Dismissed.Timestamp)).humanize();
        }

        if (result.includes('second')) {
            return 'now';
        }
        result = result.replace('year', 'yr');
        result = result.replace('month', 'mth');
        result = result.replace('hour', 'hr');
        result = result.replace('minute', 'min');
        result = result.replace('an ', '1 ');
        result = result.replace('a ', '1 ');
        return result;
    }

    getDateDisplay(date: string, dateOnly?: boolean): string {
        return this.convertDateDisplay(date, dateOnly);
    }

    convertDateDisplay(date: string, dateOnly?: boolean): string {
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

    convertUsernameToInitials(userId: string): string {
        if (!userId) {
            return '';
        }

        let retVal = '';
        let splitStr = userId.split(' ');
        $.each(splitStr, function (i, str) {
            if (i === 0 || i === splitStr.length - 1) {
                let val = str.split('');
                retVal += val[0];
            }
        });
        return retVal.toUpperCase();
    }

    loadAlarmsByIds(alarmIds: string[]): Promise<any> {
        let alarms: Alarm[] = [];
        let url = this.alarmApiBaseUrl + '?ids=' + alarmIds[0];

        if (alarmIds.length > 0) {
            for (let i in alarmIds) {
                url += '&ids=' + alarmIds[i];
            }
        }

        return this.httpService.get(url);
    }

    ///////////////////////////////////////////
    //Platform Methods
    ///////////////////////////////////////////
    loadPlatforms() {
        this.platforms = [];
        for (let platform of reportPlatforms) {
            this.platforms.push(new Platform(platform));
        }
    }

    getPlatform(platformID: string): Platform {
        let platform: Platform = null;
        if (platformID) {
            platform = this.platforms.filter(p => p.id === platformID)[0];
        }
        return platform;
    }

    getPlatformName(platformID: string): string {
        let name: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    }

    getPlatformStatusClass(platform: Platform): string {

        if (!platform || !platform.State) {
            return 'platform-disabled';
        }

        switch (platform.State.PlatformMode) {
            case PlatformMode.Unknown:
            case PlatformMode.Inactive:
            case PlatformMode.Offline:
                return 'platform-disabled';
            case PlatformMode.Estop:
            case PlatformMode.EstopPhysical:
            case PlatformMode.MandatoryCharge:
                return 'platform-failed';
            case PlatformMode.Error:
                switch (platform.State.ErrorState) {
                    case ErrorState.Unknown:
                    case ErrorState.SystemCommunication:
                    case ErrorState.HardwareSoftware:
                    case ErrorState.GatewayCommunication:
                    case ErrorState.PlatformCommunication:
                    case ErrorState.Lost:
                    case ErrorState.MapConfiguration:
                        return 'platform-error';
                }
        }

        if (platform.BatteryPercentage < 10) {
            return 'platform-failed';
        } else if (platform.BatteryPercentage < 20) {
            return 'platform-error';
        }

        return 'platform-healthy';
    }

    getPlatformStatusIcon(platformID: string): string {
        let icon: string = '';

        if (platformID) {
            let platform: Platform = this.getPlatform(platformID);
            if (platform) {
                icon = this.platformService.getPlatformIconSrc(platform);
                //UX doesn't want to show pending icon twice - want to show healthy icon instead
                if (icon.includes('patrol-pending'))
                    icon = '/Content/Images/Platforms/' + platform.Manufacturer + '-healthy.png';
            }
        }
        return icon;
    }

    getPlatformStatusText(platformID: string): string {
        let statusText: string = '';

        if (platformID) {
            let platform: Platform = this.getPlatform(platformID);
            if (platform) {
                statusText = this.platformService.getStateText(platform);
            }
        }
        //return "testing 123";
        return statusText;
    }

    getPlatformManufacturer(platformID: string): string {
        let manufacturer: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p && p[0])
                manufacturer = p[0].Manufacturer;
        }
        return manufacturer;
    }

    ///////////////////////////////////////////
    //Patrol Methods
    ///////////////////////////////////////////
    loadPatrols(): any {
        this.patrols = [];
        for (let patrol of reportPatrols) {
            this.patrols.push(new PatrolInstance(patrol));
        }
    }

    getPatrols(): PatrolInstance[] {
        let filteredPlatrolInstances: PatrolInstance[] = [];
        if (this.patrols) {
            //apply Location Filter
            filteredPlatrolInstances = this.locationFilterPipe.transform(this.patrols, this.selectedLocations);

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
            this.patrolDateSort(filteredPlatrolInstances, 'asc');
        }

        return filteredPlatrolInstances;
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
                    if (actionIncomplete.length > 0) {
                        let nextPointOrdinal: PointInstance[] = ptReached.filter(o => o.Ordinal === (pti.Ordinal + 1));
                        if (nextPointOrdinal.length > 0) {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown) {
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
            else {
                //2nd check the points that were not reached
                let ptNotReached: PointInstance[] = patrolInstance.Points.filter(pt => pt.CurrentStatus === PointStatusValues.NotReached);
                if (ptNotReached.length > 0) {
                    //check to see if any of the points not reached had actions
                    //if so, mark it checkpoint failed - Orange
                    let ptNotReachedHasActions: PointInstance[] = ptNotReached.filter(pnr => (pnr.Actions !== null && pnr.Actions.length > 0));
                    if (ptNotReachedHasActions.length > 0) {
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

    getAllPatrolsAlarms(patrols: PatrolInstance[]): Alarm[] {
        let patrolAlarms: Alarm[] = [];
        let alarmNotInService: string[] = [];

        if (patrols && patrols.length > 0) {
            let patrolInst: PatrolInstance[] = patrols.filter(p => p.AlarmIds && p.AlarmIds.length > 0);
            let alarmIDs: string[][] = patrolInst.map(function (p) {
                if (p.AlarmIds && p.AlarmIds.length > 0) {

                    let alarms: Alarm[] = [];
                    for (let aID of p.AlarmIds) {
                        let alarm = this.getFilteredAlarm(aID);
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
                                    let alarm = this.getFilteredAlarm(aID);
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
                                        let alarm = this.getFilteredAlarm(aID);
                                        if (alarm)
                                            alarms.push(alarm);
                                        else {
                                            alarmNotInService.push(aID);
                                        }
                                    }

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
        }
        return patrolAlarms;
    }

    patrolDateSort(list: PatrolInstance[], sortOrder: string): void {
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

    getAreaType(type: AreaType): string {
        if (type != null) {
            return AreaType[type].toString().toLocaleLowerCase();
        }
        return '';
    }

    getRobotsAndDronesOnPatrols(): number {
        //clear the map
        //let platformList: Platform[] = [];
        let platformIDs: string[] = [];
        let uniquePlatforms = this.patrols.map(function (p) {
            if (p.PlatformId && (!platformIDs.includes(p.PlatformId)))
                platformIDs.push(p.PlatformId);
        });

        ////get the platforms that ran the patrols
        //for (let p of platformIDs) {
        //    let platform = this.getPlatform(p);
        //    if (platform) {
        //        platformList.push(platform);
        //    }
        //}

        return platformIDs.length;
    }

    ///////////////////////////////////////////
    //Patrol Template Methods
    ///////////////////////////////////////////
    loadPatrolTemplates(): any {
        this.patrolTemplates = [];
        for (let pt of reportPatrolTemplates) {
            this.patrolTemplates.push(new PatrolTemplate(pt));
        }
    }

    getPatrolTemplates(): PatrolTemplate[] {
        let filteredPlatrolTemplates: PatrolTemplate[] = [];

        if (this.patrolTemplates) {
            //apply Location Filter
            let selectedLocations = this.selectedLocations;
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
}