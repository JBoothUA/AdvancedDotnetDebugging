import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClearAlarmsDialog } from './clear-dialog.component';
import { DismissAlarmsDialog } from './dismiss-dialog.component';
import { AlarmNotificationBadge } from './alarm-notification-badge.component';
import { AlarmActionMenu } from './alarm-action-menu.component';
import { SharedModule } from '../shared/_shared.module';
import { AlarmDetails } from './alarm-details.component';

@NgModule({
	imports: [CommonModule, FormsModule, SharedModule],
    declarations: [
        ClearAlarmsDialog, DismissAlarmsDialog, AlarmNotificationBadge,
        AlarmActionMenu, AlarmDetails
    ],
    exports: [
        AlarmNotificationBadge, AlarmActionMenu, ClearAlarmsDialog, DismissAlarmsDialog, AlarmDetails
    ]
})
export class AlarmModule { }