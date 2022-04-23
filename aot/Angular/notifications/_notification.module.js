var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from './notification.service';
import { NotificationPanel } from './notification-panel.component';
import { NotificationPopup } from './notification-popup.component';
import { NotificationButton } from './notification-button.component';
import { NotificationListItem } from './notification-list-item.component';
import { NotificationListGroup } from './notification-list-group.component';
var NotificationModule = /** @class */ (function () {
    function NotificationModule() {
    }
    NotificationModule = __decorate([
        NgModule({
            imports: [CommonModule, FormsModule],
            providers: [NotificationService],
            declarations: [
                NotificationButton, NotificationPanel, NotificationPopup, NotificationListItem, NotificationListGroup
            ],
            exports: [
                NotificationPopup, NotificationPanel, NotificationButton
            ]
        })
    ], NotificationModule);
    return NotificationModule;
}());
export { NotificationModule };
//# sourceMappingURL=_notification.module.js.map