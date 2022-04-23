var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { DashboardService } from './dashboard.service';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardTabs } from './dashboard';
import { AlarmMapService } from "../map/alarms/alarmMap.service";
var Dashboard = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function Dashboard(dashboardService, dashboardAlarmService, changeDetectorRef, alarmMapService) {
        var _this = this;
        this.dashboardService = dashboardService;
        this.dashboardAlarmService = dashboardAlarmService;
        this.changeDetectorRef = changeDetectorRef;
        this.alarmMapService = alarmMapService;
        //public alarmTabSelected: boolean = true;
        //public patrolTabSelected: boolean = false;
        //public robotTabSelected: boolean = false;
        this.dashboardTab = DashboardTabs;
        this.isLoading = true;
        this.override = true;
        this.ngUnsubscribe = new Subject();
        this.dashboardService.onTimeframeChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.showLoading(); }
        });
        this.dashboardService.onTimeframeChangeComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.hideLoading(); }
        });
        dashboardService.onDashboardTabChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.showLoading(); }
        });
    }
    Dashboard.prototype.ngAfterViewInit = function () {
        //this.hideLoading();
        this.alarmMapService.manualZoomMode = true;
        this.changeDetectorRef.detectChanges(); //had to add for an Angular 4.2 bug #17572
    };
    Dashboard.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.alarmMapService.manualZoomMode = false;
    };
    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    Dashboard.prototype.showLoading = function () {
        this.isLoading = true;
        this.changeDetectorRef.detectChanges();
    };
    Dashboard.prototype.hideLoading = function () {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
    };
    Dashboard = __decorate([
        Component({
            selector: 'dashboard',
            templateUrl: 'dashboard.component.html',
            styleUrls: ['dashboard.component.css']
        }),
        __metadata("design:paramtypes", [DashboardService,
            DashboardAlarmService,
            ChangeDetectorRef,
            AlarmMapService])
    ], Dashboard);
    return Dashboard;
}());
export { Dashboard };
//# sourceMappingURL=dashboard.component.js.map