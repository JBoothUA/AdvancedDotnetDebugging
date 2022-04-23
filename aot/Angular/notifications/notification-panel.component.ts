import { Component, Input } from '@angular/core';
import { NotificationService } from '../notifications/notification.service';

@Component({
    selector: 'notification-panel',
    templateUrl: 'notification-panel.component.html'
})

export class NotificationPanel {
	constructor(public notificationService: NotificationService) { }
}