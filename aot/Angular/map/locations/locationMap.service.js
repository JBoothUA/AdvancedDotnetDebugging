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
import { Injectable } from '@angular/core';
import { MapService } from '../map.service';
import { NavigationService } from '../../shared/navigation.service';
import { PlatformService } from '../../platforms/platform.service';
import { UserService } from '../../shared/user.service';
var locationMapItem = /** @class */ (function () {
    function locationMapItem() {
    }
    return locationMapItem;
}());
var LocationMapService = /** @class */ (function (_super) {
    __extends(LocationMapService, _super);
    function LocationMapService(navigationService, platformService, userService) {
        var _this = _super.call(this, navigationService) || this;
        _this.navigationService = navigationService;
        _this.platformService = platformService;
        _this.userService = userService;
        _this.locationMarkers = [];
        // Temporary for show, as locations do not currently have a position
        _this.positionMap = [];
        //let intergraph: locationMapItem = { id: 'c093abb5-58be-410b-80bf-ca7a52e52ac3', position: [34.674127733327126, -86.74312099814418], zoom: 20 };
        //let hxgn: locationMapItem = { id: '3eae2d1d-f3d8-46c0-b41d-3cd4c8113c16', position: [36.121566227189106, -115.16587972640993], zoom: 21 };
        //let gamma2: locationMapItem = { id: '37e4434b-0d2c-47d0-8bef-033ea5bd28a2', position: [39.65025666441283, -105.07308058440687], zoom: 21 };
        //this.positionMap.push(intergraph);
        //this.positionMap.push(hxgn);
        //this.positionMap.push(gamma2);
        _this.visibleMarkers = false;
        return _this;
    }
    LocationMapService.prototype.getMarker = function (markerId) {
        return _super.prototype.getMarker.call(this, markerId, this.locationMarkers);
    };
    LocationMapService.prototype.setMap = function (map) {
        _super.prototype.setMap.call(this, map);
        if (map) {
            this.locationMarkerGroup = L.markerClusterGroup({
                removeOutsideVisibleBounds: false,
                spiderfyDistanceMultiplier: 3,
                showCoverageOnHover: false,
                disableClusteringAtZoom: 1,
                chunkedLoading: true
            });
            this.map.addLayer(this.locationMarkerGroup);
            //this.map.on('click', (e: any) => {
            //	console.info('Lat Lon', e.latlng.lat, e.latlng.lng);
            //});
        }
        else {
            this.locationMarkerGroup = null;
        }
    };
    // Temporary for show
    LocationMapService.prototype.findLocation = function (locationId) {
        var tenant = this.userService.currentUser.tenant;
        var loc;
        if (tenant.Locations) {
            loc = tenant.Locations.find(function (elem) { return (elem.Id === locationId); });
        }
        if (!loc && this.userService.currentUser.childTenants) {
            for (var _i = 0, _a = this.userService.currentUser.childTenants; _i < _a.length; _i++) {
                var childTenant = _a[_i];
                loc = childTenant.Locations.find(function (elem) { return (elem.Id === locationId); });
                if (loc) {
                    break;
                }
            }
        }
        //for (let position of this.positionMap) {
        //    if (position.id === locationId) {
        //        return position;
        //    }
        //}
        return loc;
    };
    LocationMapService.prototype.createLocationMarker = function (markerId, location) {
        //let obj = this.findLocation(location.Id);
        var pos = location.MapSettings && location.MapSettings.MapCenter ? location.MapSettings.MapCenter : null;
        if (pos) {
            var icon = new L.SmartCommandIcon({ targetId: markerId, iconSize: new L.Point(47, 65), iconAnchor: new L.Point(24, 65) });
            var marker = new L.SmartCommandMarker(new L.LatLng(pos.Coordinates[1], pos.Coordinates[0]), { icon: icon });
            marker.RefId = location.Id;
            marker.DisplayName = location.Name;
            marker.Type = L.ScMarkerTypes.Location;
            marker.MarkerId = markerId;
            if (this.visibleMarkers) {
                this.locationMarkerGroup.addLayer(marker);
            }
            this.locationMarkers.push(marker);
        }
    };
    LocationMapService.prototype.removeLocationMarker = function (markerId) {
        var marker = this.getMarker(markerId);
        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.locationMarkerGroup.removeLayer(marker);
                }
                catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }
            var index = this.locationMarkers.indexOf(marker);
            if (index !== -1) {
                this.locationMarkers.splice(index, 1);
            }
        }
    };
    LocationMapService.prototype.zoomToLocation = function (markerId) {
        var marker = this.getMarker(markerId);
        if (marker) {
            var loc = this.findLocation(marker.RefId);
            if (loc) {
                this.zoomTo(marker, loc.MapSettings.ZoomLevel);
            }
        }
    };
    LocationMapService.prototype.fitMarkers = function () {
        // If only one location is selected, pan to it if it is near the current 
        if (this.locationMarkers.length === 1) {
            this.zoomToLocation(this.locationMarkers[0].MarkerId);
        }
        else if (this.locationMarkers.length > 1) {
            var group = L.featureGroup(this.locationMarkers);
            this.map.fitBounds(group.getBounds().pad(0.3));
        }
    };
    LocationMapService.prototype.hideLocationMarkers = function () {
        if (this.visibleMarkers) {
            try {
                this.locationMarkerGroup.clearLayers();
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = false;
        }
    };
    LocationMapService.prototype.showLocationMarkers = function () {
        if (!this.visibleMarkers) {
            try {
                this.locationMarkerGroup.addLayers(this.locationMarkers);
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = true;
        }
    };
    LocationMapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NavigationService, PlatformService, UserService])
    ], LocationMapService);
    return LocationMapService;
}(MapService));
export { LocationMapService };
//# sourceMappingURL=locationMap.service.js.map