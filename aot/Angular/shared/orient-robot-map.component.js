var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { MapService } from '../map/map.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { MapUtilityService } from '../map/map-utility.service';
import { MapCreateOptions } from './map-settings.class';
var OrientRobotMap = /** @class */ (function () {
    function OrientRobotMap(mapService, zone, mapUtilityService) {
        this.mapService = mapService;
        this.zone = zone;
        this.mapUtilityService = mapUtilityService;
        this.zoom = 16;
        this.zoomControl = false;
        this.scrollWheelZoom = 'center';
        this.dragging = false;
        this.showAttribution = false;
        this.ngUnsubscribe = new Subject();
        this.orientMapId = 'orient-robot-map-' + this.createGUID();
    }
    OrientRobotMap.prototype.ngAfterViewInit = function () {
        var _this = this;
        var mapOptions = new MapCreateOptions();
        mapOptions.AttributionControl = this.showAttribution;
        mapOptions.ZoomControl = this.zoomControl;
        mapOptions.ScrollWheelZoom = this.scrollWheelZoom;
        mapOptions.Dragging = this.dragging;
        mapOptions.Keyboard = this.dragging;
        mapOptions.DoubleClickZoom = false;
        mapOptions.MinZoom = 4;
        mapOptions.MaxZoom = 28;
        if (this.dataItems && this.dataItems.length === 1) {
            var coords = this.getPositionCoords(this.dataItems[0].Position);
            var center = L.latLng([coords[1], coords[0]]);
            mapOptions.Center = center;
            mapOptions.Zoom = this.zoom;
        }
        this.map = this.mapUtilityService.createMap(this.orientMapId, mapOptions, (function () { _this.finishMapSetup(_this.map); }));
    };
    OrientRobotMap.prototype.finishMapSetup = function (map) {
        this.markerGroup = L.featureGroup();
        map.addLayer(this.markerGroup);
        this.setMaps(map);
        if (this.dataItems) {
            for (var ii = 0; ii < this.dataItems.length; ii++) {
                var dataItem = this.dataItems[ii];
                var id = this.getMarkerId(ii);
                var orientValue = this.orientationValue && this.orientationValue !== '' ? this.orientationValue : '0';
                var coords = this.getPositionCoords(dataItem.Position);
                var pt = L.latLng([coords[1], coords[0]]);
                var html = '<div id="' + id + '" class="orientationMarker" style="transform:rotate(' + orientValue + 'deg)"></div>';
                var iconOptions = { html: html, iconSize: [25, 25] };
                var icon = L.divIcon(iconOptions);
                var markerOptions = { icon: icon, interactive: false };
                var marker = L.marker(pt, markerOptions);
                if (marker) {
                    this.markerGroup.addLayer(marker);
                }
            }
            if (this.dataItems.length === 1) {
                this.setZoomCenter();
            }
            else {
                this.fitBoundsFromData();
            }
        }
    };
    OrientRobotMap.prototype.ngOnDestroy = function () {
        this.mapService.destroyMap();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    OrientRobotMap.prototype.setMaps = function (map) {
        this.mapService.setMap(map);
    };
    OrientRobotMap.prototype.setZoomCenter = function () {
        if (this.dataItems && this.dataItems.length === 1) {
            var coords = this.getPositionCoords(this.dataItems[0].Position);
            var center = L.latLng([coords[1], coords[0]]);
            this.mapService.map.setView(center, this.zoom);
        }
    };
    OrientRobotMap.prototype.fitBoundsFromData = function () {
        if (this.dataItems && this.dataItems.length > 1) {
            var pts = [];
            for (var ii = 0; ii < this.dataItems.length; ii++) {
                var coords = this.getPositionCoords(this.dataItems[ii].Position);
                pts.push(L.latLng([coords[1], coords[0]]));
            }
            var bnds = L.latLngBounds(pts).pad(0.25);
            this.mapService.map.fitBounds(bnds);
        }
    };
    OrientRobotMap.prototype.updateDataItems = function (dataItems) {
        this.markerGroup.clearLayers();
        this.dataItems = dataItems;
        if (this.dataItems) {
            for (var ii = 0; ii < this.dataItems.length; ii++) {
                var dataItem = this.dataItems[ii];
                var id = this.getMarkerId(ii);
                var orientValue = this.orientationValue && this.orientationValue !== '' ? this.orientationValue : '0';
                var coords = this.getPositionCoords(dataItem.Position);
                var pt = L.latLng([coords[1], coords[0]]);
                var html = '<div id="' + id + '" class="orientationMarker" style="transform:rotate(' + orientValue + 'deg)"></div>';
                var iconOptions = { html: html, iconSize: [25, 25] };
                var icon = L.divIcon(iconOptions);
                var markerOptions = { icon: icon, interactive: false };
                var marker = L.marker(pt, markerOptions);
                if (marker) {
                    this.markerGroup.addLayer(marker);
                }
            }
            if (this.dataItems.length === 1) {
                this.setZoomCenter();
            }
            else {
                this.fitBoundsFromData();
            }
        }
    };
    OrientRobotMap.prototype.getPositionCoords = function (position) {
        var coords = [];
        if (position.Coordinates) {
            coords.push(position.Coordinates[0]);
            coords.push(position.Coordinates[1]);
        }
        else if (position.coordinates) {
            coords.push(position.coordinates[0]);
            coords.push(position.coordinates[1]);
        }
        return (coords);
    };
    OrientRobotMap.prototype.getZoomForBounds = function (bnds) {
        var zoom = this.mapService.map.getBoundsZoom(bnds);
        return zoom;
    };
    OrientRobotMap.prototype.setOrientationValue = function (orientationValue) {
        if (orientationValue && orientationValue !== '') {
            for (var ii = 0; this.dataItems && (ii < this.dataItems.length); ii++) {
                var id = this.getMarkerId(ii);
                var newRotate = 'rotate(' + orientationValue + 'deg)';
                var $elem = $('#' + id);
                if ($elem.length > 0) {
                    $elem.css('transform', newRotate);
                }
            }
        }
    };
    OrientRobotMap.prototype.getMarkerId = function (index) {
        if (!this.dataItems || !this.dataItems.length) {
            return;
        }
        if (this.dataItems[index].PointId) {
            return ('om-' + this.dataItems[index].PointId + '-' + this.orientMapId);
        }
        else {
            return ('om-' + this.dataItems[index].id + '-' + this.orientMapId);
        }
    };
    OrientRobotMap.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return (guid);
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], OrientRobotMap.prototype, "dataItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], OrientRobotMap.prototype, "orientationValue", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], OrientRobotMap.prototype, "zoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], OrientRobotMap.prototype, "zoomControl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], OrientRobotMap.prototype, "scrollWheelZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], OrientRobotMap.prototype, "dragging", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], OrientRobotMap.prototype, "showAttribution", void 0);
    OrientRobotMap = __decorate([
        Component({
            selector: 'orient-robot-map',
            templateUrl: 'orient-robot-map.component.html',
            styleUrls: ['orient-robot-map.component.css'],
            // Provide MapService and PlatformMapService so that we have a new instance of them
            providers: [MapService, PlatformMapService, MapUtilityService],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MapService, NgZone, MapUtilityService])
    ], OrientRobotMap);
    return OrientRobotMap;
}());
export { OrientRobotMap };
//# sourceMappingURL=orient-robot-map.component.js.map