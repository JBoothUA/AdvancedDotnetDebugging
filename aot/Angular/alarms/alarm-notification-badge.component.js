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
import { AlarmService } from '../alarms/alarm.service';
var AlarmNotificationBadge = /** @class */ (function () {
    function AlarmNotificationBadge(alarmService) {
        this.alarmService = alarmService;
    }
    AlarmNotificationBadge.prototype.getPriorityClass = function () {
        var highestPriorityAlarm = this.alarmService.getHighestPriorityAlarm();
        if (highestPriorityAlarm) {
            return 'p' + (highestPriorityAlarm.Priority === 0 ? 1 : highestPriorityAlarm.Priority);
        }
        return '';
    };
    AlarmNotificationBadge.prototype.getNotificationCount = function () {
        return this.count > 99 ? '99+' : this.count;
    };
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AlarmNotificationBadge.prototype, "count", void 0);
    AlarmNotificationBadge = __decorate([
        Component({
            selector: 'alarm-notification-badge',
            templateUrl: 'alarm-notification-badge.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmService])
    ], AlarmNotificationBadge);
    return AlarmNotificationBadge;
}());
export { AlarmNotificationBadge };
//# sourceMappingURL=alarm-notification-badge.component.js.map