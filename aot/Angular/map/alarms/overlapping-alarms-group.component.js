var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';
import { slideDown } from '../../shared/animations';
var OverlappingAlarmsGroup = /** @class */ (function () {
    function OverlappingAlarmsGroup(mapService) {
        var _this = this;
        this.mapService = mapService;
        this.clickedAlarm = function (alarm, event) {
            if (!alarm.Selected) {
                _this.alarmService.handleClickAlarm(alarm, event, true);
            }
            else {
                // This overlapping group should never unselect the ONLY selected alarm from the group.
                var lastSelected = true;
                for (var _i = 0, _a = _this.alarmList; _i < _a.length; _i++) {
                    var overlappingAlarm = _a[_i];
                    if (overlappingAlarm.Selected && overlappingAlarm.Id !== alarm.Id) {
                        lastSelected = false;
                        break;
                    }
                }
                if (!lastSelected) {
                    _this.alarmService.handleClickAlarm(alarm, event, true);
                }
            }
        };
        this.contextMenuAlarm = function (alarm, event) {
            event.preventDefault();
            _this.alarmService.openAlarmActionMenu(alarm, event);
        };
    }
    OverlappingAlarmsGroup.prototype.buildAlarmList = function () {
        var _this = this;
        var alarmList = this.alarms.filter(function (alarm) { return alarm.Priority === _this.groupName; });
        alarmList.sort(function (a, b) {
            var res = 0;
            if (a.ReportedTime !== null && b.ReportedTime !== null) {
                if (a.ReportedTime < b.ReportedTime) {
                    res = 1;
                }
                else if (a.ReportedTime > b.ReportedTime) {
                    res = -1;
                }
            }
            else if (a.ReportedTime === null) {
                res = 1;
            }
            else if (b.ReportedTime === null) {
                res = -1;
            }
            return res;
        });
        this.alarmList = alarmList;
    };
    OverlappingAlarmsGroup.prototype.ngOnChanges = function (changes) {
        if (changes.alarms) {
            this.buildAlarmList();
        }
    };
    OverlappingAlarmsGroup.prototype.checkSelection = function (alarm) {
        return alarm.Selected;
    };
    OverlappingAlarmsGroup.prototype.getHeaderText = function () {
        var header;
        switch (this.groupName) {
            case 1:
                header = 'Critical Priority';
                break;
            case 2:
                header = 'High Priority';
                break;
            case 3:
                header = 'Medium Priority';
                break;
            case 4:
                header = 'Low Priority';
                break;
            default:
                header = 'Unknown';
        }
        return header + ' (' + this.alarmList.length + ')';
    };
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], OverlappingAlarmsGroup.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], OverlappingAlarmsGroup.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], OverlappingAlarmsGroup.prototype, "alarmService", void 0);
    OverlappingAlarmsGroup = __decorate([
        Component({
            selector: 'overlapping-alarms-group',
            templateUrl: 'overlapping-alarms-group.component.html',
            animations: [
                slideDown
            ]
        }),
        __metadata("design:paramtypes", [AlarmMapService])
    ], OverlappingAlarmsGroup);
    return OverlappingAlarmsGroup;
}());
export { OverlappingAlarmsGroup };
//# sourceMappingURL=overlapping-alarms-group.component.js.map