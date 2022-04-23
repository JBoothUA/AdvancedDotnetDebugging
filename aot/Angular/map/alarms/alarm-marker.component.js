var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { AlarmMapService } from './alarmMap.service';
import { AlarmRadialMenu } from './alarm-radial-menu.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var AlarmMarker = /** @class */ (function () {
    function AlarmMarker(mapService, changeDetectorRef, platformService, platformMapService) {
        var _this = this;
        this.mapService = mapService;
        this.changeDetectorRef = changeDetectorRef;
        this.platformService = platformService;
        this.platformMapService = platformMapService;
        this.actionMenuOpen = false;
        this.ngUnsubscribe = new Subject();
        this.closeActionMenu = function () {
            if (_this.actionMenuTimeout) {
                clearTimeout(_this.actionMenuTimeout);
            }
            _this.actionMenuOpen = false;
            _this.changeDetectorRef.detectChanges();
        };
        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 200;
        this.timer = null;
    }
    AlarmMarker.prototype.mouseEnter = function () {
        this.Hover = true;
        this.mapService.mouseOverAlarmMarkerInformation = this.alarm;
    };
    AlarmMarker.prototype.mouseLeave = function () {
        this.Hover = false;
        this.mapService.mouseOverAlarmMarkerInformation = null;
    };
    AlarmMarker.prototype.openRadial = function (event) {
        event.preventDefault();
        this.radial.toggleMenu(event);
    };
    AlarmMarker.prototype.select = function (event) {
        var _this = this;
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                if (_this.platformMapService.interactivePlatform) {
                    _this.platformMapService.sendGoToLocationCommand(null, _this.alarm);
                }
                else {
                    _this.alarmService.handleClickAlarm(_this.alarm, event, true);
                }
            }
            _this.prevent = false;
        }, this.delay);
    };
    AlarmMarker.prototype.zoomTo = function () {
        clearTimeout(this.timer);
        this.prevent = true;
        this.mapService.zoomToAlarmMarker(this.groupName);
    };
    AlarmMarker.prototype.multipleOccurances = function () {
        // TODO: Return based upon the number of occurances here
        return false;
    };
    AlarmMarker.prototype.hasAttachments = function () {
        if (this.alarm.Comments && this.alarm.Comments.length) {
            return true;
        }
        return false;
    };
    AlarmMarker.prototype.getDescription = function () {
        return this.alarm.getDescription();
    };
    AlarmMarker.prototype.acknowledgeAlarms = function () {
        this.alarmService.acknowledgeAlarms(this.alarm);
        this.closeActionMenu();
    };
    AlarmMarker.prototype.clearAlarms = function () {
        this.alarmService.clearAlarmsWithConfirmation(this.alarm);
        this.closeActionMenu();
    };
    AlarmMarker.prototype.dismissAlarms = function () {
        this.alarmService.dismissAlarmsWithConfirmation(this.alarm);
        this.closeActionMenu();
    };
    AlarmMarker.prototype.toggleActionMenu = function (state) {
        if (state !== undefined) {
            if (state) {
                this.openActionMenu();
            }
            else {
                this.closeActionMenu();
            }
        }
        else {
            if (this.actionMenuOpen) {
                this.closeActionMenu();
            }
            else {
                this.openActionMenu();
            }
        }
    };
    AlarmMarker.prototype.getPlatformDisplayName = function () {
        if (this.alarm.PlatformId) {
            var platform = this.platformService.getPlatform(this.alarm.PlatformId);
            if (platform && platform.DisplayName) {
                return platform.DisplayName;
            }
            else {
                return this.alarm.PlatformId;
            }
        }
        return null;
    };
    AlarmMarker.prototype.getPlatformStatusClass = function () {
        if (this.alarm.PlatformId) {
            var platform = this.platformService.getPlatform(this.alarm.PlatformId);
            if (platform) {
                return this.platformService.getPlatformStatusClass(platform);
            }
        }
    };
    AlarmMarker.prototype.openActionMenu = function () {
        var _this = this;
        this.actionMenuOpen = true;
        if (this.actionMenuTimeout) {
            clearTimeout(this.actionMenuTimeout);
        }
        this.actionMenuTimeout = setTimeout(function () { return _this.toggleActionMenu(false); }, 5000);
        this.changeDetectorRef.detectChanges();
    };
    AlarmMarker.prototype.getIcon = function () {
        if (this.alarm.Cleared) {
            return '/Content/images/dashboard/cleared-icon.png';
        }
        else if (this.alarm.Dismissed) {
            return '/Content/images/dashboard/dismiss-icon.png';
        }
        else if (this.alarm.Acknowledged) {
            return '/Content/images/Alarms/acknowledge-bubble.png';
        }
        else {
            return null;
        }
    };
    AlarmMarker.prototype.ngOnDestroy = function () {
        clearTimeout(this.actionMenuTimeout);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    AlarmMarker.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.alarm.PlatformId === platform.id) {
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
    };
    __decorate([
        Input(),
        __metadata("design:type", Alarm)
    ], AlarmMarker.prototype, "alarm", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmMarker.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmMarker.prototype, "description", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AlarmMarker.prototype, "priority", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmMarker.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], AlarmMarker.prototype, "state", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmMarker.prototype, "overlapSelected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], AlarmMarker.prototype, "alarmService", void 0);
    __decorate([
        ViewChild(AlarmRadialMenu),
        __metadata("design:type", AlarmRadialMenu)
    ], AlarmMarker.prototype, "radial", void 0);
    AlarmMarker = __decorate([
        Component({
            selector: 'alarm-marker',
            templateUrl: 'alarm-marker.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmMapService, ChangeDetectorRef, PlatformService, PlatformMapService])
    ], AlarmMarker);
    return AlarmMarker;
}());
export { AlarmMarker };
//# sourceMappingURL=alarm-marker.component.js.map