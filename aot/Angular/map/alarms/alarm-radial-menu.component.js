var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { RadialMenu } from '../../shared/radial/radial-menu.component';
import { RadialMenuButton } from '../../shared/radial/radial-menu-button.class';
import { RadialMenuButtonImage } from '../../shared/radial/radial-menu-button-image.class';
import { Alarm, AlarmStatus } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
var AlarmRadialMenu = /** @class */ (function (_super) {
    __extends(AlarmRadialMenu, _super);
    function AlarmRadialMenu(changeDetectorRef, elementRef, alarmService) {
        var _this = _super.call(this, changeDetectorRef, elementRef) || this;
        _this.changeDetectorRef = changeDetectorRef;
        _this.elementRef = elementRef;
        _this.alarmService = alarmService;
        _this.acknowledgeAlarm = function () {
            _this.alarmService.acknowledgeAlarms(_this.alarm);
        };
        _this.clearAlarms = function () {
            _this.alarmService.clearAlarmsWithConfirmation(_this.alarm);
        };
        _this.dismissAlarms = function () {
            _this.alarmService.dismissAlarmsWithConfirmation(_this.alarm);
        };
        L.DomEvent.disableClickPropagation(_this.elementRef.nativeElement);
        return _this;
    }
    AlarmRadialMenu.prototype.ngOnInit = function () {
        this.acknowledgeButton = new RadialMenuButton(this.alarm.Id, 'Acknowledge', new RadialMenuButtonImage('/Content/Images/Alarms/radial-acknowledge-icon.png', -3, -2), this.acknowledgeAlarm, false, (this.alarm.Acknowledged ? false : true));
        this.clearButton = new RadialMenuButton(this.alarm.Id, 'Clear', new RadialMenuButtonImage('/Content/Images/Alarms/radial-clear-alarm.png'), this.clearAlarms, false, (this.alarm.Acknowledged ? true : false));
        this.dismissButton = new RadialMenuButton(this.alarm.Id, 'Dismiss', new RadialMenuButtonImage('/Content/Images/Alarms/radial-dismiss-alarm.png', 0, 2), this.dismissAlarms);
        this.buttons.push(this.clearButton);
        this.buttons.push(this.acknowledgeButton);
        // Create empty/invisible buttons to control placement of buttons
        for (var i = 0; i < 6; i++) {
            this.buttons.push(new RadialMenuButton('', '', new RadialMenuButtonImage(''), null, false, false, false));
        }
        this.buttons.push(this.dismissButton);
    };
    AlarmRadialMenu.prototype.ngOnChanges = function (changes) {
        if (changes.acknowledged && this.acknowledgeButton) {
            if (this.acknowledged) {
                this.acknowledgeButton.Active = false;
                this.clearButton.Active = true;
            }
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Alarm)
    ], AlarmRadialMenu.prototype, "alarm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmStatus)
    ], AlarmRadialMenu.prototype, "acknowledged", void 0);
    AlarmRadialMenu = __decorate([
        Component({
            selector: 'alarm-radial-menu',
            templateUrl: '../../shared/radial/radial-menu.component.html',
            styleUrls: ['../../shared/radial/radial-menu.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef, ElementRef, AlarmService])
    ], AlarmRadialMenu);
    return AlarmRadialMenu;
}(RadialMenu));
export { AlarmRadialMenu };
//# sourceMappingURL=alarm-radial-menu.component.js.map