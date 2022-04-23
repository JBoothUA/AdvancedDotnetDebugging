var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Modal } from '../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var DismissAlarmsDialog = /** @class */ (function () {
    function DismissAlarmsDialog(alarmService) {
        var _this = this;
        this.alarmService = alarmService;
        this.isCustomDismissAlarmReason = false;
        this.dismissAlarmReason = 'No threat observed.';
        this.customDismissAlarmReason = null;
        this.ngUnsubscribe = new Subject();
        this.alarmService.dismissingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarms) { return _this.show(alarms); }
        });
    }
    DismissAlarmsDialog.prototype.show = function (alarms) {
        this.alarms = alarms;
        this.unackAlarms = [];
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            if (!alarm.Acknowledged) {
                this.unackAlarms.push(alarm);
            }
        }
        // Reset Dialog
        this.isCustomDismissAlarmReason = false;
        this.dismissAlarmReason = 'No threat observed.';
        this.customDismissAlarmReason = null;
        this.dismissAlarmsModal.show();
    };
    DismissAlarmsDialog.prototype.hide = function () {
        this.dismissAlarmsModal.hide();
    };
    DismissAlarmsDialog.prototype.prepareCustomDismissAlarmReason = function () {
        this.dismissAlarmReason = null;
        this.isCustomDismissAlarmReason = true;
    };
    DismissAlarmsDialog.prototype.dismissAlarms = function () {
        this.alarmService.dismissAlarms(this.alarms, this.isCustomDismissAlarmReason ? this.customDismissAlarmReason : this.dismissAlarmReason);
        this.hide();
    };
    DismissAlarmsDialog.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], DismissAlarmsDialog.prototype, "dismissAlarmsModal", void 0);
    DismissAlarmsDialog = __decorate([
        Component({
            selector: 'dismiss-alarms-dialog',
            templateUrl: 'dismiss-dialog.component.html'
        }),
        __metadata("design:paramtypes", [AlarmService])
    ], DismissAlarmsDialog);
    return DismissAlarmsDialog;
}());
export { DismissAlarmsDialog };
//# sourceMappingURL=dismiss-dialog.component.js.map