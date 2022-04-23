var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { AlarmService } from '../../alarms/alarm.service';
import { NavigationService } from '../../shared/navigation.service';
var AlarmContextMenu = /** @class */ (function () {
    function AlarmContextMenu(alarmService, elementRef, navigationService) {
        var _this = this;
        this.alarmService = alarmService;
        this.elementRef = elementRef;
        this.navigationService = navigationService;
        this.visible = false;
        this.ngUnsubscribe = new Subject();
        this.hide = function () {
            if (event) {
                event.preventDefault();
            }
            _this.visible = false;
            _this.alarm = undefined;
        };
        this.alarmService.openAlarmActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) { return _this.show(obj); }
        });
    }
    AlarmContextMenu.prototype.ngAfterViewInit = function () {
        $('body').append(this.elementRef.nativeElement);
    };
    AlarmContextMenu.prototype.show = function (obj) {
        this.alarm = obj.alarm;
        var x = obj.event.clientX;
        var y = obj.event.clientY;
        this.elementRef.nativeElement.style.left = x + 'px';
        this.elementRef.nativeElement.style.top = y + 'px';
        this.visible = true;
    };
    AlarmContextMenu.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    AlarmContextMenu = __decorate([
        Component({
            selector: 'alarm-context-menu',
            templateUrl: 'alarm-context-menu.component.html'
        }),
        __metadata("design:paramtypes", [AlarmService, ElementRef, NavigationService])
    ], AlarmContextMenu);
    return AlarmContextMenu;
}());
export { AlarmContextMenu };
//# sourceMappingURL=alarm-context-menu.component.js.map