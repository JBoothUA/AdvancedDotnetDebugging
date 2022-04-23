var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ElementRef } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Alarm } from './alarm.class';
var AlarmActionMenu = /** @class */ (function () {
    function AlarmActionMenu(alarmService, elementRef) {
        this.alarmService = alarmService;
        this.elementRef = elementRef;
        this.visible = false;
    }
    AlarmActionMenu.prototype.ngOnInit = function () {
        L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);
    };
    AlarmActionMenu.prototype.acknowledgeAlarms = function () {
        this.alarmService.acknowledgeAlarms(this.alarm);
        if (this.callback) {
            this.callback();
        }
    };
    AlarmActionMenu.prototype.clearAlarms = function () {
        this.alarmService.clearAlarmsWithConfirmation(this.alarm);
        if (this.callback) {
            this.callback();
        }
    };
    AlarmActionMenu.prototype.dismissAlarms = function () {
        this.alarmService.dismissAlarmsWithConfirmation(this.alarm);
        if (this.callback) {
            this.callback();
        }
    };
    AlarmActionMenu.prototype.allSelectedAreAcknowledged = function () {
        var allAckd = true;
        var selectedAlarms = this.alarmService.getSelectedAlarms();
        for (var _i = 0, selectedAlarms_1 = selectedAlarms; _i < selectedAlarms_1.length; _i++) {
            var alarm = selectedAlarms_1[_i];
            if (!alarm.Acknowledged) {
                allAckd = false;
                break;
            }
        }
        return allAckd;
    };
    __decorate([
        Input(),
        __metadata("design:type", Alarm)
    ], AlarmActionMenu.prototype, "alarm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], AlarmActionMenu.prototype, "callback", void 0);
    AlarmActionMenu = __decorate([
        Component({
            selector: 'alarm-action-menu',
            templateUrl: 'alarm-action-menu.component.html'
        }),
        __metadata("design:paramtypes", [AlarmService, ElementRef])
    ], AlarmActionMenu);
    return AlarmActionMenu;
}());
export { AlarmActionMenu };
//# sourceMappingURL=alarm-action-menu.component.js.map