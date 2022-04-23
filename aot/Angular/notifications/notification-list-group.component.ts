import { Component } from '@angular/core';
import { AlarmService } from '../alarms/alarm.service';

@Component({
    selector: 'notification-list-group',
    templateUrl: 'notification-list-group.component.html'
})
export class NotificationListGroup {

    constructor(private _alarmService: AlarmService) {
    }
}