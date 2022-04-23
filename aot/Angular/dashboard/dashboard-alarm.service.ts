import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import { AlarmService } from '../alarms/alarm.service';
import { Alarm } from '../alarms/alarm.class';
import { FilterTimeframe, TenantLocation } from './dashboard';
import { AppSettings } from '../shared/app-settings';

import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';

import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AlarmPriorityPipe } from './alarm-priority.pipe';
import { AlarmOperatorPipe } from './alarm-operator.pipe';
import { AlarmDescriptionPipe } from './alarm-description.pipe';
import { AlarmStatePipe } from './alarm-state.pipe';
import { AlarmPlatformPipe } from './alarm-platform.pipe';

import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { HubService } from '../shared/hub.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardAlarmService extends AlarmService {
    alarms: Alarm[] = null; //current alarms in the system
    alarmOperatorSelected: boolean = false;
    alarmOperatorFilter: string = '';
    alarmRangeApiBaseUrl: string = '/alarms/range';

    //filter panel criteria
    alarmFilterPrioritySelection: number = 0;
    alarmFilterOperatorSelection: string = 'All';
    alarmFilterDescriptionSelection: string = 'All';
    alarmFilterStateSelection: number = 0;
    alarmFilterRobotSelection: string = 'All';
    alarmFilterCriteriaTotalCount: number = 0;

    selectedAlarmIndex: number = -1;
    selectedAlarm: Alarm = null;

    updateAlarmData: Subject<any> = new Subject();
    onAlarmsLoaded: Subject<any> = new Subject();
    onNewAlarm: Subject<any> = new Subject();
    onEditAlarm: Subject<any> = new Subject();
    onRemoveAlarm: Subject<any> = new Subject();
    onLOISelected: Subject<any> = new Subject();

    exportStartDateTime: number;
    exportEndDateTime: number;

    filterCriteriaChanged: Subject<any> = new Subject();
    timeframeUpdate: Subject<any> = new Subject();
    alarmSelected: Subject<any> = new Subject();
    alarmRemoved: Subject<any> = new Subject();

	constructor(protected httpService: HttpService,
        private alarmService: AlarmService,
		private dashboardService: DashboardService,
        protected locationFilterPipe: LocationFilterPipe,
        private alarmPriorityPipe: AlarmPriorityPipe,
        private alarmOperatorPipe: AlarmOperatorPipe,
        private alarmDescriptionPipe: AlarmDescriptionPipe,
        private alarmStatePipe: AlarmStatePipe,
        private alarmPlatformPipe: AlarmPlatformPipe,
        protected userService: UserService,
        protected appSettings: AppSettings,
        protected hubService: HubService) {

        super(httpService, userService, locationFilterPipe, appSettings, hubService);

        // Subscribe to get alarm notifications
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (status) => {
                    if (status) {
                        this.setAlarms();
                    }
                }

            });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleNewAlarm(alarm)
            });
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleEditAlarm(alarm)
            });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.handleRemoveAlarm(alarm)
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
                next: () => this.updateAlarmdByTimeframe()
            });

        //this.updateAlarmdByTimeframe();

    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    setAlarms(): void {
        if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
            if (this.alarmService.alarms)
                this.alarms = this.alarmService.alarms;
            else
                this.alarms = [];
            this.updateTenantPriority();
            console.log('Loaded Current Alarms (' + this.alarms.length + ')', this.alarms);
            this.onAlarmsLoaded.next();
        }
        this.dashboardService.alarmDataLoaded = true;
    }

    handleNewAlarm(alarm: Alarm): void {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onNewAlarm.next(alarm);
            }
        }
    }

    handleEditAlarm(alarm: Alarm): void {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onEditAlarm.next(alarm);
            }
        }
    }

    handleRemoveAlarm(alarm: Alarm): void {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                //this.alarmRemoved.next(alarm);
                this.onRemoveAlarm.next(alarm);
            }
        }
    }

    handleLocationChanged(): void {
        if(this.alarms)
            this.updateAlarmData.next();
    }

    //////////////////////////////////////////////
    //Methods that Effect Other Dashboard Components
    //////////////////////////////////////////////

    updateAlarmdByTimeframe(): void {
        let startTime: Date;
        let endTime: Date;
        let url: string;

        this.timeframeUpdate.next();

        switch (this.dashboardService.getSelectedTimeframe()) {
            case FilterTimeframe.Current:
                if (this.alarmService.alarms)
                    this.alarms = this.alarmService.alarms;
                else
                    this.alarms = [];
                this.exportStartDateTime = 0;
                this.exportEndDateTime = 0;
                this.updateTenantPriority();
                this.clearAlarmFilters(false);
                this.updateAlarmData.next();
                console.log('Current Alarms (' + this.alarms.length + ')', this.alarms);
                break;
            case FilterTimeframe.EightHours:
                //this is local time for now
                startTime = this.dashboardService.getTimeFrameStartTime(8, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyAlarms) => {
                    this.alarms = [];
                    for (let alarm of historyAlarms) {
                        this.alarms.push(new Alarm(alarm));
                    }
                    this.updateTenantPriority();
                    this.clearAlarmFilters(false);
                    this.updateAlarmData.next();
                    console.log('Last 8 Hours Alarms (' + this.alarms.length + ')', this.alarms);
                });
                break;
            case FilterTimeframe.TwelveHours:
                startTime = this.dashboardService.getTimeFrameStartTime(12, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyAlarms) => {
                    this.alarms = [];
                    for (let alarm of historyAlarms) {
                        this.alarms.push(new Alarm(alarm));
                    }
                    this.updateTenantPriority();
                    this.clearAlarmFilters(false);
                    this.updateAlarmData.next();
                    console.log('Last 12 Hours Alarms (' + this.alarms.length + ')', this.alarms);
                });
                break;
            case FilterTimeframe.TwentyFourHours:
                startTime = this.dashboardService.getTimeFrameStartTime(24, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyAlarms) => {
                    this.alarms = [];
                    for (let alarm of historyAlarms) {
                        this.alarms.push(new Alarm(alarm));
                    }
                    this.updateTenantPriority();
                    this.clearAlarmFilters(false);
                    this.updateAlarmData.next();
                    console.log('Last 24 Hours Alarms (' + this.alarms.length + ')', this.alarms);
                });
                break;
            case FilterTimeframe.LastWeek:
                startTime = this.dashboardService.getTimeFrameStartTime(1, 'weeks');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then((historyAlarms) => {
                    this.alarms = [];
                    for (let alarm of historyAlarms) {
                        this.alarms.push(new Alarm(alarm));
                    }
                    this.updateTenantPriority();
                    this.clearAlarmFilters(false);
                    this.updateAlarmData.next();
                    console.log('Last 24 Hours Alarms (' + this.alarms.length + ')', this.alarms);
                });
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime)) {
                    let startTimeStr: string = '';
                    let endTimeStr: string = '';
                    this.exportStartDateTime = 0;
                    this.exportEndDateTime = 0;

                    if (this.dashboardService.customStartDateTime) {
                        //startTime = moment.utc(this.dashboardService.customStartDateTime).toDate();
                        this.exportStartDateTime = moment.utc(this.dashboardService.customStartDateTime).valueOf();
                        startTimeStr = moment.utc(this.dashboardService.customStartDateTime).toJSON();
                    }

                    if (this.dashboardService.customEndDateTime) {
                        //endTime = moment.utc(this.dashboardService.customEndDateTime).utc().format();
                        this.exportEndDateTime = moment.utc(this.dashboardService.customEndDateTime).valueOf();
                        endTimeStr = moment.utc(this.dashboardService.customEndDateTime).toJSON();
                    }

                    url = this.alarmRangeApiBaseUrl + '?startDate=' + startTimeStr + '&endDate=' + endTimeStr;
                    this.httpService.get(url).then((historyAlarms) => {
                        this.alarms = [];
                        for (let alarm of historyAlarms) {
                            this.alarms.push(new Alarm(alarm));
                        }
                        this.updateTenantPriority();
                        this.clearAlarmFilters(false);
                        this.updateAlarmData.next();
                        console.log('Custom Date Range Alarms (' + this.alarms.length + ')', this.alarms);
                    });
                }
                else {
                    this.alarms = [];
                    this.updateTenantPriority();
                    this.clearAlarmFilters(false);
                    this.updateAlarmData.next();
                }
                break;
            default:
                this.alarms = [];
                this.updateTenantPriority();
                this.clearAlarmFilters(false);
                this.updateAlarmData.next();
                break;
        }
    }

    updateTenantPriority(): void {
        if (this.alarms) {
            let alarms = this.alarms;
            let cust = this.dashboardService.getAllTenantLocations();
            if (cust) {
                for (let c of cust) {
                    for (let l of c.Locations) {
                        let lPriorityAlarms: Alarm[] = alarms.filter(a => ((a.TenantId === c.Id) && (a.LocationId === l.Id)));
                        let lPriority: number = 0;
                        if (lPriorityAlarms.filter(a => a.Priority === 1).length > 0)
                            lPriority = 1;
                        else if ((lPriorityAlarms.filter(a => a.Priority === 2).length > 0) && (lPriority === 0))
                            lPriority = 2;
                        else if ((lPriorityAlarms.filter(a => a.Priority === 3).length > 0) && (lPriority === 0))
                            lPriority = 3;
                        else if ((lPriorityAlarms.filter(a => a.Priority === 4).length > 0) && (lPriority === 0))
                            lPriority = 4;
                        else if (lPriority === 0)
                            lPriority = 5; //5 means the location is in a normal state with no alarms

                        l.Priority = lPriority.toString();
                    }
                }
            }
        }
    }

    getAlarms(): Alarm[] {
        let filteredAlarms: Alarm[] = [];

        if (this.alarms) {
            //apply Location Filter
            let selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredAlarms = this.locationFilterPipe.transform(this.alarms, selectedLocations);

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

    getFilterAlarms(): Alarm[] {
        let filteredAlarms: Alarm[] = [];

        if (this.alarms) {
            //apply Location Filter
            let selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredAlarms = this.locationFilterPipe.transform(this.alarms, selectedLocations);
            this.genericDateSort(filteredAlarms, 'asc');
        }
        return filteredAlarms;
    }

    loadAlarmsByIds(alarmIds: string[]): Promise<any> {
        return this.alarmService.loadAlarmsByIds(alarmIds);
    }

    getFilteredAlarm(alarmID: string): Alarm {
        let alarm: Alarm;
        if (alarmID)
        {
            let alarms = this.getAlarms();
            let alarmArray = alarms.filter(a => a.Id === alarmID);
            if (alarmArray)
                alarm = alarmArray[0];
        }
        return alarm;
    }

    public genericDateSort(list: Alarm[], sortOrder: string): void {
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

    getDateDisplay(date: string, dateOnly?: boolean): string {
        return this.alarmService.convertDateDisplay(date, false);
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

    selectAlarm(id: string, mapContext: boolean = false, notifySelected: boolean = true, alarm: Alarm = null): void {
        //let index = this.indexOf(id);
        let index: number = -1;
        if (alarm) {
            index = this.alarms.indexOf(alarm);
            if (index === -1) {
                return;
            }

            //this.alarms[index].Selected = true;
            alarm.Selected = true;
            this.selectedAlarm = alarm;
        }
        else {
            index = this.indexOf(id);
            if (index === -1) {
                return;
            }
            alarm = this.alarms.filter(a => a.Id === id)[0];
            //this.selectedAlarmIndex = index;
            alarm.Selected = true;
            this.selectedAlarm = alarm;
        }

        this.selectOverlapAlarm(id);

        this.selectionChanged.next(mapContext);

        if (notifySelected) {
            this.alarmSelected.next(id);
        }
    }

    selectOnlyAlarm(id: string, mapContext: boolean = false, notifySelected: boolean = true): void {
        let index: number = -1;
        index = this.indexOf(id);
        if (index === -1) {
            return;
        }

        let alarm = this.alarms.filter(a => a.Id === id)[0];
		if (this.selectedAlarm) {
			this.deSelectAlarm(this.selectedAlarm.Id, false);
			this.selectedAlarm = null;
		}
        this.selectAlarm(alarm.Id, false, true, alarm);
    }

    setSelectedAlarmIndex(index: number): void {
        this.selectedAlarmIndex = index;
    }

    getSelectedAlarmIndex(): number {
        return this.selectedAlarmIndex;
    }

    convertUsernameToInitials(username: string): string {
		return this.alarmService.convertUsernameToInitials(username);
    }

    getSelectedOperator(): boolean {
        return this.alarmOperatorSelected;
    }

    setSelectedOperator(flag: boolean): void {
        this.alarmOperatorSelected = flag;
    }

    getOperatorFilter(): string {
        return this.alarmOperatorFilter;
    }

    setOperatorFilter(operatorName: string): void {
        this.alarmOperatorFilter = operatorName;
    }

    setAlarmFilter(filter: string, value: any): void {
        switch (filter)
        {
            case 'priority':
                this.alarmFilterPrioritySelection = value;
                break;
            case 'operator':
                this.alarmFilterOperatorSelection = value;
                break;
            case 'description':
                this.alarmFilterDescriptionSelection = value;
                break;
            case 'state':
                this.alarmFilterStateSelection = value;
                break;
            case 'robot':
                this.alarmFilterRobotSelection = value;
                break;
            default:
                break;
        }

        this.filterCriteriaChanged.next();
    }

    clearAlarmFilters(notify: boolean): void {
        this.alarmFilterPrioritySelection = 0;
        this.alarmFilterOperatorSelection = 'All';
        this.alarmFilterDescriptionSelection = 'All';
        this.alarmFilterStateSelection = 0;
        this.alarmFilterRobotSelection = 'All';

        if (notify)
            this.filterCriteriaChanged.next();
    }

    indexOf(id: string): number {
        for (let i = 0; i < this.alarms.length; i++) {
            if (this.alarms[i].Id === id) {
                return i;
            }
        }
        return -1;
    }

    setLOIFilter(loiData: TenantLocation): void {
        this.onLOISelected.next(loiData);
    }

    ///////////////////////////////////////////
    //Overwritten Patrol Service Methods
    ///////////////////////////////////////////
    loadAlarms(): any {
        //over written
	}

	handleMessage(message: string): void {
	}
}