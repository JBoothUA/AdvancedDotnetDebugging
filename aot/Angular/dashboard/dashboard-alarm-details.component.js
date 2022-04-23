var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
//import { DashboardService } from './dashboard.service';
//import { DashboardAlarmService } from './dashboard-alarm.service';
//import { DashboardPlatformService } from './dashboard-platform.service';
import { Alarm } from '../alarms/alarm.class';
//import { AlarmDetails } from '../alarms/alarm-details.component';
import { MediaService } from '../shared/media/media.service';
import { Subject } from 'rxjs/Subject';
var DashboardAlarmDetails = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Angular Methods
    ///////////////////////////////////////////
    function DashboardAlarmDetails(changeDetectorRef, mediaService) {
        var _this = this;
        this.changeDetectorRef = changeDetectorRef;
        this.mediaService = mediaService;
        this.loading = false;
        this.override = true;
        this.ngUnsubscribe = new Subject();
        this.mediaService.selectedImageChangedSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (correlationId) {
                if (correlationId === _this.dashAlarm.Id) {
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
    }
    DashboardAlarmDetails.prototype.ngAfterViewInit = function () {
        this.hideLoading();
    };
    DashboardAlarmDetails.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    ///////////////////////////////////////////
    //Component Methods
    ///////////////////////////////////////////
    DashboardAlarmDetails.prototype.showLoading = function () {
        this.loading = true;
    };
    DashboardAlarmDetails.prototype.hideLoading = function () {
        this.loading = false;
    };
    DashboardAlarmDetails.prototype.getImageCount = function () {
        var count = '';
        if (this.dashAlarm.Snapshots) {
            count = this.dashAlarm.Snapshots.length.toString();
        }
        return count;
    };
    DashboardAlarmDetails.prototype.selectImage = function (uri) {
        for (var index in this.dashAlarm.Snapshots) {
            this.dashAlarm.Snapshots[index].Selected = this.dashAlarm.Snapshots[index].Uri === uri;
        }
        var imageTitle = 'Image Viewer - ' + this.dashAlarm.Description + ' Alarm (P' + this.dashAlarm.Priority + ')';
        this.mediaService.openImageViewer(this.dashAlarm.Id, this.dashAlarm.Snapshots, btoa(imageTitle));
    };
    __decorate([
        Input(),
        __metadata("design:type", Alarm)
    ], DashboardAlarmDetails.prototype, "dashAlarm", void 0);
    DashboardAlarmDetails = __decorate([
        Component({
            selector: 'dashboard-alarm-details',
            templateUrl: 'dashboard-alarm-details.component.html',
            styleUrls: ['dashboard-alarm-details.component.css', 'dashboard.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef,
            MediaService])
    ], DashboardAlarmDetails);
    return DashboardAlarmDetails;
}());
export { DashboardAlarmDetails };
//# sourceMappingURL=dashboard-alarm-details.component.js.map