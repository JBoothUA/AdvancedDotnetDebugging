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
import { Location } from '../../shared/location.class';
import { LocationMapService } from './locationMap.service';
import { AlarmService } from '../../alarms/alarm.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var LocationMarker = /** @class */ (function () {
    function LocationMarker(mapService, alarmService, changeDetectorRef) {
        this.mapService = mapService;
        this.alarmService = alarmService;
        this.changeDetectorRef = changeDetectorRef;
        this.highestPriority = 10;
        this.ngUnsubscribe = new Subject();
    }
    LocationMarker.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.mapService.createLocationMarker(this.markerId, this.location);
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.changeDetectorRef.detectChanges(); }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.changeDetectorRef.detectChanges(); }
        });
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (status) {
                if (status) {
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
    };
    LocationMarker.prototype.getImageSrc = function () {
        var highestPriority = 10;
        for (var _i = 0, _a = this.alarmService.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            if (alarm.LocationId === this.location.Id) {
                if (alarm.Priority < highestPriority) {
                    highestPriority = alarm.Priority;
                }
                break;
            }
        }
        if (highestPriority !== 10) {
            return "/Content/Images/Leaflet/location-p" + highestPriority + "-alarms.png";
        }
        else {
            return '/Content/Images/Leaflet/location-no-alarms.png';
        }
    };
    LocationMarker.prototype.zoomToLocation = function () {
        this.mapService.zoomToLocation(this.markerId);
    };
    LocationMarker.prototype.ngOnDestroy = function () {
        this.mapService.removeLocationMarker(this.markerId);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Location)
    ], LocationMarker.prototype, "location", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], LocationMarker.prototype, "markerId", void 0);
    LocationMarker = __decorate([
        Component({
            selector: 'location-marker',
            templateUrl: 'location-marker.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [LocationMapService, AlarmService, ChangeDetectorRef])
    ], LocationMarker);
    return LocationMarker;
}());
export { LocationMarker };
//# sourceMappingURL=location-marker.component.js.map