var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var OverlappingAlarms = /** @class */ (function () {
    function OverlappingAlarms(mapService, changeDetectorRef) {
        this.mapService = mapService;
        this.changeDetectorRef = changeDetectorRef;
        this.ngUnsubscribe = new Subject();
    }
    OverlappingAlarms.prototype.ngOnInit = function () {
        this.groupName = undefined;
        this.alarms = [];
        this.visible = false;
    };
    OverlappingAlarms.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.mapService.openOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: function (obj) { return _this.open(obj.groupName, obj.alarms); }
        });
        this.mapService.refreshOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: function (groupName) { return _this.refresh(groupName); }
        });
        this.mapService.closeOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: function (groupName) { return _this.close(groupName); }
        });
        this.mapService.forceCloseOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: function () { return _this.closeWindow(); }
        });
    };
    OverlappingAlarms.prototype.open = function (groupName, alarms) {
        if (this.mapService.visibleMarkers) {
            this.alarms = alarms;
            this.groupName = groupName;
            this.visible = true;
            this.buildGroupList();
            this.changeDetectorRef.markForCheck();
        }
    };
    OverlappingAlarms.prototype.refresh = function (groupName) {
        if (groupName === this.groupName) {
            this.buildGroupList();
            this.changeDetectorRef.markForCheck();
        }
    };
    OverlappingAlarms.prototype.close = function (groupName) {
        if (groupName === this.groupName) {
            this.closeWindow();
        }
    };
    OverlappingAlarms.prototype.closeWindow = function () {
        if (this.visible) {
            this.visible = false;
            this.mapService.deSelectGroupMarker(this.groupName);
            this.groupName = undefined;
            for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
                var alarm = _a[_i];
                this.alarmService.deSelectAlarm(alarm.Id, false, false);
            }
            this.alarms = [];
            this.changeDetectorRef.detectChanges();
        }
    };
    OverlappingAlarms.prototype.buildGroupList = function () {
        var groupList = [];
        var oneSelected = false;
        var overlapSelected = false;
        for (var alarm in this.alarms) {
            if (!groupList.includes(this.alarms[alarm].Priority)) {
                groupList.push(this.alarms[alarm].Priority);
            }
            if (!overlapSelected && this.alarms[alarm].OverlapSelected) {
                overlapSelected = true;
            }
        }
        if (!overlapSelected) {
            var highestPriority = this.mapService.getHighestPriorityAlarm(this.alarms.filter(function (value) { return value.Selected; }));
            if (highestPriority) {
                this.alarmService.selectOverlapAlarm(highestPriority.Id);
            }
        }
        groupList.sort(function (a, b) {
            var res = 0;
            if (a < b) {
                return -1;
            }
            else if (a > b) {
                return 1;
            }
            return res;
        });
        this.groupList = groupList;
    };
    OverlappingAlarms.prototype.center = function () {
        this.mapService.panToAlarmMarker(this.groupName);
    };
    OverlappingAlarms.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], OverlappingAlarms.prototype, "alarmService", void 0);
    OverlappingAlarms = __decorate([
        Component({
            selector: 'overlapping-alarms',
            templateUrl: 'overlapping-alarms.component.html'
        }),
        __metadata("design:paramtypes", [AlarmMapService, ChangeDetectorRef])
    ], OverlappingAlarms);
    return OverlappingAlarms;
}());
export { OverlappingAlarms };
//# sourceMappingURL=overlapping-alarms.component.js.map