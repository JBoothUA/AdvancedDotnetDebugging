import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotificationService } from './notification.service';
import { NotificationPanel } from './notification-panel.component';
import { NotificationPopup } from './notification-popup.component';
import { NotificationButton } from './notification-button.component';
import { NotificationListItem } from './notification-list-item.component';
import { NotificationListGroup } from './notification-list-group.component';

@NgModule({
	imports: [CommonModule, FormsModule],
	providers: [NotificationService],
	declarations: [
		NotificationButton, NotificationPanel, NotificationPopup, NotificationListItem, NotificationListGroup
	],
	exports: [
		NotificationPopup, NotificationPanel, NotificationButton
    ]
})
export class NotificationModule { }
