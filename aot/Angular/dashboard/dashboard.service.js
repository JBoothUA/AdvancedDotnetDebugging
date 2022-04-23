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
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { FilterTimeframe, DashboardTabs } from './dashboard';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { NavigationService } from '../shared/navigation.service';
import { HttpService } from '../shared/http.service';
import { LocationFilterService } from '../shared/location-filter.service';
var DashboardService = /** @class */ (function () {
    function DashboardService(httpService, alarmService, platformService, locationFilterService, locationFilterPipe, navigationService) {
        var _this = this;
        this.httpService = httpService;
        this.alarmService = alarmService;
        this.platformService = platformService;
        this.locationFilterService = locationFilterService;
        this.locationFilterPipe = locationFilterPipe;
        this.navigationService = navigationService;
        this.selectedTenants = [];
        this.selectedTimeframe = FilterTimeframe.None;
        this.selectDashboardTab = DashboardTabs.None;
        this.locationHeader = '';
        this.view = 'dashboard';
        this.alarmDataLoaded = false;
        this.patrolDataLoaded = false;
        this.platformDataLoaded = false;
        this.locationsChanged = new Subject();
        this.onTimeframeChange = new Subject();
        this.onTimeframeChangeComplete = new Subject();
        this.alarmSelected = new Subject();
        this.onShowAlarmFilterCriteria = new Subject();
        this.onShowPatrolFilterCriteria = new Subject();
        this.onRemoveSelectedAlarmFilterCriteria = new Subject();
        this.onRemoveSelectedPatrolFilterCriteria = new Subject();
        this.onDashboardTabChanged = new Subject();
        this.onLeftPanelToggled = new Subject();
        this.ngUnsubscribe = new Subject();
        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) { return _this.setSelectedTenants(view); }
        });
        this.navigationService.onMainMenuToggled
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.onLeftPanelToggled.next(); }
        });
        if (this.selectedTimeframe === FilterTimeframe.None)
            this.setSelectedTimeframe(FilterTimeframe.Current);
        if (this.selectDashboardTab === DashboardTabs.None)
            this.selectDashboardTab = DashboardTabs.Alarms;
    }
    DashboardService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    //////////////////////////////////////////////
    //Event Methods
    //////////////////////////////////////////////
    DashboardService.prototype.showAlarmFilterCriteriaComponent = function () {
        this.onShowAlarmFilterCriteria.next();
    };
    DashboardService.prototype.showPatrolFilterCriteriaComponent = function () {
        this.onShowPatrolFilterCriteria.next();
    };
    DashboardService.prototype.removeSelectedAlarmFilterCriteria = function () {
        this.onRemoveSelectedAlarmFilterCriteria.next();
    };
    DashboardService.prototype.removeSelectedPatrolFilterCriteria = function () {
        this.onRemoveSelectedPatrolFilterCriteria.next();
    };
    //////////////////////////////////////////////
    //Tenant/Location Methods
    //////////////////////////////////////////////
    DashboardService.prototype.setSelectedTenants = function (view) {
        if (view === this.view)
            this.locationsChanged.next();
    };
    DashboardService.prototype.getAllTenantLocations = function () {
        return this.locationFilterService.getAllTenantLocations(this.view);
    };
    DashboardService.prototype.getTentant = function (tenantID) {
        return this.locationFilterService.getTenant(this.view, tenantID);
    };
    DashboardService.prototype.getLocation = function (tenantID, locID) {
        return this.locationFilterService.getLocation(this.view, tenantID, locID);
    };
    DashboardService.prototype.getSelectedLocationIDs = function () {
        return this.locationFilterService.getSelectedLocationIDs(this.view);
    };
    DashboardService.prototype.setSelectedLocationIDs = function (locationIDs) {
        this.locationFilterService.setSelectedLocationIDs(this.view, locationIDs);
    };
    DashboardService.prototype.getAllLocationIDs = function () {
        return this.locationFilterService.getAllLocationIDs(this.view);
    };
    DashboardService.prototype.setLocationHeader = function (locationHeader) {
        this.locationHeader = locationHeader;
    };
    DashboardService.prototype.getLocationHeader = function () {
        return this.locationHeader;
    };
    DashboardService.prototype.getTenantLocationName = function (tenantID, locID) {
        var name = "";
        var loc = this.getLocation(tenantID, locID);
        if (loc)
            name = loc.Name;
        return name;
    };
    DashboardService.prototype.getTenantName = function (tenantID) {
        var name = "";
        var tenant = this.getTentant(tenantID);
        if (tenant)
            name = tenant.CustomerName;
        return name;
    };
    DashboardService.prototype.getTenantLocationAddr = function (tenantID, locID) {
        var addr = "";
        var loc = this.getLocation(tenantID, locID);
        if (loc)
            addr = loc.City + ", " + loc.State;
        return addr;
    };
    //////////////////////////////////////////////
    //Timeframe Methods
    //////////////////////////////////////////////
    DashboardService.prototype.getSelectedTimeframe = function () {
        return this.selectedTimeframe;
    };
    DashboardService.prototype.setSelectedTimeframe = function (timeframe) {
        this.selectedTimeframe = timeframe;
        //if (timeframe != FilterTimeframe.Custom)
        this.onTimeframeChange.next();
    };
    DashboardService.prototype.setCustomStartDateTime = function (startTime) {
        this.customStartDateTime = startTime;
    };
    DashboardService.prototype.setCustomEndDateTime = function (endTime) {
        this.customEndDateTime = endTime;
    };
    DashboardService.prototype.applyCustomDate = function () {
        this.onTimeframeChange.next();
    };
    DashboardService.prototype.getSelectedTimeframeString = function (selTimeFrame) {
        var timeframeStr = '';
        switch (selTimeFrame) {
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
            case FilterTimeframe.Custom:
                timeframeStr = "";
                break;
            default:
                timeframeStr = "";
                break;
        }
        return timeframeStr;
    };
    //////////////////////////////////////////////
    //Header Methods
    //////////////////////////////////////////////
    DashboardService.prototype.getSelectedDashboardTab = function () {
        return this.selectDashboardTab;
    };
    DashboardService.prototype.setSelectedDashboardTab = function (tab) {
        this.selectDashboardTab = tab;
        this.onDashboardTabChanged.next();
    };
    //////////////////////////////////////////////
    //Support Methods
    //////////////////////////////////////////////
    DashboardService.prototype.getTimeFrameStartTime = function (offset, range) {
        var start;
        if ((offset) && (range))
            start = moment().utc().subtract(offset, range).utc().toDate();
        return start;
    };
    DashboardService.prototype.getTimeFrameEndTime = function () {
        return moment().utc().toDate();
    };
    DashboardService.prototype.handleError = function (error) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    };
    DashboardService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            AlarmService,
            PlatformService,
            LocationFilterService,
            LocationFilterPipe,
            NavigationService])
    ], DashboardService);
    return DashboardService;
}());
export { DashboardService };
//# sourceMappingURL=dashboard.service.js.map