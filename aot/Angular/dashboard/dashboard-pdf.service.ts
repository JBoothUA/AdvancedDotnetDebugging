declare let reportAlarms: any;
declare let reportPlatforms: any;
declare let reportSelectedLocationIDs: string[];
declare let reportCriteria: any;
declare let reportReportType: string;
declare let reportSelectedTimeframe: string;
declare let reportExportStartTime: number;
declare let reportExportEndTime: number;

import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Subject } from 'rxjs/Subject';

import { UserService } from '../shared/user.service';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe, TenantLocation } from './dashboard';
import { Platform, PlatformMode, ErrorState } from './../platforms/platform.class';
import { Alarm } from '../alarms/alarm.class';
import { AppSettings } from '../shared/app-settings';

import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';

import { AlarmService } from '../alarms/alarm.service';
import { HttpService } from '../shared/http.service';
import { HubService } from '../shared/hub.service';

interface PlatformState {
    Id: string;
    Selected: boolean;
    Expanded: boolean;
}

@Injectable()
export class DashboardPDFService extends AlarmService {
    platforms: Platform[] = [];
    alarms: Alarm[] = [];

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

    constructor(private alarmPriorityPipe: AlarmPriorityPipe,
        private alarmOperatorPipe: AlarmOperatorPipe,
        private alarmDescriptionPipe: AlarmDescriptionPipe,
        private alarmStatePipe: AlarmStatePipe,
        private alarmPlatformPipe: AlarmPlatformPipe,
        protected locationFilterPipe: LocationFilterPipe,
        protected userService: UserService,
        protected httpService: HttpService,
        protected appSettings: AppSettings,
        protected hubService: HubService) {

        super(httpService, userService, locationFilterPipe, appSettings, hubService);

        this.loadTenants();
        this.loadSelectedLocationsIDs();
        this.loadAlarms();
        this.loadPlatforms();
        this.loadAlarmFilters();
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
        for (let alarm of reportAlarms)
        {
            this.alarms.push(new Alarm(alarm));
        }
    }

    loadAlarmFilters(){
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

    getPlatformName(platformID: string): string {
        let name: string = "";
        if (platformID) {
            let p = this.platforms.filter(p => p.id === platformID);
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    }

    getPlatform(platformID: string): Platform {
        let platform: Platform = null;
        if (platformID) {
            platform = this.platforms.filter(p => p.id === platformID)[0];
        }
        return platform;
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
}