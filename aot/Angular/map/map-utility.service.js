var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NgZone } from '@angular/core';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { LayerFormat } from '../shared/map-layer.class';
import { MapControlPositions, MapCreateOptions } from '../shared/map-settings.class';
import { LocationFilterService } from '../shared/location-filter.service';
var MapUtilityService = /** @class */ (function () {
    function MapUtilityService(httpService, ngZone, userService, locFilterService) {
        this.httpService = httpService;
        this.ngZone = ngZone;
        this.userService = userService;
        this.locFilterService = locFilterService;
        this.radToDegrees = 180 / Math.PI;
        this.degreesToRad = Math.PI / 180;
        this.fitBoundsOptions = { padding: [5, 5] };
        this.leafletLayers = [];
        this.userTenant = userService.currentUser.tenant;
        this.childTenants = userService.currentUser.childTenants;
    }
    MapUtilityService.prototype.setUserTenantInfo = function (userTenant, childTenants) {
        this.userTenant = userTenant;
        this.childTenants = childTenants;
    };
    MapUtilityService.prototype.createMap = function (mapElementId, options, callback) {
        var _this = this;
        if (options === void 0) { options = new MapCreateOptions(); }
        if (callback === void 0) { callback = null; }
        var mapOptions = {};
        var custZoomCenter = false;
        var secInfo = {};
        secInfo.CustZoomLayers = {};
        this.leafletLayers = [];
        this.leafletLayers.push(L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }));
        if (this.leafletLayers[0]) {
            this.leafletLayers[0]._secInfo = {};
            this.leafletLayers[0]._secInfo.Id = 'openstreet';
        }
        if (this.userTenant.MapSettings && this.userTenant.MapSettings.Layers) {
            for (var _i = 0, _a = this.userTenant.MapSettings.Layers; _i < _a.length; _i++) {
                var mapLayer = _a[_i];
                if (this.isMapLayerValid(mapLayer) && mapLayer.IsShownOnStartup) {
                    this.leafletLayers.push(this.createLayer(mapLayer));
                }
            }
        }
        this.createLayersFromLocations(this.userTenant.Locations, false);
        if (this.childTenants) {
            for (var _b = 0, _c = this.childTenants; _b < _c.length; _b++) {
                var tenant = _c[_b];
                this.createLayersFromLocations(tenant.Locations, false);
            }
        }
        for (var _d = 0, _e = this.leafletLayers; _d < _e.length; _d++) {
            var layer = _e[_d];
            if (layer._secInfo && layer._secInfo.CustMinZoom) {
                secInfo.CustZoomLayers[layer._secInfo.Id] = layer;
            }
        }
        var zoomCenter;
        zoomCenter = this.getInitZoomCenter();
        if (options.Zoom != -1) {
            zoomCenter.Zoom = options.Zoom;
            custZoomCenter = true;
        }
        if (options.Center) {
            zoomCenter.Center = options.Center;
            custZoomCenter = true;
        }
        mapOptions.layers = this.leafletLayers;
        mapOptions.zoom = zoomCenter.Zoom;
        mapOptions.center = zoomCenter.Center;
        mapOptions.doubleClickZoom = options.DoubleClickZoom;
        mapOptions.scrollWheelZoom = options.ScrollWheelZoom;
        mapOptions.dragging = options.Dragging;
        mapOptions.keyboard = options.Keyboard;
        mapOptions.zoomControl = false;
        mapOptions.attributionControl = false;
        mapOptions.minZoom = options.MinZoom;
        mapOptions.maxZoom = options.MaxZoom;
        if (options.AdditionalOptions) {
            L.Util.extend(mapOptions, options.AdditionalOptions);
        }
        this.ngZone.runOutsideAngular(function () {
            _this.map = new L.Map(mapElementId, mapOptions);
            _this.map._secInfo = secInfo;
            _this.map.on('zoomend', _this._onMapZoomEndForCustZooms, _this);
            if (options.AttributionControl) {
                L.control.attribution({ position: MapControlPositions[options.AttributionControlPosition].toLowerCase() }).addTo(_this.map);
            }
            if (options.ZoomControl) {
                L.control.zoom({ position: MapControlPositions[options.ZoomControlPosition].toLowerCase() }).addTo(_this.map);
            }
        });
        setTimeout(function () {
            if (!custZoomCenter) {
                _this.zoomToLocationBounds();
            }
            _this.map.invalidateSize();
            if (callback) {
                callback(_this.map);
            }
        }, 500);
        return (this.map);
    };
    MapUtilityService.prototype.getInitZoomCenter = function () {
        var zoomCenter = { Center: L.latLng([39.872977, -97.186965]), Zoom: 5 };
        var tenant = this.userTenant;
        if (tenant.Locations && tenant.Locations.length === 1) {
            if (tenant.Locations[0].MapSettings && tenant.Locations[0].MapSettings.MapCenter &&
                tenant.Locations[0].MapSettings.ZoomLevel !== -1) {
                zoomCenter.Center = this.convertPositionToLatLng(tenant.Locations[0].MapSettings.MapCenter);
                zoomCenter.Zoom = tenant.Locations[0].MapSettings.ZoomLevel;
            }
        }
        return (zoomCenter);
    };
    MapUtilityService.prototype.zoomToLocationBounds = function () {
        var maxZoom = 0;
        if ((this.userTenant.Locations && this.userTenant.Locations.length > 1) || this.childTenants) {
            var polygon = void 0;
            var pts = [];
            var tenant = this.userTenant;
            if (tenant.Locations) {
                for (var _i = 0, _a = tenant.Locations; _i < _a.length; _i++) {
                    var location_1 = _a[_i];
                    if (location_1.MapSettings && location_1.MapSettings.MapCenter) {
                        if (maxZoom < location_1.MapSettings.ZoomLevel) {
                            maxZoom = location_1.MapSettings.ZoomLevel;
                        }
                        pts.push(this.convertPositionToLatLng(location_1.MapSettings.MapCenter));
                    }
                }
            }
            for (var _b = 0, _c = this.childTenants; _b < _c.length; _b++) {
                var childTenant = _c[_b];
                if (childTenant.Locations) {
                    for (var _d = 0, _e = childTenant.Locations; _d < _e.length; _d++) {
                        var location_2 = _e[_d];
                        if (location_2.MapSettings && location_2.MapSettings.MapCenter) {
                            if (maxZoom < location_2.MapSettings.ZoomLevel) {
                                maxZoom = location_2.MapSettings.ZoomLevel;
                            }
                            pts.push(this.convertPositionToLatLng(location_2.MapSettings.MapCenter));
                        }
                    }
                }
            }
            if (pts.length > 1) {
                var bnds = L.latLngBounds(pts).pad(0.2);
                var bndsZoom = this.map.getBoundsZoom(bnds);
                var center = bnds.getCenter();
                if (bndsZoom > maxZoom) {
                    bndsZoom = maxZoom;
                }
                this.map.setView(center, bndsZoom);
            }
        }
    };
    MapUtilityService.prototype.isMapLayerValid = function (mapLayer) {
        var valid = false;
        if (mapLayer.URL && mapLayer.URL.length > 0) {
            switch (mapLayer.LayerFormat) {
                case LayerFormat.PlatformImage:
                case LayerFormat.Image: {
                    valid = mapLayer.Anchors && mapLayer.Anchors.length > 0 ? true : false;
                    break;
                }
                case LayerFormat.WMS: {
                    valid = mapLayer.WMSLayers && mapLayer.WMSLayers.length > 0 ? true : false;
                    break;
                }
                default:
                    valid = true;
            }
        }
        return (valid);
    };
    MapUtilityService.prototype.deleteMap = function () {
        this.map.remove();
        this.map = null;
        this.leafletLayers = [];
    };
    MapUtilityService.prototype.createLayersFromLocations = function (locations, addLayerToMap) {
        if (locations) {
            for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
                var location_3 = locations_1[_i];
                if (location_3.MapSettings && location_3.MapSettings.Layers) {
                    for (var _a = 0, _b = location_3.MapSettings.Layers; _a < _b.length; _a++) {
                        var mapLayer = _b[_a];
                        if (this.isMapLayerValid(mapLayer) && mapLayer.IsShownOnStartup) {
                            var layer = this.createLayer(mapLayer);
                            if (layer) {
                                if (addLayerToMap) {
                                    this.addLayerToMap(layer);
                                }
                                else {
                                    this.leafletLayers.push(layer);
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    MapUtilityService.prototype.createLayer = function (mapLayer) {
        var layer;
        var options = {};
        var secInfo = {};
        secInfo.MapLayer = mapLayer;
        secInfo.Id = mapLayer.Id;
        switch (mapLayer.LayerFormat) {
            case LayerFormat.PlatformImage:
            case LayerFormat.Image: {
                options.opacity = mapLayer.Opacity;
                for (var _i = 0, _a = mapLayer.Options; _i < _a.length; _i++) {
                    var option = _a[_i];
                    options[option.Name] = option.Value;
                }
                if (mapLayer.Anchors.length === 4) {
                    var anchorsLL = this.convertAnchorsPositionToLatLng(mapLayer.Anchors);
                    if (anchorsLL) {
                        layer = L.imageTransform(mapLayer.URL, anchorsLL, options);
                        if (mapLayer.IsMinMaxZoomDefined) {
                            secInfo.CustMinZoom = mapLayer.MinZoomLevel;
                            secInfo.CustMaxZoom = mapLayer.MaxZoomLevel;
                        }
                    }
                }
                break;
            }
            case LayerFormat.Tile: {
                var url = mapLayer.URL;
                if (mapLayer.IsMinMaxZoomDefined) {
                    options.minZoom = mapLayer.MinZoomLevel;
                    options.maxZoom = mapLayer.MaxZoomLevel;
                }
                options.opacity = mapLayer.Opacity;
                for (var _b = 0, _c = mapLayer.Options; _b < _c.length; _b++) {
                    var option = _c[_b];
                    if (option.Name === "crs") {
                        if (option.Value === 'EPSG3857')
                            option.Value = 'EPSG:3857';
                        var crs = void 0;
                        //crs = getCRSByName(optionValue);
                        if (crs !== null) {
                            options[option.Name] = crs;
                        }
                    }
                    else {
                        options[option.Name] = option.Value;
                    }
                }
                layer = L.tileLayer(url, options);
                break;
            }
            case LayerFormat.WMS: {
                var url = mapLayer.URL;
                if (mapLayer.LayerFormat === LayerFormat.WMS) {
                    options.layers = mapLayer.getCommaSeparatedWMSLayers();
                    if (!options.layers || options.layers.length === 0) {
                        return (null);
                    }
                }
                if (mapLayer.IsMinMaxZoomDefined) {
                    options.minZoom = mapLayer.MinZoomLevel;
                    options.maxZoom = mapLayer.MaxZoomLevel;
                }
                options.opacity = mapLayer.Opacity;
                for (var _d = 0, _e = mapLayer.Options; _d < _e.length; _d++) {
                    var option = _e[_d];
                    if (option.Name === "crs") {
                        if (option.Value === 'EPSG3857')
                            option.Value = 'EPSG:3857';
                        var crs = void 0;
                        //crs = getCRSByName(optionValue);
                        if (crs !== null) {
                            options[option.Name] = crs;
                        }
                    }
                    else {
                        options[option.Name] = option.Value;
                    }
                }
                if (!options.version) {
                    options.version = '1.3.0';
                }
                if (!options.transparent)
                    options.transparent = true;
                if (!options.format)
                    options.format = 'image/png';
                layer = L.tileLayer.wms(url, options);
                break;
            }
        }
        if (layer) {
            layer._secInfo = secInfo;
        }
        return (layer);
    };
    MapUtilityService.prototype.findLayerIndex = function (id) {
        var idx = -1;
        idx = this.leafletLayers.findIndex(function (elem, index, array) { return (elem._secInfo.Id === id); });
        return (idx);
    };
    MapUtilityService.prototype.addLayerToMap = function (leafletLayer) {
        if (leafletLayer) {
            if (leafletLayer._secInfo.CustMinZoom) {
                if (!this.map._secInfo.CustZoomLayers[leafletLayer._secInfo.Id]) {
                    this.map._secInfo.CustZoomLayers[leafletLayer._secInfo.Id] = leafletLayer;
                    var curZoom = this.map.getZoom();
                    if (!(curZoom >= leafletLayer._secInfo.CustMinZoom && curZoom <= leafletLayer._secInfo.CustMaxZoom)) {
                        leafletLayer.setOpacity(0);
                    }
                }
            }
            this.map.addLayer(leafletLayer);
            this.leafletLayers.push(leafletLayer);
        }
    };
    MapUtilityService.prototype.removeLayerFromMap = function (id) {
        var idx = this.findLayerIndex(id);
        if (idx !== -1) {
            var leafletLayer = this.leafletLayers[idx];
            if (leafletLayer) {
                this.map.removeLayer(leafletLayer);
                this.leafletLayers.splice(idx, 1);
                if (this.map._secInfo.CustZoomLayers[id]) {
                    delete this.map._secInfo.CustZoomLayers[id];
                }
            }
        }
    };
    MapUtilityService.prototype.convertPositionToLatLng = function (position) {
        var latLng = L.latLng([position.Coordinates[1], position.Coordinates[0]]);
        return (latLng);
    };
    MapUtilityService.prototype.convertLatLngToPosition = function (latLng) {
        var pos = { Coordinates: [latLng.lng, latLng.lat], Type: 'Point' };
        return (pos);
    };
    MapUtilityService.prototype.convertAnchorsPositionToLatLng = function (anchors) {
        var anchorsLL = [];
        anchorsLL.push(this.convertPositionToLatLng(anchors[0]));
        anchorsLL.push(this.convertPositionToLatLng(anchors[1]));
        anchorsLL.push(this.convertPositionToLatLng(anchors[2]));
        anchorsLL.push(this.convertPositionToLatLng(anchors[3]));
        return (anchorsLL);
    };
    MapUtilityService.prototype.convertAnchorsLatLngToPosition = function (anchors) {
        var anchorsPos = [];
        anchorsPos.push(this.convertLatLngToPosition(anchors[0]));
        anchorsPos.push(this.convertLatLngToPosition(anchors[1]));
        anchorsPos.push(this.convertLatLngToPosition(anchors[2]));
        anchorsPos.push(this.convertLatLngToPosition(anchors[3]));
        return (anchorsPos);
    };
    MapUtilityService.prototype.redrawLayers = function () {
        for (var ii = this.leafletLayers.length - 1; ii > 0; ii--) {
            this.removeLayerFromMap(this.leafletLayers[ii]._secInfo.Id);
        }
        if (this.userTenant.MapSettings && this.userTenant.MapSettings.Layers) {
            for (var _i = 0, _a = this.userTenant.MapSettings.Layers; _i < _a.length; _i++) {
                var mapLayer = _a[_i];
                this.leafletLayers.push(this.createLayer(mapLayer));
                this.addLayerToMap(this.leafletLayers[this.leafletLayers.length - 1]);
            }
        }
        this.createLayersFromLocations(this.userTenant.Locations, true);
        if (this.childTenants) {
            for (var _b = 0, _c = this.childTenants; _b < _c.length; _b++) {
                var tenant = _c[_b];
                this.createLayersFromLocations(tenant.Locations, true);
            }
        }
    };
    MapUtilityService.prototype.getLeafletLayer = function (id) {
        var idx = this.findLayerIndex(id);
        return (idx !== -1 ? this.leafletLayers[idx] : null);
    };
    MapUtilityService.prototype._onMapZoomEndForCustZooms = function (event) {
        this._processMapZoomEnd(event.target);
    };
    MapUtilityService.prototype._processMapZoomEnd = function (map) {
        var secInfo = map._secInfo;
        if (secInfo) {
            var custZoomLayers = secInfo.CustZoomLayers;
            //let legend = secInfo.LegendControl;
            //if (legend === null)
            //return;
            var curZoom = map.getZoom();
            if (custZoomLayers) {
                for (var id in custZoomLayers) {
                    var layer = custZoomLayers[id];
                    if (!layer._imgLoaded || (layer._imgLoaded && layer._imgLoaded === true)) {
                        //if (legend.getLayerDisplayState(layerInfo.Layer._securityInfo.MapSrcDef.ID) === 'on') {
                        if (curZoom >= layer._secInfo.CustMinZoom && curZoom <= layer._secInfo.CustMaxZoom) {
                            layer.setOpacity(layer._secInfo.MapLayer.Opacity);
                        }
                        else {
                            layer.setOpacity(0);
                        }
                        //}
                    }
                }
            }
        }
    };
    MapUtilityService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            NgZone,
            UserService,
            LocationFilterService])
    ], MapUtilityService);
    return MapUtilityService;
}());
export { MapUtilityService };
//# sourceMappingURL=map-utility.service.js.map