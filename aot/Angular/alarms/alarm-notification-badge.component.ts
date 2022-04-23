import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AlarmService } from '../alarms/alarm.service';

@Component({
    selector: 'alarm-notification-badge',
    templateUrl: 'alarm-notification-badge.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmNotificationBadge {
    @Input() count: number;

    constructor(private alarmService: AlarmService) { }

    getPriorityClass(): string {
        var highestPriorityAlarm = this.alarmService.getHighestPriorityAlarm();
        if (highestPriorityAlarm) {
            return 'p' + (highestPriorityAlarm.Priority === 0 ? 1 : highestPriorityAlarm.Priority);
        }

        return '';
    }

    getNotificationCount(): any {
        return this.count > 99 ? '99+' : this.count;
    }
}