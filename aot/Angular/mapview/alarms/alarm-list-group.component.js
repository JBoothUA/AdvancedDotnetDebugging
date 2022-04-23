var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmSort } from '../../alarms/alarm-sort.class';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';
var AlarmListGroup = /** @class */ (function () {
    function AlarmListGroup(alarmService, alarmSort) {
        this.alarmService = alarmService;
        this.alarmSort = alarmSort;
        this.toggleDisplay = 'Select';
        this.currentlyToggling = false;
        this.priorityColor = 'hidden';
    }
    AlarmListGroup.prototype.ngOnInit = function () {
        this.expandedState = this.expandedState || 'out';
        this.priorityColor = this.getPriorityColorClass();
    };
    AlarmListGroup.prototype.getPriorityColorClass = function () {
        if (this.groupSelection === 'Priority') {
            var priority = this.alarmService.convertPriorityNameToNum(this.groupName);
            if (priority) {
                return 'p' + priority;
            }
        }
        return 'hidden';
    };
    AlarmListGroup.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    };
    AlarmListGroup.prototype.trackByAlarmFn = function (index, alarm) {
        return alarm.Id;
    };
    AlarmListGroup.prototype.buildAlarmList = function () {
        var alarmList = [];
        for (var alarm in this.alarms) {
            // If alarm is part of this group, include it
            if (this.alarmSort.getGroupName(this.alarms[alarm], this.groupSelection) === this.groupName) {
                alarmList.push(this.alarms[alarm]);
            }
        }
        this.alarmList = this.alarmSort.sortAlarms(alarmList, this.sortOrder);
    };
    AlarmListGroup.prototype.toggleAllAlarmsInGroup = function () {
        event.stopPropagation();
        this.currentlyToggling = true;
        var toggleOn = (this.toggleDisplay === 'Select');
        this.toggleDisplay = (this.toggleDisplay === 'Select') ? 'Unselect' : 'Select';
        for (var alarm in this.alarmList) {
            if (toggleOn) {
                this.alarmService.selectAlarm(this.alarmList[alarm].Id, true, false);
            }
            else {
                this.alarmService.deSelectAlarm(this.alarmList[alarm].Id, true);
            }
        }
        this.currentlyToggling = false;
    };
    AlarmListGroup.prototype.ngOnChanges = function (changes) {
        if (changes.alarms && !this.currentlyToggling) {
            this.buildAlarmList();
            // Toggle to 'Unselect'
            var allSelected = true;
            for (var _i = 0, _a = this.alarmList; _i < _a.length; _i++) {
                var alarm = _a[_i];
                if (!alarm.Selected) {
                    allSelected = false;
                    break;
                }
            }
            if (allSelected) {
                this.toggleDisplay = 'Unselect';
            }
            else {
                this.toggleDisplay = 'Select';
            }
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AlarmListGroup.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], AlarmListGroup.prototype, "multiSelect", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmListGroup.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmListGroup.prototype, "groupSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmListGroup.prototype, "sortOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], AlarmListGroup.prototype, "mapViewOptions", void 0);
    AlarmListGroup = __decorate([
        Component({
            selector: 'alarm-list-group',
            templateUrl: 'alarm-list-group.component.html',
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmService, AlarmSort])
    ], AlarmListGroup);
    return AlarmListGroup;
}());
export { AlarmListGroup };
//# sourceMappingURL=alarm-list-group.component.js.map