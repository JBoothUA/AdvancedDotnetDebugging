var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DashboardAlarmService } from './dashboard-alarm.service';
import { DashboardPlatformService } from './dashboard-platform.service';
import { DashboardPatrolService } from './dashboard-patrol.service';
import { PatrolInstance } from '../patrols/patrol.class';
import { DomSanitizer } from '@angular/platform-browser';
var DashboardPatrolDetails = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    function DashboardPatrolDetails(dashboardAlarmService, dashboardPlatformService, dashboardPatrolService, sanitizer) {
        this.dashboardAlarmService = dashboardAlarmService;
        this.dashboardPlatformService = dashboardPlatformService;
        this.dashboardPatrolService = dashboardPatrolService;
        this.sanitizer = sanitizer;
        this.loading = false;
        this.override = true;
    }
    DashboardPatrolDetails.prototype.ngAfterViewInit = function () {
        this.hideLoading();
    };
    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    DashboardPatrolDetails.prototype.showLoading = function () {
        this.loading = true;
    };
    DashboardPatrolDetails.prototype.hideLoading = function () {
        this.loading = false;
    };
    DashboardPatrolDetails.prototype.getPatrolElapsedTime = function () {
        var result = this.dashboardPatrolService.getPatrolElapsedTime(this.patrol);
        if (result) {
            var s = result.split(" ");
            var r = "<span style='font-size: 16px; margin-top: 10px;'>" + s[0] + "</span>";
            r = r + "<span style='font-size: 13px; margin-left: 5px;'>" + s[1] + "</span>";
            return this.sanitizer.bypassSecurityTrustHtml(r);
        }
        else
            return '';
    };
    DashboardPatrolDetails.prototype.getCheckPointStatus = function () {
        return this.dashboardPatrolService.getCheckPointStatus(this.patrol);
    };
    DashboardPatrolDetails.prototype.getCheckPointStatusArray = function () {
        var patrolCPStatus = [];
        var cpStatus = this.dashboardPatrolService.getCheckPointStatus(this.patrol);
        if (cpStatus)
            patrolCPStatus.push(cpStatus);
        return patrolCPStatus;
    };
    DashboardPatrolDetails.prototype.getUserInitials = function () {
        return this.dashboardAlarmService.convertUsernameToInitials(this.patrol.UserName); //TODO move convertUsernameToInitials to the dashboard service
    };
    DashboardPatrolDetails.prototype.getPatrolAlarms = function () {
        return this.dashboardPatrolService.getPatrolAlarms(this.patrol);
    };
    DashboardPatrolDetails.prototype.getAlarmHeaderText = function () {
        var header = 'Patrol Alarms';
        if (this.patrol && this.patrol.AlarmIds && this.patrol.AlarmIds.length > 0)
            header = header + ' (' + this.patrol.AlarmIds.length + ')';
        return header;
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], DashboardPatrolDetails.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], DashboardPatrolDetails.prototype, "patrolAlarms", void 0);
    DashboardPatrolDetails = __decorate([
        Component({
            selector: 'dashboard-patrol-details',
            templateUrl: 'dashboard-patrol-details.component.html',
            styleUrls: ['dashboard-patrol-details.component.css', 'dashboard.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [DashboardAlarmService,
            DashboardPlatformService,
            DashboardPatrolService,
            DomSanitizer])
    ], DashboardPatrolDetails);
    return DashboardPatrolDetails;
}());
export { DashboardPatrolDetails };
//# sourceMappingURL=dashboard-patrol-details.component.js.map