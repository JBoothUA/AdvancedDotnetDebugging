var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { MapService } from './map.service';
import { AlarmMapService } from './alarms/alarmMap.service';
import { PlatformMapService } from './platforms/platformMap.service';
import { AlarmMarkerSort } from './alarms/alarm-marker-sort';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolTemplate } from '../patrols/patrol.class';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { MapViewOptions } from '../shared/map-view-options.class';
import { MapUtilityService } from '../map/map-utility.service';
import { MapCreateOptions, MapControlPositions } from '../shared/map-settings.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
//declare let robotMaps: any;
var markerGroup = /** @class */ (function () {
    function markerGroup() {
    }
    return markerGroup;
}());
var LeafletMap = /** @class */ (function () {
    function LeafletMap(mapService, zone, patrolMapService, platformService, alarmMapService, platformMapService, changeDetectorRef, elementRef, locationMapService, locationFilterService, mapUtilityService, patrolService) {
        this.mapService = mapService;
        this.zone = zone;
        this.patrolMapService = patrolMapService;
        this.platformService = platformService;
        this.alarmMapService = alarmMapService;
        this.platformMapService = platformMapService;
        this.changeDetectorRef = changeDetectorRef;
        this.elementRef = elementRef;
        this.locationMapService = locationMapService;
        this.locationFilterService = locationFilterService;
        this.mapUtilityService = mapUtilityService;
        this.patrolService = patrolService;
        this.alarms = [];
        this.platforms = [];
        this.locations = [];
        this.showPatrols = true;
        this.showOverlappingAlarms = false;
        this.zoomControl = true;
        this.scrollWheelZoom = true;
        this.dragging = true;
        this.showAttribution = true;
        this.patrol = new PatrolTemplate(null);
        this.locationFilterChanged = false;
        this.firstLocationFilterChange = true;
        this.ngUnsubscribe = new Subject();
    }
    //A easy hook
    LeafletMap.prototype.onInit = function (map) { };
    LeafletMap.prototype.ngOnInit = function () {
        var _this = this;
        if (this.locationView) {
            this.locationFilterService.locationsChanged
                .takeUntil(this.ngUnsubscribe)
                .subscribe({
                next: function (view) { return _this.filterChanged(view); }
            });
            this.locations = this.locationFilterService.getSelectedLocations(this.locationView);
            for (var ii = this.locations.length - 1; ii >= 0; ii--) {
                if (!this.locations[ii].MapSettings || (this.locations[ii].MapSettings && !this.locations[ii].MapSettings.MapCenter)) {
                    this.locations.splice(ii, 1);
                }
            }
        }
        $(function () {
            // Leaflet map requires a set height. Calculate height based upon a specified element if a heightElementId is provided
            if (_this.heightElementId) {
                _this.refreshMap();
                $(window).on('resize', function (e) {
                    _this.refreshMap();
                });
            }
        });
        var mapOptions = new MapCreateOptions();
        mapOptions.AttributionControl = this.showAttribution;
        mapOptions.ZoomControl = this.zoomControl;
        mapOptions.ZoomControlPosition = MapControlPositions.TopLeft;
        mapOptions.ScrollWheelZoom = this.scrollWheelZoom;
        mapOptions.Dragging = this.dragging;
        mapOptions.Keyboard = this.dragging;
        mapOptions.DoubleClickZoom = false;
        mapOptions.MinZoom = 4;
        mapOptions.MaxZoom = 28;
        if (this.zoom) {
            mapOptions.Zoom = this.zoom;
        }
        var center = this.getCenter();
        if (center) {
            mapOptions.Center = new L.LatLng(center[0], center[1]);
        }
        var map = this.mapUtilityService.createMap(this.mapElementId, mapOptions, (function () { _this.showLocationMarkers(map); }));
        this.setMaps(map);
        this.onInit(map);
    };
    LeafletMap.prototype.showLocationMarkers = function (map) {
        if (map.getZoom() >= 10) {
            this.locationMapService.hideLocationMarkers();
            this.alarmMapService.showAlarmMarkers();
            if (map.getZoom() >= 19) {
                this.platformMapService.showPlatformMarkers();
            }
        }
        else {
            this.locationMapService.showLocationMarkers();
            this.alarmMapService.hideAlarmMarkers();
            this.platformMapService.hidePlatformMarkers();
        }
    };
    LeafletMap.prototype.refreshMap = function () {
        $('#' + this.mapElementId).height($('#' + this.heightElementId).height());
        this.mapService.refreshMap();
    };
    LeafletMap.prototype.getCenter = function () {
        return this.center;
    };
    LeafletMap.prototype.setMaps = function (map) {
        this.mapService.setMap(map);
        this.patrolMapService.setMap(map);
        this.alarmMapService.setMap(map);
        this.platformMapService.setMap(map);
        this.locationMapService.setMap(map);
    };
    LeafletMap.prototype.filterChanged = function (view) {
        if (this.locationView && this.locationView === view) {
            // Location filter was updated, so create location markers and fit in map view
            this.locations = this.locationFilterService.getSelectedLocations(this.locationView);
            // Remove locations with no map center data
            for (var ii = this.locations.length - 1; ii >= 0; ii--) {
                if (!this.locations[ii].MapSettings || (this.locations[ii].MapSettings && !this.locations[ii].MapSettings.MapCenter)) {
                    this.locations.splice(ii, 1);
                }
            }
            if (this.firstLocationFilterChange) {
                this.firstLocationFilterChange = false;
            }
            else {
                this.locationFilterChanged = true;
            }
            this.changeDetectorRef.detectChanges();
        }
    };
    LeafletMap.prototype.ngOnDestroy = function () {
        this.mapService.destroyMap();
        this.mapService.setMap(null);
        this.patrolMapService.setMap(null);
        this.alarmMapService.setMap(null);
        this.platformMapService.setMap(null);
        this.locationMapService.setMap(null);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    LeafletMap.prototype.indexOf = function (id, array) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i].Id === id) {
                return i;
            }
        }
        return -1;
    };
    LeafletMap.prototype.zoomToMapLocation = function (location) {
        if (location && location.MapSettings && location.MapSettings.MapCenter) {
            this.mapService.zoomToMapLocation(location.MapSettings.MapCenter, location.MapSettings.ZoomLevel);
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], LeafletMap.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], LeafletMap.prototype, "platforms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], LeafletMap.prototype, "locations", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], LeafletMap.prototype, "mapElementId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], LeafletMap.prototype, "heightElementId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", AlarmService)
    ], LeafletMap.prototype, "alarmService", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "showPatrols", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "showOverlappingAlarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], LeafletMap.prototype, "zoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], LeafletMap.prototype, "center", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "zoomControl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "scrollWheelZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "dragging", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LeafletMap.prototype, "showAttribution", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], LeafletMap.prototype, "locationView", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], LeafletMap.prototype, "mapViewOptions", void 0);
    __decorate([
        ViewChild('mapElement'),
        __metadata("design:type", ElementRef)
    ], LeafletMap.prototype, "mapElement", void 0);
    LeafletMap = __decorate([
        Component({
            selector: 'leaflet-map',
            templateUrl: 'leaflet-map.component.html',
            providers: [AlarmMarkerSort, MapUtilityService],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MapService, NgZone, PatrolMapService,
            PlatformService, AlarmMapService, PlatformMapService,
            ChangeDetectorRef, ElementRef, LocationMapService,
            LocationFilterService,
            MapUtilityService,
            PatrolService])
    ], LeafletMap);
    return LeafletMap;
}());
export { LeafletMap };
//# sourceMappingURL=leaflet-map.component.js.map