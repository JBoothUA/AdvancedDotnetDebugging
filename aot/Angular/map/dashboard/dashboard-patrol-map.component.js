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
import { LeafletMap } from '../../map/leaflet-map.component';
import { Component, Input, NgZone, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../../map/map.service';
import { AlarmMapService } from '../../map/alarms/alarmMap.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { DashboardPatrolService } from '../../dashboard/dashboard-patrol.service';
import { Platform } from '../../platforms/platform.class';
import { PatrolInstance } from '../../patrols/patrol.class';
import 'rxjs/add/operator/takeUntil';
import { LocationMapService } from '../../map/locations/locationMap.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { DashboardPatrolMapService } from './dashboard-patrol-map.service';
import { DashboardAlarmService } from '../../dashboard/dashboard-alarm.service';
import { MapUtilityService } from '../../map/map-utility.service';
var DashboardPatrolMap = /** @class */ (function (_super) {
    __extends(DashboardPatrolMap, _super);
    function DashboardPatrolMap(mapService, zone, patrolMapService, platformService, alarmMapService, platformMapService, changeDetectorRef, elementRef, locationMapService, locationFilterService, alarmService, patrolService, mapUtilityService) {
        var _this = _super.call(this, mapService, zone, patrolMapService, platformService, alarmMapService, platformMapService, changeDetectorRef, elementRef, locationMapService, locationFilterService, mapUtilityService, patrolService) || this;
        _this.mapService = mapService;
        _this.zone = zone;
        _this.patrolMapService = patrolMapService;
        _this.platformService = platformService;
        _this.alarmMapService = alarmMapService;
        _this.platformMapService = platformMapService;
        _this.changeDetectorRef = changeDetectorRef;
        _this.elementRef = elementRef;
        _this.locationMapService = locationMapService;
        _this.locationFilterService = locationFilterService;
        _this.alarmService = alarmService;
        _this.patrolService = patrolService;
        _this.mapUtilityService = mapUtilityService;
        _this.mapElementId = 'map';
        //@Input() zoom: number = 21;
        //@Input() zoomControl: boolean = false;
        //@Input() scrollWheelZoom: boolean = false;
        //@Input() dragging: boolean = false;
        //@Input() showAttribution: boolean = false;
        _this.historical = false;
        return _this;
    }
    DashboardPatrolMap.prototype.setMaps = function (map) {
        var _this = this;
        this.mapService.setMap(map);
        this.patrolMapService.setMap(map);
        this.alarmMapService.setMap(map);
        this.platformMapService.setMap(map);
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.selectedPlatform) {
                    if (platform.id === _this.selectedPlatform.id) {
                        _this.changeDetectorRef.detectChanges();
                    }
                }
            }
        });
        this.platformMapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (zoom) {
                if (!_this.platformMapService.manualZoomMode) {
                    if (zoom >= 19) {
                        _this.platformMapService.showPlatformMarkers();
                    }
                    else {
                        _this.platformMapService.hidePlatformMarkers();
                    }
                }
            }
        });
    };
    DashboardPatrolMap.prototype.getCenter = function () {
        if (this.selectedPlatform) {
            return [this.selectedPlatform.Position.coordinates[1], this.selectedPlatform.Position.coordinates[0]];
        }
        else {
            return this.center;
        }
    };
    DashboardPatrolMap.prototype.getMarkerId = function () {
        return 'pf-marker-' + this.selectedPlatform.id;
    };
    DashboardPatrolMap.prototype.handleMove = function () {
        this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
    };
    DashboardPatrolMap.prototype.ngOnDestroy = function () {
        this.mapService.destroyMap();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], DashboardPatrolMap.prototype, "selectedPatrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], DashboardPatrolMap.prototype, "selectedPlatform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], DashboardPatrolMap.prototype, "selectedPatrolAlarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], DashboardPatrolMap.prototype, "mapElementId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], DashboardPatrolMap.prototype, "historical", void 0);
    DashboardPatrolMap = __decorate([
        Component({
            selector: 'dashboard-patrol-map',
            templateUrl: 'dashboard-patrol-map.component.html',
            styleUrls: ['dashboard-patrol-map.component.css'],
            // Provide MapService and PlatformMapService so that we have a new instance of them
            providers: [MapService, PlatformMapService, AlarmMapService, MapUtilityService],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MapService,
            NgZone,
            DashboardPatrolMapService,
            PlatformService,
            AlarmMapService,
            PlatformMapService,
            ChangeDetectorRef,
            ElementRef,
            LocationMapService,
            LocationFilterService,
            DashboardAlarmService,
            DashboardPatrolService,
            MapUtilityService])
    ], DashboardPatrolMap);
    return DashboardPatrolMap;
}(LeafletMap));
export { DashboardPatrolMap };
//# sourceMappingURL=dashboard-patrol-map.component.js.map