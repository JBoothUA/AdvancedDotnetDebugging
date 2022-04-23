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
import * as moment from 'moment';
import { UserService } from '../shared/user.service';
import { Tenant } from '../shared/tenant.class';
import { Location } from '../shared/location.class';
import { FilterTimeframe } from './dashboard';
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
var DashboardPDFService = /** @class */ (function (_super) {
    __extends(DashboardPDFService, _super);
    function DashboardPDFService(alarmPriorityPipe, alarmOperatorPipe, alarmDescriptionPipe, alarmStatePipe, alarmPlatformPipe, locationFilterPipe, userService, httpService, appSettings, hubService) {
        var _this = _super.call(this, httpService, userService, locationFilterPipe, appSettings, hubService) || this;
        _this.alarmPriorityPipe = alarmPriorityPipe;
        _this.alarmOperatorPipe = alarmOperatorPipe;
        _this.alarmDescriptionPipe = alarmDescriptionPipe;
        _this.alarmStatePipe = alarmStatePipe;
        _this.alarmPlatformPipe = alarmPlatformPipe;
        _this.locationFilterPipe = locationFilterPipe;
        _this.userService = userService;
        _this.httpService = httpService;
        _this.appSettings = appSettings;
        _this.hubService = hubService;
        _this.platforms = [];
        _this.alarms = [];
        _this.tenants = [];
        _this.selectedLocations = [];
        _this.selectedTimeframe = FilterTimeframe.None;
        _this.locationHeader = '';
        _this.view = 'dashboard';
        _this.alarmFilterPrioritySelection = 0;
        _this.alarmFilterOperatorSelection = 'All';
        _this.alarmFilterDescriptionSelection = 'All';
        _this.alarmFilterStateSelection = 0;
        _this.alarmFilterRobotSelection = 'All';
        _this.alarmApiBaseUrl = '/alarms/';
        _this.loadTenants();
        _this.loadSelectedLocationsIDs();
        _this.loadAlarms();
        _this.loadPlatforms();
        _this.loadAlarmFilters();
        _this.setSelectedTimeframe();
        _this.loadCustomDateTimes();
        return _this;
    }
    ///////////////////////////////////////////
    //Tenant Methods
    ///////////////////////////////////////////
    DashboardPDFService.prototype.loadTenants = function () {
        this.tenants = [];
        var t = this.userService.currentUser.tenant;
        var ct = this.userService.currentUser.childTenants;
        if (t != null) {
            var parentTenant = new Tenant(t);
            this.tenants.push(parentTenant);
        }
        if (ct != null) {
            for (var _i = 0, ct_1 = ct; _i < ct_1.length; _i++) {
                var cTenant = ct_1[_i];
                var childTenant = new Tenant(cTenant);
                this.tenants.push(childTenant);
            }
        }
    };
    DashboardPDFService.prototype.loadSelectedLocationsIDs = function () {
        this.selectedLocations = reportSelectedLocationIDs;
    };
    DashboardPDFService.prototype.getTenant = function (tenantId) {
        if (tenantId) {
            if (this.tenants) {
                var tentant = this.tenants.filter(function (t) { return t.Id === tenantId; });
                if (tentant.length > 0) {
                    var newTenant = new Tenant(tentant[0]);
                    return newTenant;
                }
            }
        }
        return null;
    };
    DashboardPDFService.prototype.getLocation = function (tenantId, locationId) {
        if (tenantId && locationId) {
            if (this.tenants && this.tenants.length > 0) {
                var tenant = this.tenants.filter(function (t) { return t.Id === tenantId; });
                if (tenant.length > 0) {
                    if (tenant[0].Locations && tenant[0].Locations.length > 0) {
                        var loc = tenant[0].Locations.filter(function (location) { return location.Id === locationId; });
                        if (loc.length > 0) {
                            var newLoc = new Location(loc[0]);
                            return newLoc;
                        }
                    }
                }
            }
        }
        return null;
    };
    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    DashboardPDFService.prototype.getSelectedTimeframe = function () {
        return this.selectedTimeframe;
    };
    DashboardPDFService.prototype.getSelectedTimeframeString = function (selTimeFrame) {
        var timeframeStr = '';
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
            case FilterTimeframe.Custom://test this
                timeframeStr = "";
                break;
            default:
                timeframeStr = "";
                break;
        }
        return timeframeStr;
    };
    DashboardPDFService.prototype.setSelectedTimeframe = function () {
        this.selectedTimeframe = parseInt(reportSelectedTimeframe);
    };
    DashboardPDFService.prototype.loadCustomDateTimes = function () {
        if (reportExportStartTime > 0)
            this.customStartDateTime = new Date(reportExportStartTime);
        if (reportExportEndTime > 0)
            this.customEndDateTime = new Date(reportExportEndTime);
    };
    ///////////////////////////////////////////
    //Alarm Methods
    ///////////////////////////////////////////
    DashboardPDFService.prototype.loadAlarms = function () {
        this.alarms = [];
        for (var _i = 0, reportAlarms_1 = reportAlarms; _i < reportAlarms_1.length; _i++) {
            var alarm = reportAlarms_1[_i];
            this.alarms.push(new Alarm(alarm));
        }
    };
    DashboardPDFService.prototype.loadAlarmFilters = function () {
        if ((reportCriteria) && (reportReportType == "Alarm")) {
            this.alarmFilterPrioritySelection = parseInt(reportCriteria["Priority"]);
            this.alarmFilterOperatorSelection = reportCriteria["Operator"];
            this.alarmFilterDescriptionSelection = reportCriteria["Description"];
            this.alarmFilterStateSelection = parseInt(reportCriteria["Status"]);
            this.alarmFilterRobotSelection = reportCriteria["Robot"];
        }
    };
    DashboardPDFService.prototype.getAlarms = function () {
        var filteredAlarms = [];
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
    };
    DashboardPDFService.prototype.getFilteredAlarm = function (alarmID) {
        var alarm;
        if (alarmID) {
            var alarms = this.getAlarms();
            var alarmArray = alarms.filter(function (a) { return a.Id === alarmID; });
            if (alarmArray)
                alarm = alarmArray[0];
        }
        return alarm;
    };
    DashboardPDFService.prototype.genericDateSort = function (list, sortOrder) {
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
    DashboardPDFService.prototype.getAlarmPriorityDefn = function (priority) {
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
    DashboardPDFService.prototype.getAlarmTime = function (alarm) {
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
    DashboardPDFService.prototype.getDateDisplay = function (date, dateOnly) {
        return this.convertDateDisplay(date, dateOnly);
    };
    DashboardPDFService.prototype.convertDateDisplay = function (date, dateOnly) {
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
    DashboardPDFService.prototype.convertUsernameToInitials = function (userId) {
        if (!userId) {
            return '';
        }
        var retVal = '';
        var splitStr = userId.split(' ');
        $.each(splitStr, function (i, str) {
            if (i === 0 || i === splitStr.length - 1) {
                var val = str.split('');
                retVal += val[0];
            }
        });
        return retVal.toUpperCase();
    };
    DashboardPDFService.prototype.loadAlarmsByIds = function (alarmIds) {
        var alarms = [];
        var url = this.alarmApiBaseUrl + '?ids=' + alarmIds[0];
        if (alarmIds.length > 0) {
            for (var i in alarmIds) {
                url += '&ids=' + alarmIds[i];
            }
        }
        return this.httpService.get(url);
    };
    ///////////////////////////////////////////
    //Platform Methods
    ///////////////////////////////////////////
    DashboardPDFService.prototype.loadPlatforms = function () {
        this.platforms = [];
        for (var _i = 0, reportPlatforms_1 = reportPlatforms; _i < reportPlatforms_1.length; _i++) {
            var platform = reportPlatforms_1[_i];
            this.platforms.push(new Platform(platform));
        }
    };
    DashboardPDFService.prototype.getPlatformName = function (platformID) {
        var name = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    };
    DashboardPDFService.prototype.getPlatform = function (platformID) {
        var platform = null;
        if (platformID) {
            platform = this.platforms.filter(function (p) { return p.id === platformID; })[0];
        }
        return platform;
    };
    DashboardPDFService.prototype.getPlatformStatusClass = function (platform) {
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
        }
        else if (platform.BatteryPercentage < 20) {
            return 'platform-error';
        }
        return 'platform-healthy';
    };
    DashboardPDFService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AlarmPriorityPipe,
            AlarmOperatorPipe,
            AlarmDescriptionPipe,
            AlarmStatePipe,
            AlarmPlatformPipe,
            LocationFilterPipe,
            UserService,
            HttpService,
            AppSettings,
            HubService])
    ], DashboardPDFService);
    return DashboardPDFService;
}(AlarmService));
export { DashboardPDFService };
//# sourceMappingURL=dashboard-pdf.service.js.map