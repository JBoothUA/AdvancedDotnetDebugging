var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { AlarmService } from './alarm.service';
import { LocationFilterService } from './../shared/location-filter.service';
import { PlatformService } from './../platforms/platform.service';
var AlarmSort = /** @class */ (function () {
    function AlarmSort(alarmService, locationFilterService, platformService) {
        this.alarmService = alarmService;
        this.locationFilterService = locationFilterService;
        this.platformService = platformService;
    }
    AlarmSort.prototype.getGroupList = function (alarms, groupSelection, sortOrder) {
        var groupList = [];
        for (var alarm in alarms) {
            var groupName = this.getGroupName(alarms[alarm], groupSelection);
            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }
        // Sort based upon group selection
        if (groupSelection === 'Created') {
            this.sortByCreated(groupList, sortOrder);
        }
        else if (groupSelection === 'Priority') {
            this.sortByPriority(groupList, sortOrder);
        }
        else {
            this.genericSort(groupList, sortOrder);
        }
        return groupList;
    };
    AlarmSort.prototype.getGroupName = function (alarm, groupSelection) {
        var groupName;
        switch (groupSelection) {
            case 'Created':
                if (alarm[groupSelection]) {
                    groupName = this.alarmService.convertDateDisplay(alarm[groupSelection]['Timestamp'].toString(), true);
                }
                else {
                    groupName = 'Unknown';
                }
                break;
            case 'Priority':
                if (alarm[groupSelection]) {
                    groupName = this.alarmService.convertPriorityName(alarm[groupSelection]);
                }
                else {
                    groupName = 'None';
                }
                break;
            case 'Type':
                if (alarm[groupSelection]) {
                    groupName = alarm[groupSelection]['Category'] + ' ' + alarm[groupSelection]['Condition'];
                }
                else {
                    groupName = 'Unknown';
                }
                break;
            case 'State':
                if (alarm[groupSelection]) {
                    groupName = this.alarmService.convertStateName(alarm[groupSelection]);
                }
                else {
                    groupName = 'None';
                }
                break;
            case 'UserId':
                if (alarm[groupSelection]) {
                    groupName = alarm[groupSelection];
                }
                else {
                    groupName = 'None';
                }
                break;
            case 'Location':
                var loc = this.locationFilterService.getLocation('mapview', alarm.TenantId, alarm.LocationId);
                if (!loc) {
                    groupName = 'Unknown';
                }
                else {
                    groupName = loc.Name;
                }
                break;
            case 'RobotName':
                var platform = this.platformService.getPlatform(alarm.PlatformId);
                if (platform) {
                    groupName = platform.DisplayName;
                }
                else {
                    groupName = 'Unknown';
                }
                break;
            default:
                if (alarm[groupSelection]) {
                    groupName = alarm[groupSelection];
                }
                else {
                    groupName = 'None';
                }
                break;
        }
        ;
        return groupName;
    };
    AlarmSort.prototype.sortByCreated = function (list, sortOrder) {
        list.sort(function (a, b) {
            var res;
            if (a === b) {
                res = 0;
            }
            else if (a === 'Today') {
                res = 1;
            }
            else if (a === 'Unknown') {
                res = -1;
            }
            else if (b === 'Today') {
                res = -1;
            }
            else if (b === 'Unknown') {
                res = 1;
            }
            else {
                if (a === 'Yesterday') {
                    res = 1;
                }
                else if (b === 'Yesterday') {
                    res = -1;
                }
                else {
                    if (Date.parse(a) < Date.parse(b)) {
                        res = -1;
                    }
                    else {
                        res = 1;
                    }
                }
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            return res;
        });
    };
    AlarmSort.prototype.sortByPriority = function (list, sortOrder) {
        var self = this;
        list.sort(function (a, b) {
            var groupA = self.alarmService.convertPriorityNameToNum(a);
            var groupB = self.alarmService.convertPriorityNameToNum(b);
            var res = 0;
            ;
            if (groupA < groupB) {
                res = 1;
            }
            else if (groupA > groupB) {
                res = -1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            // names must be equal
            return res;
        });
    };
    AlarmSort.prototype.genericSort = function (list, sortOrder) {
        list.sort(function (a, b) {
            var groupA = a.toLowerCase(); // ignore upper and lowercase
            var groupB = b.toLowerCase(); // ignore upper and lowercase
            var res = 0;
            if (groupA < groupB) {
                res = 1;
            }
            if (groupA > groupB) {
                res = -1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            // names must be equal
            return res;
        });
    };
    AlarmSort.prototype.sortAlarms = function (alarms, sortOrder) {
        alarms.sort(function (a, b) {
            var res = 0;
            if (a.ReportedTime && b.ReportedTime) {
                if (a.ReportedTime === b.ReportedTime) {
                    // If the created time is the same, sort by priority
                    if (a.Priority > b.Priority) {
                        res = -1;
                    }
                    else if (a.Priority < b.Priority) {
                        res = 1;
                    }
                }
                else if (a.ReportedTime < b.ReportedTime) {
                    res = -1;
                }
                else {
                    res = 1;
                }
            }
            else if (!a.ReportedTime && !b.ReportedTime) {
                if (a.Priority > b.Priority) {
                    res = -1;
                }
                else if (a.Priority < b.Priority) {
                    res = 1;
                }
            }
            else if (!a.ReportedTime) {
                res = -1;
            }
            else if (!b.ReportedTime) {
                res = 1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            return res;
        });
        return alarms;
    };
    AlarmSort = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AlarmService,
            LocationFilterService,
            PlatformService])
    ], AlarmSort);
    return AlarmSort;
}());
export { AlarmSort };
//# sourceMappingURL=alarm-sort.class.js.map