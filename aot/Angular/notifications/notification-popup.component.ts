import { Component, Input } from '@angular/core';
import { NotificationService } from '../notifications/notification.service';

@Component({
    selector: 'notification-popup',
    templateUrl: 'notification-popup.component.html'
})

export class NotificationPopup {
	constructor(public notificationService: NotificationService) { }
}