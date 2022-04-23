var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClearAlarmsDialog } from './clear-dialog.component';
import { DismissAlarmsDialog } from './dismiss-dialog.component';
import { AlarmNotificationBadge } from './alarm-notification-badge.component';
import { AlarmActionMenu } from './alarm-action-menu.component';
import { SharedModule } from '../shared/_shared.module';
import { AlarmDetails } from './alarm-details.component';
var AlarmModule = /** @class */ (function () {
    function AlarmModule() {
    }
    AlarmModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule, SharedModule],
            declarations: [
                ClearAlarmsDialog, DismissAlarmsDialog, AlarmNotificationBadge,
                AlarmActionMenu, AlarmDetails
            ],
            exports: [
                AlarmNotificationBadge, AlarmActionMenu, ClearAlarmsDialog, DismissAlarmsDialog, AlarmDetails
            ]
        })
    ], AlarmModule);
    return AlarmModule;
}());
export { AlarmModule };
//# sourceMappingURL=_alarm.module.js.map