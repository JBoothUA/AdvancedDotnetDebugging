import { Component, Input, ApplicationRef } from '@angular/core';
import { AppSettings } from '../shared/app-settings';
import { NotificationService } from '../notifications/notification.service';

@Component({
    selector: 'notification-button',
    templateUrl: 'notification-button.component.html'
})

export class NotificationButton {
	constructor(private notificationService: NotificationService) {
	}

	showNotificationPanel() {
		this.notificationService.toggleNotificationPanel();
	}
}