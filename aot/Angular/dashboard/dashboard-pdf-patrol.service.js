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
import { FilterTimeframe, PatrolStatus } from './dashboard';
import { Platform, PlatformMode, ErrorState } from './../platforms/platform.class';
import { Alarm } from '../alarms/alarm.class';
import { PatrolInstance, PatrolStatusValues, PatrolTemplate, AreaType } from "../patrols/patrol.class";
import { PointStatusValues } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';
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
import { HttpService } from '../shared/http.service';
import { HubService } from '../shared/hub.service';
var DashboardPDFPatrolService = /** @class */ (function (_super) {
    __extends(DashboardPDFPatrolService, _super);
    function DashboardPDFPatrolService(patrolService, platformService, alarmPriorityPipe, alarmOperatorPipe, alarmDescriptionPipe, alarmStatePipe, alarmPlatformPipe, patrolAlarmPriorityPipe, patrolStatusPipe, patrolRobotDronePipe, patrolDisplayNamePipe, patrolOperatorPipe, locationFilterPipe, locationFilterService, userService, httpService, appSettings, hubService) {
        var _this = _super.call(this, httpService, userService, locationFilterService, hubService) || this;
        _this.patrolService = patrolService;
        _this.platformService = platformService;
        _this.alarmPriorityPipe = alarmPriorityPipe;
        _this.alarmOperatorPipe = alarmOperatorPipe;
        _this.alarmDescriptionPipe = alarmDescriptionPipe;
        _this.alarmStatePipe = alarmStatePipe;
        _this.alarmPlatformPipe = alarmPlatformPipe;
        _this.patrolAlarmPriorityPipe = patrolAlarmPriorityPipe;
        _this.patrolStatusPipe = patrolStatusPipe;
        _this.patrolRobotDronePipe = patrolRobotDronePipe;
        _this.patrolDisplayNamePipe = patrolDisplayNamePipe;
        _this.patrolOperatorPipe = patrolOperatorPipe;
        _this.locationFilterPipe = locationFilterPipe;
        _this.locationFilterService = locationFilterService;
        _this.userService = userService;
        _this.httpService = httpService;
        _this.appSettings = appSettings;
        _this.hubService = hubService;
        _this.platforms = [];
        _this.alarms = [];
        _this.patrols = [];
        _this.patrolTemplates = [];
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
        //filter panel criteria
        _this.patrolFilterAlarmPrioritySelection = 0;
        _this.patrolFilterOperatorSelection = 'All';
        _this.patrolFilterPatrolDisplayNameSelection = 'All';
        _this.patrolFilterStatusSelection = 4;
        _this.patrolFilterRobotSelection = 'All';
        _this.patrolFilterCriteriaTotalCount = 0;
        _this.loadTenants();
        _this.loadSelectedLocationsIDs();
        _this.loadAlarms();
        _this.loadPlatforms();
        _this.loadPatrols();
        _this.loadPatrolTemplates();
        _this.loadAlarmFilters();
        //this.loadPatrolFilters();
        _this.setSelectedTimeframe();
        _this.loadCustomDateTimes();
        return _this;
    }
    ///////////////////////////////////////////
    //Tenant Methods
    ///////////////////////////////////////////
    DashboardPDFPatrolService.prototype.loadTenants = function () {
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
    DashboardPDFPatrolService.prototype.loadSelectedLocationsIDs = function () {
        this.selectedLocations = reportSelectedLocationIDs;
    };
    DashboardPDFPatrolService.prototype.getTenant = function (tenantId) {
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
    DashboardPDFPatrolService.prototype.getLocation = function (tenantId, locationId) {
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
    DashboardPDFPatrolService.prototype.getTenantName = function (tenantID) {
        var name = "";
        var tenant = this.getTenant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    };
    DashboardPDFPatrolService.prototype.getTenantLocationAddr = function (tenantID, locID) {
        var addr = "";
        var loc = this.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    };
    DashboardPDFPatrolService.prototype.getTenantLocationName = function (tenantID, locID) {
        var name = "";
        var loc = this.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    };
    ///////////////////////////////////////////
    //Timeframe Methods
    ///////////////////////////////////////////
    DashboardPDFPatrolService.prototype.getSelectedTimeframe = function () {
        return this.selectedTimeframe;
    };
    DashboardPDFPatrolService.prototype.getSelectedTimeframeString = function (selTimeFrame) {
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
    DashboardPDFPatrolService.prototype.setSelectedTimeframe = function () {
        this.selectedTimeframe = parseInt(reportSelectedTimeframe);
    };
    DashboardPDFPatrolService.prototype.loadCustomDateTimes = function () {
        if (reportExportStartTime > 0)
            this.customStartDateTime = new Date(reportExportStartTime);
        if (reportExportEndTime > 0)
            this.customEndDateTime = new Date(reportExportEndTime);
    };
    ///////////////////////////////////////////
    //Alarm Methods
    ///////////////////////////////////////////
    DashboardPDFPatrolService.prototype.loadAlarms = function () {
        this.alarms = [];
        for (var _i = 0, reportAlarms_1 = reportAlarms; _i < reportAlarms_1.length; _i++) {
            var alarm = reportAlarms_1[_i];
            this.alarms.push(new Alarm(alarm));
        }
    };
    DashboardPDFPatrolService.prototype.loadAlarmFilters = function () {
        if ((reportCriteria) && (reportReportType == "Alarm")) {
            this.alarmFilterPrioritySelection = parseInt(reportCriteria["Priority"]);
            this.alarmFilterOperatorSelection = reportCriteria["Operator"];
            this.alarmFilterDescriptionSelection = reportCriteria["Description"];
            this.alarmFilterStateSelection = parseInt(reportCriteria["Status"]);
            this.alarmFilterRobotSelection = reportCriteria["Robot"];
        }
    };
    DashboardPDFPatrolService.prototype.getAlarms = function () {
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
    DashboardPDFPatrolService.prototype.getFilteredAlarm = function (alarmID) {
        var alarm;
        if (alarmID) {
            var alarms = this.getAlarms();
            var alarmArray = alarms.filter(function (a) { return a.Id === alarmID; });
            if (alarmArray)
                alarm = alarmArray[0];
        }
        return alarm;
    };
    DashboardPDFPatrolService.prototype.genericDateSort = function (list, sortOrder) {
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
    DashboardPDFPatrolService.prototype.getAlarmPriorityDefn = function (priority) {
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
    DashboardPDFPatrolService.prototype.getAlarmTime = function (alarm) {
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
    DashboardPDFPatrolService.prototype.getDateDisplay = function (date, dateOnly) {
        return this.convertDateDisplay(date, dateOnly);
    };
    DashboardPDFPatrolService.prototype.convertDateDisplay = function (date, dateOnly) {
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
    DashboardPDFPatrolService.prototype.convertUsernameToInitials = function (userId) {
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
    DashboardPDFPatrolService.prototype.loadAlarmsByIds = function (alarmIds) {
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
    DashboardPDFPatrolService.prototype.loadPlatforms = function () {
        this.platforms = [];
        for (var _i = 0, reportPlatforms_1 = reportPlatforms; _i < reportPlatforms_1.length; _i++) {
            var platform = reportPlatforms_1[_i];
            this.platforms.push(new Platform(platform));
        }
    };
    DashboardPDFPatrolService.prototype.getPlatform = function (platformID) {
        var platform = null;
        if (platformID) {
            platform = this.platforms.filter(function (p) { return p.id === platformID; })[0];
        }
        return platform;
    };
    DashboardPDFPatrolService.prototype.getPlatformName = function (platformID) {
        var name = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p && p[0])
                name = p[0].DisplayName;
        }
        return name;
    };
    DashboardPDFPatrolService.prototype.getPlatformStatusClass = function (platform) {
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
    DashboardPDFPatrolService.prototype.getPlatformStatusIcon = function (platformID) {
        var icon = '';
        if (platformID) {
            var platform = this.getPlatform(platformID);
            if (platform) {
                icon = this.platformService.getPlatformIconSrc(platform);
                //UX doesn't want to show pending icon twice - want to show healthy icon instead
                if (icon.includes('patrol-pending'))
                    icon = '/Content/Images/Platforms/' + platform.Manufacturer + '-healthy.png';
            }
        }
        return icon;
    };
    DashboardPDFPatrolService.prototype.getPlatformStatusText = function (platformID) {
        var statusText = '';
        if (platformID) {
            var platform = this.getPlatform(platformID);
            if (platform) {
                statusText = this.platformService.getStateText(platform);
            }
        }
        //return "testing 123";
        return statusText;
    };
    DashboardPDFPatrolService.prototype.getPlatformManufacturer = function (platformID) {
        var manufacturer = "";
        if (platformID) {
            var p = this.platforms.filter(function (p) { return p.id === platformID; });
            if (p && p[0])
                manufacturer = p[0].Manufacturer;
        }
        return manufacturer;
    };
    ///////////////////////////////////////////
    //Patrol Methods
    ///////////////////////////////////////////
    DashboardPDFPatrolService.prototype.loadPatrols = function () {
        this.patrols = [];
        for (var _i = 0, reportPatrols_1 = reportPatrols; _i < reportPatrols_1.length; _i++) {
            var patrol = reportPatrols_1[_i];
            this.patrols.push(new PatrolInstance(patrol));
        }
    };
    DashboardPDFPatrolService.prototype.getPatrols = function () {
        var filteredPlatrolInstances = [];
        if (this.patrols) {
            //apply Location Filter
            filteredPlatrolInstances = this.locationFilterPipe.transform(this.patrols, this.selectedLocations);
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
            this.patrolDateSort(filteredPlatrolInstances, 'asc');
        }
        return filteredPlatrolInstances;
    };
    DashboardPDFPatrolService.prototype.getPatrolStatusObj = function (patrolInstance) {
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
    DashboardPDFPatrolService.prototype.convertPatrolTime = function (date, dateOnly) {
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
    DashboardPDFPatrolService.prototype.getAllPatrolsAlarms = function (patrols) {
        var patrolAlarms = [];
        var alarmNotInService = [];
        if (patrols && patrols.length > 0) {
            var patrolInst = patrols.filter(function (p) { return p.AlarmIds && p.AlarmIds.length > 0; });
            var alarmIDs = patrolInst.map(function (p) {
                if (p.AlarmIds && p.AlarmIds.length > 0) {
                    var alarms = [];
                    for (var _i = 0, _a = p.AlarmIds; _i < _a.length; _i++) {
                        var aID = _a[_i];
                        var alarm = this.getFilteredAlarm(aID);
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
                                    var alarm = this.getFilteredAlarm(aID);
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
                                        var alarm = this.getFilteredAlarm(aID);
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
                            if (ptActionAlarmIDs.length > 0)
                                alarmIDs = alarmIDs.concat(ptActionAlarmIDs);
                        }
                    }
                }
            }
        }
        return patrolAlarms;
    };
    DashboardPDFPatrolService.prototype.patrolDateSort = function (list, sortOrder) {
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
    DashboardPDFPatrolService.prototype.getAreaType = function (type) {
        if (type != null) {
            return AreaType[type].toString().toLocaleLowerCase();
        }
        return '';
    };
    DashboardPDFPatrolService.prototype.getRobotsAndDronesOnPatrols = function () {
        //clear the map
        //let platformList: Platform[] = [];
        var platformIDs = [];
        var uniquePlatforms = this.patrols.map(function (p) {
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
    };
    ///////////////////////////////////////////
    //Patrol Template Methods
    ///////////////////////////////////////////
    DashboardPDFPatrolService.prototype.loadPatrolTemplates = function () {
        this.patrolTemplates = [];
        for (var _i = 0, reportPatrolTemplates_1 = reportPatrolTemplates; _i < reportPatrolTemplates_1.length; _i++) {
            var pt = reportPatrolTemplates_1[_i];
            this.patrolTemplates.push(new PatrolTemplate(pt));
        }
    };
    DashboardPDFPatrolService.prototype.getPatrolTemplates = function () {
        var filteredPlatrolTemplates = [];
        if (this.patrolTemplates) {
            //apply Location Filter
            var selectedLocations = this.selectedLocations;
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
    DashboardPDFPatrolService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            AlarmPriorityPipe,
            AlarmOperatorPipe,
            AlarmDescriptionPipe,
            AlarmStatePipe,
            AlarmPlatformPipe,
            PatrolAlarmPriorityPipe,
            PatrolStatusPipe,
            PatrolRobotDronePipe,
            PatrolDisplayNamePipe,
            PatrolOperatorPipe,
            LocationFilterPipe,
            LocationFilterService,
            UserService,
            HttpService,
            AppSettings,
            HubService])
    ], DashboardPDFPatrolService);
    return DashboardPDFPatrolService;
}(PatrolService));
export { DashboardPDFPatrolService };
//# sourceMappingURL=dashboard-pdf-patrol.service.js.map