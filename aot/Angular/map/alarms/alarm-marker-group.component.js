var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';
var AlarmMarkerGroup = /** @class */ (function () {
    function AlarmMarkerGroup(mapService, changeDetectorRef) {
        this.mapService = mapService;
        this.changeDetectorRef = changeDetectorRef;
        this.ngUnsubscribe = new Subject();
        this.selected = false;
        this.childSelected = false;
        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 200;
        this.timer = null;
    }
    AlarmMarkerGroup.prototype.ngOnInit = function () {
        var _this = this;
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.selectionChanged(); }
        });
        this.mapService.deSelectGroupSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (groupName) { return _this.deselectGroup(groupName); }
        });
    };
    AlarmMarkerGroup.prototype.grouped = function () {
        return this.alarms.length > 1;
    };
    AlarmMarkerGroup.prototype.groupedAlarmSelected = function () {
        var res = false;
        for (var alarm in this.alarms) {
            if (this.alarms[alarm].OverlapSelected) {
                // If alarm is selected in overlapping alarms dialog, show it instead of group icon
                res = true;
                break;
            }
        }
        return res;
    };
    AlarmMarkerGroup.prototype.ngAfterViewInit = function () {
        if (this.groupName !== 'Unknown') {
            this.mapService.createAlarmGroupMarker(this.groupName, this.alarms);
        }
        this.checkGroupSelection();
    };
    AlarmMarkerGroup.prototype.highestPriority = function () {
        return this.mapService.getHighestPriority(this.alarms);
    };
    AlarmMarkerGroup.prototype.select = function (event) {
        var _this = this;
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                if (_this.selected) {
                    if (event.ctrlKey) {
                        for (var alarm in _this.alarms) {
                            if (_this.alarms[alarm].Selected) {
                                _this.alarmService.deSelectAlarm(_this.alarms[alarm].Id, true);
                            }
                        }
                    }
                    else {
                        _this.alarmService.deSelectAllAlarms();
                    }
                }
                else {
                    if (!_this.childSelected) {
                        if (event.ctrlKey) {
                            _this.alarmService.selectAlarm(_this.mapService.getHighestPriorityAlarm(_this.alarms).Id, true);
                        }
                        else {
                            var id = _this.mapService.getHighestPriorityAlarm(_this.alarms).Id;
                            _this.alarmService.selectOnlyAlarm(id, true);
                        }
                    }
                    else {
                        _this.mapService.openOverlappingAlarms(_this.groupName, _this.alarms);
                    }
                }
                _this.changeDetectorRef.markForCheck();
            }
            _this.prevent = false;
        }, this.delay);
    };
    AlarmMarkerGroup.prototype.zoomTo = function () {
        clearTimeout(this.timer);
        this.prevent = true;
        this.mapService.zoomToAlarmMarker(this.groupName);
        this.alarmService.selectOnlyAlarm(this.mapService.getHighestPriorityAlarm(this.alarms).Id);
    };
    AlarmMarkerGroup.prototype.changeSelectionState = function (state) {
        if (state !== this.selected) {
            this.selected = state;
            if (this.selected) {
                // Open the overlapping alarms dialog for this group
                if (this.alarms.length > 1) {
                    this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
                }
            }
            else {
                this.mapService.closeOverlappingAlarms(this.groupName);
            }
            this.changeDetectorRef.markForCheck();
        }
    };
    AlarmMarkerGroup.prototype.checkChildSelection = function () {
        var childSelected = false;
        for (var alarm in this.alarms) {
            if (this.alarms[alarm].Selected) {
                childSelected = true;
                break;
            }
        }
        if (this.childSelected !== childSelected) {
            this.childSelected = childSelected;
            // If child selection has changed, update the group marker so that the cluster marker will be highlighted
            this.mapService.updateGroupMarker(this.groupName, this.alarms);
            this.changeDetectorRef.markForCheck();
        }
    };
    AlarmMarkerGroup.prototype.checkGroupSelection = function () {
        // Alarm selection has changed. If no alarms in the group are selected, deselect the group
        var found = false;
        var selectedAlarms = this.alarmService.getSelectedAlarms();
        // Determine if an alarm is selected that is in this group
        for (var alarm in selectedAlarms) {
            var groupName = this.mapService.getAlarmMarkerId(selectedAlarms[alarm]);
            if (groupName === this.groupName) {
                found = true;
                break;
            }
        }
        this.changeSelectionState(found);
        this.checkChildSelection();
    };
    AlarmMarkerGroup.prototype.selectionChanged = function () {
        this.checkGroupSelection();
    };
    AlarmMarkerGroup.prototype.ngOnChanges = function (changes) {
        if (changes.alarms) {
            if (this.selected) {
                if (this.alarms.length > 1) {
                    this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
                }
                else {
                    this.mapService.closeOverlappingAlarms(this.groupName);
                }
            }
            else {
                this.mapService.closeOverlappingAlarms(this.groupName);
            }
        }
    };
    AlarmMarkerGroup.prototype.deselectGroup = function (groupName) {
        if (this.groupName === groupName) {
            this.selected = false;
        }
    };
    AlarmMarkerGroup.prototype.ngOnDestroy = function () {
        this.mapService.removeAlarmMarker(this.groupName);
        this.mapService.closeOverlappingAlarms(this.groupName);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AlarmMarkerGroup.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], AlarmMarkerGroup.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], AlarmMarkerGroup.prototype, "alarmService", void 0);
    AlarmMarkerGroup = __decorate([
        Component({
            selector: 'alarm-marker-group',
            templateUrl: 'alarm-marker-group.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmMapService, ChangeDetectorRef])
    ], AlarmMarkerGroup);
    return AlarmMarkerGroup;
}());
export { AlarmMarkerGroup };
//# sourceMappingURL=alarm-marker-group.component.js.map