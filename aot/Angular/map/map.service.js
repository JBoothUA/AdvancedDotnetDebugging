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
import { Subject } from 'rxjs/Subject';
import { NavigationService } from '../shared/navigation.service';
var MapService = /** @class */ (function () {
    function MapService(navigationService) {
        this.navigationService = navigationService;
        this.visibleMarkers = true;
        this.zoomChanged = new Subject();
        this.centerOffsetX = 0;
        this.centerOffsetY = 0;
        L.Icon.Default.imagePath = '/Content/Images/Leaflet/';
        this.baseMaps = {
            OpenStreetMap: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }),
            MapBox: L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamJvb3RoIiwiYSI6ImNpdXk4MHF2eDA0NnEyb25vNmFxY2N0amkifQ._0rgAd8uU5v7Slxy_X6rZw', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18
            }),
            WMS: L.tileLayer.wms('http://vm-aliens.ingrnet.com/Bldg305/service.svc/get', {
                crs: L.CRS.EPSG3857,
                format: 'image/png',
                transparent: true,
                minZoom: 19,
                maxZoom: 28,
                layers: 'FourthFloor',
                version: '1.3.0'
            })
        };
    }
    MapService.prototype.getMapZoom = function () {
        return this.map.getZoom();
    };
    MapService.prototype.zoomTo = function (marker, zoomLevel) {
        if (zoomLevel === void 0) { zoomLevel = 19; }
        if (marker) {
            var pos = marker.getLatLng();
            var targetPoint = this.map.project(pos, zoomLevel).subtract([this.centerOffsetX, this.centerOffsetY]);
            pos = this.map.unproject(targetPoint, zoomLevel);
            this.map.setView(pos, zoomLevel);
        }
    };
    MapService.prototype.zoomToMapLocation = function (position, zoomLevel) {
        if (position) {
            var pos = this.convertPositionToLatLng(position);
            this.map.setView(pos, zoomLevel);
        }
    };
    MapService.prototype.convertPositionToLatLng = function (position) {
        var latLng = L.latLng([position.Coordinates[1], position.Coordinates[0]]);
        return (latLng);
    };
    MapService.prototype.panTo = function (marker) {
        if (this.map) {
            if (marker) {
                var pos = marker.getLatLng();
                var targetPoint = this.map.project(pos, this.map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
                pos = this.map.unproject(targetPoint, this.map.getZoom());
                this.map.panTo(pos);
            }
        }
    };
    MapService.prototype.panToCenter = function () {
        var pos = this.map.getCenter();
        var targetPoint = this.map.project(pos, this.map.getZoom()).subtract([this.centerOffsetX, this.centerOffsetY]);
        pos = this.map.unproject(targetPoint, this.map.getZoom());
        this.map.panTo(pos);
    };
    MapService.prototype.setMap = function (map) {
        var _this = this;
        this.map = map;
        if (this.map) {
            this.map.on('zoomend', function (e) {
                _this.zoomChanged.next(_this.map.getZoom());
            });
        }
    };
    MapService.prototype.destroyMap = function () {
        if (this.map) {
            try {
                this.map.remove();
                this.map = null;
            }
            catch (e) {
                // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                this.map = null;
                if (!this.navigationService.RouteChanging) {
                    console.error(e);
                }
            }
        }
    };
    MapService.prototype.refreshMap = function () {
        if (this.map) {
            this.map.invalidateSize({ animate: true });
        }
    };
    MapService.prototype.updateMarker = function (marker) {
        marker.update();
    };
    MapService.prototype.getMarker = function (markerId, list) {
        var marker = list.filter(function (val) {
            return val.MarkerId === markerId;
        });
        return marker.length ? marker[0] : undefined;
    };
    MapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NavigationService])
    ], MapService);
    return MapService;
}());
export { MapService };
//# sourceMappingURL=map.service.js.map