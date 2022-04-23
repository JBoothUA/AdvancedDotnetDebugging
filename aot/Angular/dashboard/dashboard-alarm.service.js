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
import { Alarm } from '../alarms/alarm.class';
import { FilterTimeframe } from './dashboard';
import { AppSettings } from '../shared/app-settings';
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
var DashboardAlarmService = /** @class */ (function (_super) {
    __extends(DashboardAlarmService, _super);
    function DashboardAlarmService(httpService, alarmService, dashboardService, locationFilterPipe, alarmPriorityPipe, alarmOperatorPipe, alarmDescriptionPipe, alarmStatePipe, alarmPlatformPipe, userService, appSettings, hubService) {
        var _this = _super.call(this, httpService, userService, locationFilterPipe, appSettings, hubService) || this;
        _this.httpService = httpService;
        _this.alarmService = alarmService;
        _this.dashboardService = dashboardService;
        _this.locationFilterPipe = locationFilterPipe;
        _this.alarmPriorityPipe = alarmPriorityPipe;
        _this.alarmOperatorPipe = alarmOperatorPipe;
        _this.alarmDescriptionPipe = alarmDescriptionPipe;
        _this.alarmStatePipe = alarmStatePipe;
        _this.alarmPlatformPipe = alarmPlatformPipe;
        _this.userService = userService;
        _this.appSettings = appSettings;
        _this.hubService = hubService;
        _this.alarms = null; //current alarms in the system
        _this.alarmOperatorSelected = false;
        _this.alarmOperatorFilter = '';
        _this.alarmRangeApiBaseUrl = '/alarms/range';
        //filter panel criteria
        _this.alarmFilterPrioritySelection = 0;
        _this.alarmFilterOperatorSelection = 'All';
        _this.alarmFilterDescriptionSelection = 'All';
        _this.alarmFilterStateSelection = 0;
        _this.alarmFilterRobotSelection = 'All';
        _this.alarmFilterCriteriaTotalCount = 0;
        _this.selectedAlarmIndex = -1;
        _this.selectedAlarm = null;
        _this.updateAlarmData = new Subject();
        _this.onAlarmsLoaded = new Subject();
        _this.onNewAlarm = new Subject();
        _this.onEditAlarm = new Subject();
        _this.onRemoveAlarm = new Subject();
        _this.onLOISelected = new Subject();
        _this.filterCriteriaChanged = new Subject();
        _this.timeframeUpdate = new Subject();
        _this.alarmSelected = new Subject();
        _this.alarmRemoved = new Subject();
        // Subscribe to get alarm notifications
        _this.alarmService.alarmsLoaded
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (status) {
                if (status) {
                    _this.setAlarms();
                }
            }
        });
        _this.alarmService.newAlarm
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleNewAlarm(alarm); }
        });
        _this.alarmService.editedAlarm
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleEditAlarm(alarm); }
        });
        _this.alarmService.removedAlarm
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleRemoveAlarm(alarm); }
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
            next: function () { return _this.updateAlarmdByTimeframe(); }
        });
        return _this;
        //this.updateAlarmdByTimeframe();
    }
    DashboardAlarmService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ///////////////////////////////////////////
    //Notification Methods
    ///////////////////////////////////////////
    DashboardAlarmService.prototype.setAlarms = function () {
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
    };
    DashboardAlarmService.prototype.handleNewAlarm = function (alarm) {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onNewAlarm.next(alarm);
            }
        }
    };
    DashboardAlarmService.prototype.handleEditAlarm = function (alarm) {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                this.onEditAlarm.next(alarm);
            }
        }
    };
    DashboardAlarmService.prototype.handleRemoveAlarm = function (alarm) {
        if (alarm) {
            if (this.dashboardService.getSelectedTimeframe() === FilterTimeframe.Current) {
                //this.alarmRemoved.next(alarm);
                this.onRemoveAlarm.next(alarm);
            }
        }
    };
    DashboardAlarmService.prototype.handleLocationChanged = function () {
        if (this.alarms)
            this.updateAlarmData.next();
    };
    //////////////////////////////////////////////
    //Methods that Effect Other Dashboard Components
    //////////////////////////////////////////////
    DashboardAlarmService.prototype.updateAlarmdByTimeframe = function () {
        var _this = this;
        var startTime;
        var endTime;
        var url;
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
                this.httpService.get(url).then(function (historyAlarms) {
                    _this.alarms = [];
                    for (var _i = 0, historyAlarms_1 = historyAlarms; _i < historyAlarms_1.length; _i++) {
                        var alarm = historyAlarms_1[_i];
                        _this.alarms.push(new Alarm(alarm));
                    }
                    _this.updateTenantPriority();
                    _this.clearAlarmFilters(false);
                    _this.updateAlarmData.next();
                    console.log('Last 8 Hours Alarms (' + _this.alarms.length + ')', _this.alarms);
                });
                break;
            case FilterTimeframe.TwelveHours:
                startTime = this.dashboardService.getTimeFrameStartTime(12, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyAlarms) {
                    _this.alarms = [];
                    for (var _i = 0, historyAlarms_2 = historyAlarms; _i < historyAlarms_2.length; _i++) {
                        var alarm = historyAlarms_2[_i];
                        _this.alarms.push(new Alarm(alarm));
                    }
                    _this.updateTenantPriority();
                    _this.clearAlarmFilters(false);
                    _this.updateAlarmData.next();
                    console.log('Last 12 Hours Alarms (' + _this.alarms.length + ')', _this.alarms);
                });
                break;
            case FilterTimeframe.TwentyFourHours:
                startTime = this.dashboardService.getTimeFrameStartTime(24, 'hours');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyAlarms) {
                    _this.alarms = [];
                    for (var _i = 0, historyAlarms_3 = historyAlarms; _i < historyAlarms_3.length; _i++) {
                        var alarm = historyAlarms_3[_i];
                        _this.alarms.push(new Alarm(alarm));
                    }
                    _this.updateTenantPriority();
                    _this.clearAlarmFilters(false);
                    _this.updateAlarmData.next();
                    console.log('Last 24 Hours Alarms (' + _this.alarms.length + ')', _this.alarms);
                });
                break;
            case FilterTimeframe.LastWeek:
                startTime = this.dashboardService.getTimeFrameStartTime(1, 'weeks');
                endTime = this.dashboardService.getTimeFrameEndTime();
                this.exportStartDateTime = startTime.valueOf();
                this.exportEndDateTime = endTime.valueOf();
                url = this.alarmRangeApiBaseUrl + '?startDate=' + startTime.toJSON() + '&endDate=' + endTime.toJSON();
                this.httpService.get(url).then(function (historyAlarms) {
                    _this.alarms = [];
                    for (var _i = 0, historyAlarms_4 = historyAlarms; _i < historyAlarms_4.length; _i++) {
                        var alarm = historyAlarms_4[_i];
                        _this.alarms.push(new Alarm(alarm));
                    }
                    _this.updateTenantPriority();
                    _this.clearAlarmFilters(false);
                    _this.updateAlarmData.next();
                    console.log('Last 24 Hours Alarms (' + _this.alarms.length + ')', _this.alarms);
                });
                break;
            case FilterTimeframe.Custom:
                if ((this.dashboardService.customStartDateTime) || (this.dashboardService.customEndDateTime)) {
                    var startTimeStr = '';
                    var endTimeStr = '';
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
                    this.httpService.get(url).then(function (historyAlarms) {
                        _this.alarms = [];
                        for (var _i = 0, historyAlarms_5 = historyAlarms; _i < historyAlarms_5.length; _i++) {
                            var alarm = historyAlarms_5[_i];
                            _this.alarms.push(new Alarm(alarm));
                        }
                        _this.updateTenantPriority();
                        _this.clearAlarmFilters(false);
                        _this.updateAlarmData.next();
                        console.log('Custom Date Range Alarms (' + _this.alarms.length + ')', _this.alarms);
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
    };
    DashboardAlarmService.prototype.updateTenantPriority = function () {
        if (this.alarms) {
            var alarms = this.alarms;
            var cust = this.dashboardService.getAllTenantLocations();
            if (cust) {
                var _loop_1 = function (c) {
                    var _loop_2 = function (l) {
                        var lPriorityAlarms = alarms.filter(function (a) { return ((a.TenantId === c.Id) && (a.LocationId === l.Id)); });
                        var lPriority = 0;
                        if (lPriorityAlarms.filter(function (a) { return a.Priority === 1; }).length > 0)
                            lPriority = 1;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 2; }).length > 0) && (lPriority === 0))
                            lPriority = 2;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 3; }).length > 0) && (lPriority === 0))
                            lPriority = 3;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 4; }).length > 0) && (lPriority === 0))
                            lPriority = 4;
                        else if (lPriority === 0)
                            lPriority = 5; //5 means the location is in a normal state with no alarms
                        l.Priority = lPriority.toString();
                    };
                    for (var _i = 0, _a = c.Locations; _i < _a.length; _i++) {
                        var l = _a[_i];
                        _loop_2(l);
                    }
                };
                for (var _i = 0, cust_1 = cust; _i < cust_1.length; _i++) {
                    var c = cust_1[_i];
                    _loop_1(c);
                }
            }
        }
    };
    DashboardAlarmService.prototype.getAlarms = function () {
        var filteredAlarms = [];
        if (this.alarms) {
            //apply Location Filter
            var selectedLocations = this.dashboardService.getSelectedLocationIDs();
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
    };
    DashboardAlarmService.prototype.getFilterAlarms = function () {
        var filteredAlarms = [];
        if (this.alarms) {
            //apply Location Filter
            var selectedLocations = this.dashboardService.getSelectedLocationIDs();
            filteredAlarms = this.locationFilterPipe.transform(this.alarms, selectedLocations);
            this.genericDateSort(filteredAlarms, 'asc');
        }
        return filteredAlarms;
    };
    DashboardAlarmService.prototype.loadAlarmsByIds = function (alarmIds) {
        return this.alarmService.loadAlarmsByIds(alarmIds);
    };
    DashboardAlarmService.prototype.getFilteredAlarm = function (alarmID) {
        var alarm;
        if (alarmID) {
            var alarms = this.getAlarms();
            var alarmArray = alarms.filter(function (a) { return a.Id === alarmID; });
            if (alarmArray)
                alarm = alarmArray[0];
        }
        return alarm;
    };
    DashboardAlarmService.prototype.genericDateSort = function (list, sortOrder) {
        list.sort(function (a, b) {
            var aDate = new Date(a.ReportedTime);
            var bDate = new Date(b.ReportedTime);
            var res = 0;
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
    };
    DashboardAlarmService.prototype.getAlarmPriorityDefn = function (priority) {
        var ps = "";
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
    };
    DashboardAlarmService.prototype.getDateDisplay = function (date, dateOnly) {
        return this.alarmService.convertDateDisplay(date, false);
    };
    DashboardAlarmService.prototype.getAlarmTime = function (alarm) {
        if (!alarm || !alarm.ReportedTime) {
            return;
        }
        var result = ' ';
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
    };
    DashboardAlarmService.prototype.selectAlarm = function (id, mapContext, notifySelected, alarm) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        if (alarm === void 0) { alarm = null; }
        //let index = this.indexOf(id);
        var index = -1;
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
            alarm = this.alarms.filter(function (a) { return a.Id === id; })[0];
            //this.selectedAlarmIndex = index;
            alarm.Selected = true;
            this.selectedAlarm = alarm;
        }
        this.selectOverlapAlarm(id);
        this.selectionChanged.next(mapContext);
        if (notifySelected) {
            this.alarmSelected.next(id);
        }
    };
    DashboardAlarmService.prototype.selectOnlyAlarm = function (id, mapContext, notifySelected) {
        if (mapContext === void 0) { mapContext = false; }
        if (notifySelected === void 0) { notifySelected = true; }
        var index = -1;
        index = this.indexOf(id);
        if (index === -1) {
            return;
        }
        var alarm = this.alarms.filter(function (a) { return a.Id === id; })[0];
        if (this.selectedAlarm) {
            this.deSelectAlarm(this.selectedAlarm.Id, false);
            this.selectedAlarm = null;
        }
        this.selectAlarm(alarm.Id, false, true, alarm);
    };
    DashboardAlarmService.prototype.setSelectedAlarmIndex = function (index) {
        this.selectedAlarmIndex = index;
    };
    DashboardAlarmService.prototype.getSelectedAlarmIndex = function () {
        return this.selectedAlarmIndex;
    };
    DashboardAlarmService.prototype.convertUsernameToInitials = function (username) {
        return this.alarmService.convertUsernameToInitials(username);
    };
    DashboardAlarmService.prototype.getSelectedOperator = function () {
        return this.alarmOperatorSelected;
    };
    DashboardAlarmService.prototype.setSelectedOperator = function (flag) {
        this.alarmOperatorSelected = flag;
    };
    DashboardAlarmService.prototype.getOperatorFilter = function () {
        return this.alarmOperatorFilter;
    };
    DashboardAlarmService.prototype.setOperatorFilter = function (operatorName) {
        this.alarmOperatorFilter = operatorName;
    };
    DashboardAlarmService.prototype.setAlarmFilter = function (filter, value) {
        switch (filter) {
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
    };
    DashboardAlarmService.prototype.clearAlarmFilters = function (notify) {
        this.alarmFilterPrioritySelection = 0;
        this.alarmFilterOperatorSelection = 'All';
        this.alarmFilterDescriptionSelection = 'All';
        this.alarmFilterStateSelection = 0;
        this.alarmFilterRobotSelection = 'All';
        if (notify)
            this.filterCriteriaChanged.next();
    };
    DashboardAlarmService.prototype.indexOf = function (id) {
        for (var i = 0; i < this.alarms.length; i++) {
            if (this.alarms[i].Id === id) {
                return i;
            }
        }
        return -1;
    };
    DashboardAlarmService.prototype.setLOIFilter = function (loiData) {
        this.onLOISelected.next(loiData);
    };
    ///////////////////////////////////////////
    //Overwritten Patrol Service Methods
    ///////////////////////////////////////////
    DashboardAlarmService.prototype.loadAlarms = function () {
        //over written
    };
    DashboardAlarmService.prototype.handleMessage = function (message) {
    };
    DashboardAlarmService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            AlarmService,
            DashboardService,
            LocationFilterPipe,
            AlarmPriorityPipe,
            AlarmOperatorPipe,
            AlarmDescriptionPipe,
            AlarmStatePipe,
            AlarmPlatformPipe,
            UserService,
            AppSettings,
            HubService])
    ], DashboardAlarmService);
    return DashboardAlarmService;
}(AlarmService));
export { DashboardAlarmService };
//# sourceMappingURL=dashboard-alarm.service.js.map