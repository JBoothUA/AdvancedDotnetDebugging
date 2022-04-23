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
import { MapService } from '../map.service';
import { AlarmMapService } from '../alarms/alarmMap.service';
import { AlarmMarkerSort } from '../alarms/alarm-marker-sort';
import { LocationFilterService } from '../../shared/location-filter.service';
import { PlatformService } from '../../platforms/platform.service';
var markerGroup = /** @class */ (function () {
    function markerGroup() {
    }
    return markerGroup;
}());
var AlarmMarkerCollection = /** @class */ (function () {
    function AlarmMarkerCollection(mapService, alarmMarkerSort, alarmMapService, changeDetectorRef, locationFilterService, platformService) {
        this.mapService = mapService;
        this.alarmMarkerSort = alarmMarkerSort;
        this.alarmMapService = alarmMapService;
        this.changeDetectorRef = changeDetectorRef;
        this.locationFilterService = locationFilterService;
        this.platformService = platformService;
        this.ngUnsubscribe = new Subject();
    }
    AlarmMarkerCollection.prototype.ngOnInit = function () {
        var _this = this;
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.editedAlarm(alarm); }
        });
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (mapContext) { return _this.alarmSelectionChanged(mapContext); }
        });
        this.alarmMapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (zoom) {
                if (!_this.alarmMapService.manualZoomMode) {
                    if (zoom >= 10) {
                        _this.alarmMapService.showAlarmMarkers();
                    }
                    else {
                        _this.alarmMapService.hideAlarmMarkers();
                        _this.changeDetectorRef.detectChanges();
                    }
                }
            }
        });
        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                // When platform selection changed, update all selected alarms to recalculate z-index
                var selAlarms = _this.alarmService.getSelectedAlarms();
                for (var _i = 0, selAlarms_1 = selAlarms; _i < selAlarms_1.length; _i++) {
                    var selAlarm = selAlarms_1[_i];
                    _this.alarmMapService.refreshMarker(_this.alarmMapService.getAlarmMarkerId(selAlarm));
                }
            }
        });
    };
    AlarmMarkerCollection.prototype.editedAlarm = function (alarm) {
        var groupName = this.alarmMapService.getAlarmMarkerId(alarm);
        for (var group in this.groups) {
            if (this.groups[group].groupName === groupName) {
                var index = this.indexOf(alarm.Id, this.groups[group].alarms);
                if (index === -1) {
                    return;
                }
                this.alarmMapService.updateGroupMarker(this.groups[group].groupName, this.groups[group].alarms);
                break;
            }
        }
        this.alarmMarkerSort.sortAlarmMarkers(this.groups);
    };
    AlarmMarkerCollection.prototype.indexOf = function (id, array) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i].Id === id) {
                return i;
            }
        }
        return -1;
    };
    AlarmMarkerCollection.prototype.groupAlarms = function () {
        var alarmGroups = [];
        for (var index in this.alarms) {
            if (this.alarms[index].Position !== null) {
                var groupName = this.alarmMapService.getAlarmMarkerId(this.alarms[index]);
                if (alarmGroups[groupName] === undefined) {
                    alarmGroups[groupName] = [this.alarms[index]];
                }
                else {
                    alarmGroups[groupName].push(this.alarms[index]);
                }
            }
        }
        var groupedAlarms = Object.keys(alarmGroups).map(function (groupName) { return ({ groupName: groupName, alarms: alarmGroups[groupName] }); });
        this.alarmMarkerSort.sortAlarmMarkers(groupedAlarms);
        this.groups = groupedAlarms;
        this.changeDetectorRef.detectChanges();
    };
    AlarmMarkerCollection.prototype.alarmSelectionChanged = function (mapContext) {
        if (!mapContext) {
            this.alarmMapService.fitMarkers(this.alarmService.getSelectedAlarms());
        }
    };
    AlarmMarkerCollection.prototype.ngOnChanges = function (changes) {
        if (changes.alarms.previousValue && (changes.alarms.currentValue && changes.alarms.currentValue.length !== changes.alarms.previousValue.length) || changes.alarms.firstChange) {
            this.groupAlarms();
        }
    };
    AlarmMarkerCollection.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AlarmMarkerCollection.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], AlarmMarkerCollection.prototype, "alarmService", void 0);
    AlarmMarkerCollection = __decorate([
        Component({
            selector: 'alarm-marker-collection',
            templateUrl: 'alarm-marker-collection.component.html',
            providers: [AlarmMarkerSort],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MapService, AlarmMarkerSort,
            AlarmMapService, ChangeDetectorRef,
            LocationFilterService, PlatformService])
    ], AlarmMarkerCollection);
    return AlarmMarkerCollection;
}());
export { AlarmMarkerCollection };
//# sourceMappingURL=alarm-marker-collection.component.js.map