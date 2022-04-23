var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, Input, ViewChild, trigger, state, style, transition, animate } from '@angular/core';
import { Tenant } from '../../shared/tenant.class';
import { Modal } from '../../shared/modal.component';
import { UserService } from '../../shared/user.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapLayer, LayerFormat, LayerType } from '../../shared/map-layer.class';
import { PlatformImageInfo, LocationMapSettings, MapCreateOptions, MapControlPositions } from '../../shared/map-settings.class';
import { slideDown } from '../../shared/animations';
import { MapService } from '../../map/map.service';
import { Image } from '../../shared/shared-interfaces';
import { LayerDefinition } from './layer-definition.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { AdminService } from '../admin.service';
import { DragulaService } from 'ng2-dragula';
import { MapUtilityService } from '../../map/map-utility.service';
import { LinkMapToRobot } from '../link-map-to-robot.component';
var MapSettings = /** @class */ (function () {
    function MapSettings(changeRef, ngZone, mapService, adminService, mapUtilityService, locFilterService, userService, dragulaService) {
        var _this = this;
        this.changeRef = changeRef;
        this.ngZone = ngZone;
        this.mapService = mapService;
        this.adminService = adminService;
        this.mapUtilityService = mapUtilityService;
        this.locFilterService = locFilterService;
        this.userService = userService;
        this.dragulaService = dragulaService;
        this.mapSettings = null;
        this.ngUnsubscribe = new Subject();
        this.visible = false;
        this.zoomCenterSet = false;
        this.step1Complete = false;
        this.step2Complete = false;
        this.isLayerDefShown = false;
        this.disableSave = true;
        this.dragOverInclude = false;
        this.dragOverRemove = false;
        this.LayerFormat = LayerFormat;
        dragulaService.setOptions('layersList', {
            moves: function (el, container, handle) {
                return handle.classList.contains('ms-dragIconImg');
            },
            revertOnSpill: true
        });
        this.dragulaService.drop
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (value) { return _this.layerDropped(value); }
        });
        this.dragulaService.over
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (value) { return _this.layerDraggedOver(value); }
        });
        this.dragulaService.out
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (value) { return _this.layerDraggedOut(value); }
        });
        this.warningIcon = '../../Content/Images/warning.png';
    }
    MapSettings.prototype.ngOnInit = function () {
        this.step1Expanded = 'out';
        this.step2Expanded = 'in';
        this.formattedMapCenter = '';
        this.formattedZoom = '';
        this.saveBtnText = 'Save Settings';
        for (var ii = 0; ii < this.userService.currentUser.tenant.Locations.length; ii++) {
            var location_1 = this.userService.currentUser.tenant.Locations[ii];
            if (!location_1.City) {
                this.userService.currentUser.tenant.Locations.splice(ii, 1);
            }
        }
        this.cloneUserTenant();
        if (!this.childTenantsInEdit) {
            if (this.userTenantInEdit.Locations && this.userTenantInEdit.Locations.length === 1) {
                this.disableSave = false;
                this.tenantInEdit = this.userTenantInEdit;
                this.locationInEdit = this.userTenantInEdit.Locations[0];
                if (this.locationInEdit.MapSettings) {
                    this.formattedZoom = this.locationInEdit.MapSettings.ZoomLevel.toString();
                    if (this.locationInEdit.MapSettings.MapCenter) {
                        this.formattedMapCenter = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
                        this.zoomCenterSet = true;
                        this.step1Complete = true;
                        this.step1Expanded = 'in';
                        this.step2Expanded = 'out';
                    }
                    if (this.locationInEdit.MapSettings.Layers && this.locationInEdit.MapSettings.Layers.length > 0) {
                        this.step2Complete = true;
                    }
                }
            }
        }
    };
    MapSettings.prototype.ngAfterViewInit = function () {
        var _this = this;
        if (this.locationInEdit) {
            this.locFilterService.setTenantLocation('mapSettings', this.tenantInEdit.Id, this.locationInEdit.Id);
        }
        this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
        var mapOptions = new MapCreateOptions();
        mapOptions.AttributionControl = false;
        mapOptions.AttributionControlPosition = MapControlPositions.BottomRight;
        mapOptions.ZoomControl = true;
        mapOptions.ZoomControlPosition = MapControlPositions.BottomRight;
        this.map = this.mapUtilityService.createMap('adminMap', mapOptions);
        this.map.on('zoomend', this.onZoomEnd, this);
        this.adminService.setMapInfo(this.map, this.mapUtilityService);
        // Subscribe to action definition selection events
        this.locFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) {
                _this.locationChanged(view);
            }
        });
    };
    MapSettings.prototype.ngOnDestroy = function () {
        this.locFilterService.unregisterComponent('mapSettings');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    MapSettings.prototype.cloneUserTenant = function () {
        this.userTenantInEdit = new Tenant(this.userService.currentUser.tenant);
        if (this.userService.currentUser.childTenants) {
            this.childTenantsInEdit = [];
            for (var _i = 0, _a = this.userService.currentUser.childTenants; _i < _a.length; _i++) {
                var tenant = _a[_i];
                this.childTenantsInEdit.push(new Tenant(tenant));
            }
        }
    };
    MapSettings.prototype.locationChanged = function (view) {
        if (view === 'mapSettings') {
            var tenant = this.locFilterService.getSelectedTenantLocations(view);
            if (tenant && tenant.length > 0) {
                this.step1Complete = false;
                this.step1Expanded = 'out';
                this.step2Expanded = 'in';
                this.zoomCenterSet = false;
                this.formattedMapCenter = '';
                this.formattedZoom = '';
                this.tenantInEdit = this.findTenant(tenant[0]);
                this.locationInEdit = this.findLocation(this.tenantInEdit, tenant[0].Locations[0].Id);
                if (!this.locationInEdit.MapSettings) {
                    this.locationInEdit.MapSettings = new LocationMapSettings(null);
                }
                if (this.map && this.locationInEdit.MapSettings.MapCenter && this.locationInEdit.MapSettings.ZoomLevel) {
                    var center = this.mapUtilityService.convertPositionToLatLng(this.locationInEdit.MapSettings.MapCenter);
                    this.map.setView(center, this.locationInEdit.MapSettings.ZoomLevel);
                    this.formattedMapCenter = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
                    this.formattedZoom = this.locationInEdit.MapSettings.ZoomLevel.toString();
                    this.step1Complete = true;
                    this.step1Expanded = 'in';
                    this.step2Expanded = 'out';
                    this.zoomCenterSet = true;
                }
                this.layerDef.setTenantLocation(this.tenantInEdit, this.locationInEdit);
                if (this.step1Complete) {
                    this.disableSave = false;
                }
            }
        }
    };
    MapSettings.prototype.findTenant = function (tenant) {
        if (tenant.Id === this.userTenantInEdit.Id) {
            return (this.userTenantInEdit);
        }
        else {
            if (this.childTenantsInEdit) {
                for (var _i = 0, _a = this.childTenantsInEdit; _i < _a.length; _i++) {
                    var childTenant = _a[_i];
                    if (tenant.Id === childTenant.Id) {
                        return (childTenant);
                    }
                }
            }
        }
    };
    MapSettings.prototype.findLocation = function (tenant, locID) {
        var location;
        if (tenant.Locations) {
            for (var _i = 0, _a = tenant.Locations; _i < _a.length; _i++) {
                var loc = _a[_i];
                if (loc.Id === locID) {
                    location = loc;
                    break;
                }
            }
        }
        return (location);
    };
    MapSettings.prototype.layerDropped = function (value) {
        if (value[2] && (value[2].id === 'availLayersListDropZoneEmpty' || value[2].id === 'availLayersListDropZone')) {
            if (value[2] && value[3] && value[2] === value[3]) {
                // Just sorting layers in removed list.
                var idx = parseInt(value[1].dataset.layeridx);
                if (idx || idx === 0) {
                    var layer = this.locationInEdit.MapSettings.AvailableLayers[idx];
                    var beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
                    if (beforeIdx === -1) {
                        // Moving layer to the end
                        this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
                        this.locationInEdit.MapSettings.AvailableLayers.push(layer);
                    }
                    else {
                        if (idx > beforeIdx) {
                            this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
                            this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx, 0, layer);
                        }
                        else {
                            this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
                            this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx - 1, 0, layer);
                        }
                    }
                    this.mapUtilityService.redrawLayers();
                    this.changeRef.markForCheck();
                }
            }
            else {
                var idx = parseInt(value[1].dataset.layeridx);
                var beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
                var layer = this.locationInEdit.MapSettings.Layers[idx];
                if (beforeIdx === -1) {
                    // Moving layer to the end
                    this.locationInEdit.MapSettings.AvailableLayers.push(layer);
                }
                else {
                    this.locationInEdit.MapSettings.AvailableLayers.splice(beforeIdx, 0, layer);
                }
                this.locationInEdit.MapSettings.Layers.splice(idx, 1);
                this.mapUtilityService.removeLayerFromMap(layer.Id);
                value[2].removeChild(value[1]);
                this.changeRef.markForCheck();
            }
        }
        else if (value[2] && (value[2].id === 'layersListDropZoneEmpty' || value[2].id === 'layersListDropZone')) {
            if (value[2] && value[3] && value[2] === value[3]) {
                var idx = parseInt(value[1].dataset.layeridx);
                if (idx || idx === 0) {
                    var layer = this.locationInEdit.MapSettings.Layers[idx];
                    var beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
                    if (beforeIdx === -1) {
                        // Moving layer to the end
                        this.locationInEdit.MapSettings.Layers.splice(idx, 1);
                        this.locationInEdit.MapSettings.Layers.push(layer);
                    }
                    else {
                        if (idx > beforeIdx) {
                            this.locationInEdit.MapSettings.Layers.splice(idx, 1);
                            this.locationInEdit.MapSettings.Layers.splice(beforeIdx, 0, layer);
                        }
                        else {
                            this.locationInEdit.MapSettings.Layers.splice(idx, 1);
                            this.locationInEdit.MapSettings.Layers.splice(beforeIdx - 1, 0, layer);
                        }
                    }
                    this.mapUtilityService.redrawLayers();
                    this.changeRef.markForCheck();
                }
            }
            else {
                var idx = parseInt(value[1].dataset.layeridx);
                var layer = this.locationInEdit.MapSettings.AvailableLayers[idx];
                var beforeIdx = value[4] && value[4].dataset.layeridx ? parseInt(value[4].dataset.layeridx) : -1;
                if (beforeIdx === -1) {
                    // Moving layer to the end
                    this.locationInEdit.MapSettings.Layers.push(layer);
                }
                else {
                    this.locationInEdit.MapSettings.Layers.splice(beforeIdx, 0, layer);
                }
                this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
                this.mapUtilityService.redrawLayers();
                value[2].removeChild(value[1]);
                this.changeRef.markForCheck();
            }
        }
    };
    MapSettings.prototype.layerDraggedOver = function (event) {
        if (event[2].id === 'layersListDropZone' || event[2].id === 'layersListDropZoneEmpty') {
            this.dragOverInclude = true;
        }
        else if (event[2].id === 'availLayersListDropZone' || event[2].id === 'availLayersListDropZoneEmpty') {
            this.dragOverRemove = true;
        }
        this.changeRef.detectChanges();
    };
    MapSettings.prototype.layerDraggedOut = function (event) {
        if (event[2].id === 'layersListDropZone' || event[2].id === 'layersListDropZoneEmpty') {
            this.dragOverInclude = false;
        }
        else if (event[2].id === 'availLayersListDropZone' || event[2].id === 'availLayersListDropZoneEmpty') {
            this.dragOverRemove = false;
        }
        this.changeRef.detectChanges();
    };
    MapSettings.prototype.addNewLayer = function () {
        this.isLayerDefShown = true;
        this.changeRef.detectChanges();
        var layer = new MapLayer(null);
        layer.LayerFormat = LayerFormat.Tile;
        layer.LayerType = LayerType.Custom;
        this.layerInEditIdx = -1;
        this.saveLayer = null;
        this.disableSave = true;
        this.layerInEdit = layer;
        this.layerDef.setMapUtilService(this.mapUtilityService);
        this.layerDef.setLayer(layer, true, this.map);
        this.locationInEdit.MapSettings.Layers.push(layer);
        this.saveBtnText = 'Create Layer';
    };
    MapSettings.prototype.onZoomEnd = function (map) {
        this.layerDef.updateRotateMarker();
    };
    MapSettings.prototype.toggleStep1Group = function () {
        this.step1Expanded = this.step1Expanded === 'in' ? 'out' : 'in';
    };
    MapSettings.prototype.toggleStep2Group = function () {
        this.step2Expanded = this.step2Expanded === 'in' ? 'out' : 'in';
    };
    MapSettings.prototype.setZoomCenter = function () {
        if (this.map) {
            var center = this.map.getCenter();
            var zoom = this.map.getZoom();
            this.formattedMapCenter = this.adminService.formatLatLng(center);
            this.locationInEdit.MapSettings.MapCenter = this.mapUtilityService.convertLatLngToPosition(center);
            this.locationInEdit.MapSettings.ZoomLevel = zoom;
            this.formattedZoom = zoom.toString();
            this.zoomCenterSet = true;
            this.disableSave = false;
            this.changeRef.detectChanges();
        }
    };
    MapSettings.prototype.getFormattedMapCenter = function () {
        var centStr = "";
        if (this.locationInEdit.MapSettings && this.locationInEdit.MapSettings.MapCenter && this.locationInEdit.MapSettings.MapCenter.Coordinates) {
            centStr = this.adminService.formatPosition(this.locationInEdit.MapSettings.MapCenter);
        }
        else {
            if (this.map !== null) {
                var center = this.map.getCenter();
                if (center) {
                    centStr = this.adminService.formatLatLng(center);
                }
            }
        }
        return centStr;
    };
    MapSettings.prototype.getMapCenter = function () {
        var center;
        if (this.map !== null) {
            center = this.map.getCenter();
        }
        return (center);
    };
    MapSettings.prototype.completeStep1 = function () {
        this.step1Complete = true;
        this.toggleStep1Group();
        this.toggleStep2Group();
    };
    MapSettings.prototype.onLayerDefClosed = function () {
        var _this = this;
        this.isLayerDefShown = false;
        this.changeRef.detectChanges();
        setTimeout(function () { _this.map.invalidateSize(); }, 500);
    };
    MapSettings.prototype.areAllLayersShown = function () {
        this.allLayersShown = true;
        if (this.locationInEdit.MapSettings && this.locationInEdit.MapSettings.Layers && this.locationInEdit.MapSettings.Layers.length > 0) {
            for (var _i = 0, _a = this.locationInEdit.MapSettings.Layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                if (layer.IsShownOnStartup === false) {
                    this.allLayersShown = false;
                    break;
                }
            }
        }
        return (this.allLayersShown);
    };
    MapSettings.prototype.toggleCardSelected = function (layer) {
        for (var _i = 0, _a = this.locationInEdit.MapSettings.Layers; _i < _a.length; _i++) {
            var tempLayer = _a[_i];
            if (tempLayer !== layer) {
                tempLayer.IsSelected = false;
            }
        }
        layer.IsSelected = layer.IsSelected ? false : true;
    };
    MapSettings.prototype.onClickCard = function (layer) {
        var _this = this;
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                _this.toggleCardSelected(layer);
                _this.changeRef.detectChanges();
            }
            _this.prevent = false;
        }, this.delay);
    };
    MapSettings.prototype.onDblClickCard = function (idx, activeLayer) {
        this.prevent = true;
        clearTimeout(this.timer);
        this.editLayer(idx, activeLayer);
    };
    MapSettings.prototype.toggleShowAllOnStartup = function () {
        if (this.allLayersShown) {
            this.allLayersShown = false;
            for (var _i = 0, _a = this.locationInEdit.MapSettings.Layers; _i < _a.length; _i++) {
                var layer = _a[_i];
                layer.IsShownOnStartup = false;
            }
        }
        else {
            this.allLayersShown = true;
            for (var _b = 0, _c = this.locationInEdit.MapSettings.Layers; _b < _c.length; _b++) {
                var layer = _c[_b];
                layer.IsShownOnStartup = true;
            }
        }
        this.mapUtilityService.redrawLayers();
    };
    MapSettings.prototype.toggleShowOnStartup = function (layer) {
        layer.IsShownOnStartup = layer.IsShownOnStartup === true ? false : true;
        if (layer.IsShownOnStartup) {
            this.mapUtilityService.redrawLayers();
        }
        else {
            this.mapUtilityService.removeLayerFromMap(layer.Id);
        }
    };
    MapSettings.prototype.deleteLayer = function (event, idx, activeLayer) {
        if (event) {
            event.stopPropagation();
        }
        if (activeLayer) {
            this.mapUtilityService.removeLayerFromMap(this.locationInEdit.MapSettings.Layers[idx].Id);
            this.locationInEdit.MapSettings.Layers.splice(idx, 1);
        }
        else {
            this.locationInEdit.MapSettings.AvailableLayers.splice(idx, 1);
        }
    };
    MapSettings.prototype.editLayer = function (idx, activeLayer) {
        this.isLayerDefShown = true;
        this.saveBtnText = 'Update Layer';
        this.layerInEditIdx = idx;
        this.activeLayer = activeLayer;
        var layer;
        if (activeLayer) {
            layer = this.locationInEdit.MapSettings.Layers[idx];
            this.saveLayer = new MapLayer(layer);
        }
        else {
            layer = this.locationInEdit.MapSettings.AvailableLayers[idx];
            this.saveLayer = new MapLayer(layer);
        }
        this.layerInEdit = layer;
        this.layerDef.setMapUtilService(this.mapUtilityService);
        this.layerDef.setLayer(layer, false, this.map);
        this.disableSave = false;
        this.changeRef.detectChanges();
    };
    MapSettings.prototype.canEnableSave = function (enable) {
        this.disableSave = !enable;
        this.changeRef.detectChanges();
    };
    MapSettings.prototype.saveEdits = function () {
        if (this.isLayerDefShown) {
            if (this.validateLayerDef()) {
                this.saveBtnText = 'Save Settings';
                this.layerDef.clearAllLayerMapData();
                if (this.layerInEditIdx === -1) {
                    this.mapUtilityService.redrawLayers();
                }
                else {
                    if (this.activeLayer) {
                        this.mapUtilityService.redrawLayers();
                    }
                }
                if (this.layerInEdit.LayerFormat === LayerFormat.Image) {
                    var imageName_1 = this.layerInEdit.ImageName;
                    var imageInfo = this.locationInEdit.MapSettings.AvailableImages.find(function (elem) { return (elem.Image.Label === imageName_1); });
                    if (imageInfo) {
                        imageInfo.Anchors = this.layerInEdit.Anchors.slice();
                        imageInfo.Rotation = this.layerInEdit.Rotation;
                        if (this.layerInEdit.MapOrigin) {
                            imageInfo.MapOrigin = { Coordinates: [this.layerInEdit.MapOrigin.Coordinates[0], this.layerInEdit.MapOrigin.Coordinates[1]], Type: this.layerInEdit.MapOrigin.Type };
                        }
                        imageInfo.IsMaintainAspect = this.layerInEdit.IsMaintainAspect;
                        imageInfo.IsConstrainedTo90 = this.layerInEdit.IsConstrainedTo90;
                    }
                }
                else if (this.layerInEdit.LayerFormat === LayerFormat.PlatformImage) {
                    var imageName_2 = this.layerInEdit.ImageName;
                    var imageInfo = this.locationInEdit.MapSettings.AvailablePlatformImages.find(function (elem) { return (elem.Image.Label === imageName_2); });
                    if (imageInfo) {
                        imageInfo.Anchors = this.layerInEdit.Anchors.slice();
                        imageInfo.Rotation = this.layerInEdit.Rotation;
                        if (this.layerInEdit.MapOrigin) {
                            imageInfo.MapOrigin = { Coordinates: [this.layerInEdit.MapOrigin.Coordinates[0], this.layerInEdit.MapOrigin.Coordinates[1]], Type: this.layerInEdit.MapOrigin.Type };
                        }
                    }
                }
                this.saveLayer = null;
                this.layerInEdit = null;
                this.layerInEditIdx = -1;
                this.isLayerDefShown = false;
                this.changeRef.detectChanges();
            }
            else {
                this.saveErrorDialog.show();
            }
        }
        else {
            this.userService.currentUser.tenant = this.userTenantInEdit;
            var temp = JSON.stringify(this.userTenantInEdit);
            this.userService.currentUser.childTenants = this.childTenantsInEdit;
            this.adminService.saveTenant(this.userService.currentUser.tenant);
            if (this.childTenantsInEdit && this.childTenantsInEdit.length > 0) {
                for (var _i = 0, _a = this.childTenantsInEdit; _i < _a.length; _i++) {
                    var tenant = _a[_i];
                    this.adminService.saveTenant(tenant);
                }
            }
            this.cloneUserTenant();
            this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
        }
    };
    MapSettings.prototype.cancelEdits = function () {
        if (this.isLayerDefShown) {
            this.saveBtnText = 'Save Settings';
            this.layerDef.cancelEdits();
            if (this.layerInEditIdx !== -1) {
                if (this.activeLayer) {
                    this.locationInEdit.MapSettings.Layers[this.layerInEditIdx] = this.saveLayer;
                }
                else {
                    this.locationInEdit.MapSettings.Layers[this.layerInEditIdx] = this.saveLayer;
                }
            }
            else {
                this.locationInEdit.MapSettings.Layers.splice(this.locationInEdit.MapSettings.Layers.length - 1, 1);
            }
            this.saveLayer = null;
            this.layerInEdit = null;
            this.layerInEditIdx = -1;
            this.layerDef.clearAllLayerMapData();
            this.mapUtilityService.redrawLayers();
            this.isLayerDefShown = false;
            this.changeRef.markForCheck();
        }
        else {
            this.cloneUserTenant();
            this.mapUtilityService.setUserTenantInfo(this.userTenantInEdit, this.childTenantsInEdit);
            this.mapUtilityService.redrawLayers();
            this.locationChanged("mapSettings");
        }
    };
    MapSettings.prototype.validateLayerDef = function () {
        var isValid = true;
        if (!this.layerInEdit.Name || this.layerInEdit.Name === "") {
            this.errorMessage = 'The layer must have a name.';
            isValid = false;
        }
        else if (!this.layerInEdit.URL || this.layerInEdit.URL === "") {
            this.errorMessage = 'A URL must be defined for the layer.';
            isValid = false;
        }
        return (isValid);
    };
    MapSettings.prototype.hideErrorDialog = function () {
        this.saveErrorDialog.hide();
        this.errorMessage = "";
    };
    MapSettings.prototype.assignImageToRobot = function (idx, activeLayer) {
        var platformImageInfo = new PlatformImageInfo(null);
        var layerName;
        if (activeLayer) {
            platformImageInfo.Image = new Image(null);
            platformImageInfo.Image.Label = this.locationInEdit.MapSettings.Layers[idx].ImageName;
            platformImageInfo.MapOrigin = this.locationInEdit.MapSettings.Layers[idx].MapOrigin;
            platformImageInfo.Rotation = this.locationInEdit.MapSettings.Layers[idx].Rotation;
            layerName = this.locationInEdit.MapSettings.Layers[idx].Name;
        }
        else {
            platformImageInfo.Image = new Image(null);
            platformImageInfo.Image.Label = this.locationInEdit.MapSettings.AvailableLayers[idx].ImageName;
            platformImageInfo.MapOrigin = this.locationInEdit.MapSettings.AvailableLayers[idx].MapOrigin;
            platformImageInfo.Rotation = this.locationInEdit.MapSettings.AvailableLayers[idx].Rotation;
            layerName = this.locationInEdit.MapSettings.AvailableLayers[idx].Name;
        }
        this.linkRobot.setPlatformInfo(this.locationInEdit.Id, platformImageInfo, layerName);
        this.linkRobot.show();
    };
    __decorate([
        Input(),
        __metadata("design:type", LocationMapSettings)
    ], MapSettings.prototype, "mapSettings", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MapSettings.prototype, "step1Expanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MapSettings.prototype, "step2Expanded", void 0);
    __decorate([
        ViewChild('layerDefinition'),
        __metadata("design:type", LayerDefinition)
    ], MapSettings.prototype, "layerDef", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], MapSettings.prototype, "saveErrorDialog", void 0);
    __decorate([
        ViewChild(LinkMapToRobot),
        __metadata("design:type", LinkMapToRobot)
    ], MapSettings.prototype, "linkRobot", void 0);
    MapSettings = __decorate([
        Component({
            selector: 'map-settings',
            templateUrl: 'map-settings.component.html',
            styleUrls: ['map-settings.component.css'],
            providers: [MapService, DragulaService, MapUtilityService],
            animations: [
                slideDown,
                trigger('slideOut', [
                    state('in', style({
                        //display: 'none',
                        left: '1000px'
                    })),
                    state('out', style({
                        //display:'inline',
                        left: '0'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                    //state('in', style({
                    //	display: 'none',
                    //})),
                    //state('out', style({
                    //	display: 'inline',
                    //})),
                    //transition('in <=> out', animate('100ms ease-in-out'))
                ]),
                trigger('resizeMap', [
                    state('in', style({
                        width: 'calc(100% - 409px)'
                    })),
                    state('out', style({
                        display: '',
                        width: 'calc(100% - 817px)'
                    })),
                    transition('in <=> out', animate('250ms ease-in-out'))
                ])
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef,
            NgZone,
            MapService,
            AdminService,
            MapUtilityService,
            LocationFilterService,
            UserService,
            DragulaService])
    ], MapSettings);
    return MapSettings;
}());
export { MapSettings };
//# sourceMappingURL=map-settings.component.js.map