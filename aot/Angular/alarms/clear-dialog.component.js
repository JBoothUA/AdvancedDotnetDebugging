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
var ClearAlarmsDialog = /** @class */ (function () {
    function ClearAlarmsDialog(alarmService) {
        var _this = this;
        this.alarmService = alarmService;
        this.ngUnsubscribe = new Subject();
        this.alarmService.clearingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarms) { return _this.show(alarms); }
        });
    }
    ClearAlarmsDialog.prototype.show = function (alarms) {
        this.alarms = alarms;
        this.unackAlarms = [];
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            if (!alarm.Acknowledged) {
                this.unackAlarms.push(alarm);
            }
        }
        this.clearAlarmsModal.show();
    };
    ClearAlarmsDialog.prototype.hide = function () {
        this.clearAlarmsModal.hide();
    };
    ClearAlarmsDialog.prototype.clearAlarms = function () {
        this.alarmService.clearAlarms(this.alarms);
        this.hide();
    };
    ClearAlarmsDialog.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], ClearAlarmsDialog.prototype, "clearAlarmsModal", void 0);
    ClearAlarmsDialog = __decorate([
        Component({
            selector: 'clear-alarms-dialog',
            templateUrl: 'clear-dialog.component.html'
        }),
        __metadata("design:paramtypes", [AlarmService])
    ], ClearAlarmsDialog);
    return ClearAlarmsDialog;
}());
export { ClearAlarmsDialog };
//# sourceMappingURL=clear-dialog.component.js.map