var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, Input, Output, ViewChild, EventEmitter, trigger, state, style, transition, animate } from '@angular/core';
import { HttpService } from '../../shared/http.service';
import { Tenant } from '../../shared/tenant.class';
import { ImageInfo, PlatformImageInfo, PlatformImageProperties } from '../../shared/map-settings.class';
import { Location } from '../../shared/location.class';
import { Modal } from '../../shared/modal.component';
import { Image } from '../../shared/shared-interfaces';
import { MapLayer, LayerFormat, LayerOption } from '../../shared/map-layer.class';
import { AdminService } from '../admin.service';
import { UploadDialog } from '../upload-dialog.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var LayerDefinition = /** @class */ (function () {
    function LayerDefinition(changeRef, ngZone, adminService, httpService) {
        this.changeRef = changeRef;
        this.ngZone = ngZone;
        this.adminService = adminService;
        this.httpService = httpService;
        this.onDialogClose = new EventEmitter();
        this.onEnableSave = new EventEmitter();
        this.tempLayer = new MapLayer(null);
        this.newLayer = true;
        this.newLeafletLayer = false;
        this.editLayerName = false;
        this.layerFormats = [];
        this.wmsLayers = [];
        this.images = [];
        this.selectedWMSLayers = [];
        this.opacityRange = [0, 100];
        this.opacityStr = '100%';
        this.isRotatingPolygon = false;
        this.isDraggingPolygon = false;
        this.isShown = false;
        this.canSave = false;
        this.showLower = false;
        this.warningIcon = '../../Content/Images/warning.png';
        this.ngUnsubscribe = new Subject();
        this.LayerFormat = LayerFormat;
        this.polygonOptions = { className: 'ms-polygonStyles', interactive: true, dashArray: '5, 5', fillColor: '#e3f0f6', fillOpacity: .3 };
        this.polygonGroup = L.featureGroup();
        this.markers = [];
        this.fitOptions = { padding: [2, 2] };
    }
    LayerDefinition.prototype.ngOnInit = function () {
        if (this.mapLayer) {
            this.newLayer = false;
        }
        else {
            this.newLayer = true;
            this.mapLayer = new MapLayer(null);
        }
        if (this.location) {
            this.availImages = this.location.MapSettings.AvailableImages;
            this.availPlatformImages = this.location.MapSettings.AvailablePlatformImages;
        }
        else if (this.tenant) {
            this.availImages = this.tenant.MapSettings.AvailableImages;
        }
    };
    LayerDefinition.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    LayerDefinition.prototype.checkCanSave = function () {
        var temp = this.showLower;
        this.showLower = this.showLowerSection();
        if (temp !== this.showLower) {
            this.changeRef.detectChanges();
        }
        var canSave = this.validateLayerDef();
        if (canSave !== this.canSave)
            this.onEnableSave.emit(canSave);
    };
    LayerDefinition.prototype.setMapUtilService = function (mapUtilServ) {
        this.mapUtilityService = mapUtilServ;
    };
    LayerDefinition.prototype.validateLayerDef = function () {
        var valid = false;
        if (this.mapLayer.Name && this.mapLayer.Name.length > 0 && this.mapLayer.URL && this.mapLayer.URL.length > 0) {
            switch (this.mapLayer.LayerFormat) {
                case LayerFormat.PlatformImage:
                case LayerFormat.Image: {
                    valid = this.mapLayer.Anchors && this.mapLayer.Anchors.length > 0 ? true : false;
                    break;
                }
                case LayerFormat.WMS: {
                    valid = this.mapLayer.WMSLayers && this.mapLayer.WMSLayers.length > 0 ? true : false;
                    break;
                }
                default:
                    valid = true;
            }
        }
        return (valid);
    };
    LayerDefinition.prototype.setTenantLocation = function (tenant, location) {
        this.tenant = tenant;
        this.location = location;
        if (this.location) {
            this.availImages = this.location.MapSettings.AvailableImages;
            this.availPlatformImages = this.location.MapSettings.AvailablePlatformImages;
        }
        else if (this.tenant) {
            this.availImages = this.tenant.MapSettings.AvailableImages;
        }
        this.layerFormats = [];
        this.layerFormats.push({ label: 'Tile', value: LayerFormat.Tile });
        this.layerFormats.push({ label: 'WMS', value: LayerFormat.WMS });
        this.layerFormats.push({ label: 'Image', value: LayerFormat.Image });
        if (this.location) {
            this.layerFormats.push({ label: 'Robot Map', value: LayerFormat.PlatformImage });
        }
        this.layerFormats.push({ label: 'GeoJSON', value: LayerFormat.GeoJson });
        this.changeRef.detectChanges();
    };
    LayerDefinition.prototype.getImageLabel = function () {
        var text;
        if (this.mapLayer.LayerFormat === LayerFormat.Image) {
            text = 'Image';
        }
        else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
            text = 'Robot Map';
        }
        return (text);
    };
    LayerDefinition.prototype.getFormatLabel = function () {
        var _this = this;
        var temp = this.layerFormats.find(function (elem) { return (elem.value === _this.mapLayer.LayerFormat); });
        if (temp) {
            return (temp.label);
        }
        else {
            return ('Unknown');
        }
    };
    LayerDefinition.prototype.getImagePlaceholderText = function () {
        var text;
        if (this.mapLayer.LayerFormat === LayerFormat.Image) {
            text = 'Choose image';
        }
        else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
            text = 'Choose robot map';
        }
        return (text);
    };
    LayerDefinition.prototype.layerNameInputChanged = function (event) {
        this.mapLayer.Name = event.target.value;
        this.checkCanSave();
    };
    LayerDefinition.prototype.layerFormatChanged = function (event) {
        this.mapLayer.LayerFormat = event.value;
        this.clearAllLayerMapData();
        this.images = [];
        this.selectedImage = null;
        this.mapLayer.URL = null;
        this.mapLayer.ImageProperties = null;
        this.mapLayer.Rotation = 0;
        this.layerRotation = 0;
        this.mapLayer.Anchors = [];
        this.markers = [];
        this.mapLayer.MapOrigin = null;
        this.mapLayer.Options = [];
        this.mapLayer.WMSLayers = [];
        this.selectedWMSLayers = [];
        this.loadImageListDropdown();
        this.checkCanSave();
        this.changeRef.detectChanges();
    };
    LayerDefinition.prototype.loadImageListDropdown = function () {
        var imageList;
        if (this.mapLayer.LayerFormat === LayerFormat.Image) {
            imageList = this.location.MapSettings.AvailableImages;
        }
        else if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
            imageList = this.location.MapSettings.AvailablePlatformImages;
        }
        if (imageList) {
            this.images = [];
            for (var _i = 0, imageList_1 = imageList; _i < imageList_1.length; _i++) {
                var item = imageList_1[_i];
                this.images.push({ label: item.Image.Label, value: item });
                if (item.Image.Label === this.mapLayer.ImageName) {
                    this.selectedImage = item;
                }
            }
        }
    };
    LayerDefinition.prototype.layerURLInputChanged = function (event) {
        switch (this.mapLayer.LayerFormat) {
            case LayerFormat.WMS: {
                if (this.mapLayer.URL && this.mapLayer.URL != "") {
                    this.getWMSCapabiliites();
                }
                break;
            }
        }
        this.checkCanSave();
    };
    LayerDefinition.prototype.layerURLDropdownChanged = function (event) {
        switch (this.mapLayer.LayerFormat) {
            case LayerFormat.PlatformImage: {
                this.clearAllLayerMapData(true);
                this.mapLayer.URL = event.value.Image.Uri;
                this.mapLayer.ImageName = event.value.Image.Label;
                this.mapLayer.ImageProperties = event.value.ImageProperties;
                this.mapLayer.ImageSize = event.value.ImageSize ? event.value.ImageSize.slice(0) : null;
                this.mapLayer.Anchors = [];
                this.mapLayer.Rotation = 0;
                this.layerRotation = 0;
                this.mapLayer.Opacity = 1;
                //this.mapLayer.Rotation = event.value.Rotation;
                //this.mapLayer.Anchors = event.value.Anchors;
                //this.layerRotation = event.value.Rotation;
                if (event.value.MapOrigin) {
                    this.mapLayer.MapOrigin = { Coordinates: [event.value.MapOrigin.Coordinates[0], event.value.MapOrigin.Coordinates[1]], Type: event.value.MapOrigin.Type };
                }
                if (this.mapLayer.Anchors && this.mapLayer.Anchors.length === 4) {
                    var mapLayer = this.mapUtilityService.createLayer(this.mapLayer);
                    this.mapUtilityService.addLayerToMap(mapLayer);
                }
            }
            case LayerFormat.Image: {
                this.clearAllLayerMapData(true);
                this.mapLayer.URL = event.value.Image.Uri;
                this.mapLayer.ImageName = event.value.Image.Label;
                this.mapLayer.ImageSize = event.value.ImageSize ? event.value.ImageSize.slice(0) : null;
                this.mapLayer.Anchors = [];
                this.mapLayer.Rotation = 0;
                this.layerRotation = 0;
                this.mapLayer.Opacity = 1;
                //this.mapLayer.Anchors = event.value.Anchors;
                //this.mapLayer.Rotation = event.value.Rotation;
                //this.layerRotation = event.value.Rotation;
                this.mapLayer.IsConstrainedTo90 = event.value.IsConstainedTo90 ? event.value.IsConstainedTo90 : false;
                this.mapLayer.IsMaintainAspect = event.value.IsMaintainAspect ? event.value.IsMaintainAspect : false;
                if (event.value.MapOrigin) {
                    this.mapLayer.MapOrigin = { Coordinates: [event.value.MapOrigin.Coordinates[0], event.value.MapOrigin.Coordinates[1]], Type: event.value.MapOrigin.Type };
                }
                if (this.mapLayer.Anchors && this.mapLayer.Anchors.length === 4) {
                    var mapLayer = this.mapUtilityService.createLayer(this.mapLayer);
                    this.mapUtilityService.addLayerToMap(mapLayer);
                }
                break;
            }
        }
        this.showLower = this.showLowerSection();
        this.checkCanSave();
    };
    LayerDefinition.prototype.wmsLayerChanged = function (event) {
        this.mapLayer.WMSLayers = [];
        var option;
        if (this.mapLayer.Options) {
            option = this.mapLayer.Options.find(function (elem) { return (elem.Name === "layers"); });
            if (!option) {
                option = new LayerOption(null);
                option.Name = 'layers';
                option.Value = "";
                option.Type = 'string';
                this.mapLayer.Options.push(option);
            }
        }
        for (var _i = 0, _a = event.value; _i < _a.length; _i++) {
            var wmsLayerName = _a[_i];
            this.mapLayer.WMSLayers.push(wmsLayerName);
        }
        option.Value = this.mapLayer.getCommaSeparatedWMSLayers();
        if (this.mapUtilityService.isMapLayerValid(this.mapLayer)) {
            if (this.leafletLayer) {
                this.mapUtilityService.removeLayerFromMap(this.mapLayer.Id);
            }
            this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
            this.mapUtilityService.addLayerToMap(this.leafletLayer);
        }
        else if (this.leafletLayer) {
            this.mapUtilityService.removeLayerFromMap(this.mapLayer.Id);
        }
        this.checkCanSave();
    };
    LayerDefinition.prototype.toggleConstrainedTo90 = function () {
        this.mapLayer.IsConstrainedTo90 = this.mapLayer.IsConstrainedTo90 ? false : true;
        if (this.mapLayer.IsConstrainedTo90) {
            var $elem = $("#layerDef-rotationId");
            if ($elem.length > 0) {
                $elem.val(this.layerRotation);
            }
            this.clearAllLayerMapData(true);
            this.placeImageOnMap();
        }
        else {
            this.mapLayer.Rotation = 0;
            this.layerRotation = 0;
            this.mapLayer.IsMaintainAspect = false;
            if (this.markers) {
                for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
                    var marker = _a[_i];
                    marker.dragging.enable();
                    this.setMarkerEvents(marker);
                }
            }
            this.removeRotateMarker();
        }
        this.changeRef.detectChanges();
    };
    LayerDefinition.prototype.toggleMaintainAspect = function () {
        this.mapLayer.IsMaintainAspect = this.mapLayer.IsMaintainAspect ? false : true;
        if (this.mapLayer.IsMaintainAspect) {
            this.mapLayer.Rotation = 0;
            this.layerRotation = 0;
            var $elem = $("#layerDef-rotationId");
            if ($elem.length > 0) {
                $elem.val(this.layerRotation);
            }
            this.clearAllLayerMapData(true);
            this.placeImageOnMap();
        }
        else {
            if (this.markers) {
                for (var _i = 0, _a = this.markers; _i < _a.length; _i++) {
                    var marker = _a[_i];
                    marker.dragging.enable();
                    this.setMarkerEvents(marker);
                }
            }
        }
        this.changeRef.detectChanges();
    };
    LayerDefinition.prototype.toggleMinMaxZoomDefined = function () {
        this.mapLayer.IsMinMaxZoomDefined = this.mapLayer.IsMinMaxZoomDefined ? false : true;
        this.changeRef.detectChanges();
        if (this.mapLayer.IsMinMaxZoomDefined) {
            var $elem = $("#layerDef-minZoomId");
            if ($elem.length > 0) {
                $elem.val(this.mapLayer.MinZoomLevel);
            }
            $elem = $("#layerDef-maxZoomId");
            if ($elem.length > 0) {
                $elem.val(this.mapLayer.MaxZoomLevel);
            }
        }
    };
    LayerDefinition.prototype.showLowerSection = function () {
        var show = false;
        if (this.mapLayer.LayerFormat === LayerFormat.Image || this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
            if (this.mapLayer && this.mapLayer.Anchors && this.mapLayer.Anchors.length > 0) {
                show = true;
            }
        }
        else if (this.mapLayer.LayerFormat === LayerFormat.Tile) {
            if (this.mapLayer.URL && this.mapLayer.URL.length > 0) {
                show = true;
            }
        }
        else if (this.mapLayer.LayerFormat === LayerFormat.WMS) {
            if (this.mapLayer.URL && this.mapLayer.URL.length > 0 &&
                this.mapLayer.WMSLayers && this.mapLayer.WMSLayers.length > 0) {
                show = true;
            }
        }
        else {
            show = true;
        }
        return (show);
    };
    LayerDefinition.prototype.onMaxZoomChanged = function (event) {
        if (this.mapLayer.MaxZoomLevel < this.mapLayer.MinZoomLevel) {
            this.mapLayer.MinZoomLevel = this.mapLayer.MaxZoomLevel;
        }
        this.mapUtilityService.redrawLayers();
    };
    LayerDefinition.prototype.onMinZoomChanged = function (event) {
        if (this.mapLayer.MinZoomLevel > this.mapLayer.MaxZoomLevel) {
            this.mapLayer.MaxZoomLevel = this.mapLayer.MinZoomLevel;
        }
        this.mapUtilityService.redrawLayers();
    };
    LayerDefinition.prototype.setMinZoomLevel = function () {
        var temp = this.getMapZoom();
        if (temp !== this.mapLayer.MinZoomLevel) {
            this.mapLayer.MinZoomLevel = this.getMapZoom();
            $("#layerDef-minZoomId").val(this.mapLayer.MinZoomLevel);
            if (this.mapLayer.MinZoomLevel > this.mapLayer.MaxZoomLevel) {
                this.mapLayer.MaxZoomLevel = this.mapLayer.MinZoomLevel;
                $("#layerDef-maxZoomId").val(this.mapLayer.MaxZoomLevel);
            }
            this.mapUtilityService.redrawLayers();
            this.changeRef.markForCheck();
        }
    };
    LayerDefinition.prototype.setMaxZoomLevel = function () {
        var temp = this.getMapZoom();
        if (temp !== this.mapLayer.MaxZoomLevel) {
            this.mapLayer.MaxZoomLevel = this.getMapZoom();
            $("#layerDef-maxZoomId").val(this.mapLayer.MaxZoomLevel);
            if (this.mapLayer.MaxZoomLevel < this.mapLayer.MinZoomLevel) {
                this.mapLayer.MinZoomLevel = this.mapLayer.MaxZoomLevel;
                $("#layerDef-minZoomId").val(this.mapLayer.MinZoomLevel);
            }
            this.changeRef.markForCheck();
            this.mapUtilityService.redrawLayers();
        }
    };
    LayerDefinition.prototype.getMapZoom = function () {
        var zoom;
        if (this.map !== null) {
            zoom = this.map.getZoom();
        }
        return (zoom);
    };
    LayerDefinition.prototype.onOpacityChange = function (event) {
        this.opacityRange[1] = event.values[1];
        this.mapLayer.Opacity = event.values[1] / 100;
        this.opacityStr = this.opacityRange[1].toString() + "%";
        if (this.leafletLayer) {
            this.leafletLayer.setOpacity(this.mapLayer.Opacity);
        }
    };
    LayerDefinition.prototype.setLayer = function (mapLayer, newLayer, map) {
        this.isShown = true;
        this.newLeafletLayer = false;
        this.leafletLayer = null;
        this.map = map;
        this.mapLayer = mapLayer;
        this.layerRotation = this.mapLayer.Rotation;
        this.markers = [];
        this.newLayer = newLayer;
        this.saveLayer = new MapLayer(mapLayer);
        this.leafletLayer = this.mapUtilityService.getLeafletLayer(mapLayer.Id);
        if (!this.leafletLayer) {
            this.newLeafletLayer = true;
            if (this.validateLayerDef()) {
                this.leafletLayer = this.mapUtilityService.createLayer(mapLayer);
                this.mapUtilityService.addLayerToMap(this.leafletLayer);
            }
        }
        this.map.addLayer(this.polygonGroup);
        this.opacityRange[1] = Math.floor(mapLayer.Opacity * 100);
        this.opacityRange = this.opacityRange.splice(0);
        this.opacityStr = this.opacityRange[1].toString() + "%";
        this.loadImageListDropdown();
        switch (mapLayer.LayerFormat) {
            case LayerFormat.WMS: {
                this.selectedWMSLayers = mapLayer.WMSLayers.slice();
                this.wmsLayers = [];
                if (this.mapLayer.URL && this.mapLayer.URL.length > 0) {
                    this.getWMSCapabiliites();
                }
                break;
            }
            case LayerFormat.Image: {
                if (this.mapLayer) {
                    if (!this.mapLayer.ImageSize || this.mapLayer.ImageSize.length != 2) {
                        for (var _i = 0, _a = this.availImages; _i < _a.length; _i++) {
                            var imageInfo = _a[_i];
                            if (imageInfo.Image.Label === this.mapLayer.ImageName) {
                                this.mapLayer.ImageSize = imageInfo.ImageSize.slice(0);
                            }
                        }
                    }
                    if (this.mapLayer.Anchors.length > 0) {
                        this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
                        this.placeImagePolygon(this.anchorsLL);
                        this.imageCenter = this.mapUtilityService.convertPositionToLatLng(this.mapLayer.MapOrigin);
                        this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1), true);
                    }
                }
                break;
            }
            case LayerFormat.PlatformImage: {
                if (this.mapLayer && this.mapLayer.Anchors.length > 0) {
                    this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
                    this.placeRotatedImagePolygon(this.anchorsLL);
                    this.imageCenter = this.mapUtilityService.convertPositionToLatLng(this.mapLayer.MapOrigin);
                    this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1), true);
                }
                break;
            }
        }
        this.showLower = this.showLowerSection();
        this.changeRef.markForCheck();
    };
    LayerDefinition.prototype.getLeafletLayer = function () {
        return (this.leafletLayer);
    };
    LayerDefinition.prototype.cancelEdits = function () {
        this.opacityRange = [0, Math.floor(this.saveLayer.Opacity * 100)];
        this.mapLayer = this.tempLayer;
        this.changeRef.markForCheck();
    };
    LayerDefinition.prototype.closeDialog = function () {
        this.onDialogClose.emit();
        this.clearAllLayerMapData();
    };
    LayerDefinition.prototype.clearEditLayers = function () {
        if (this.polygonGroup) {
            this.polygonGroup.clearLayers();
        }
        if (this.markers) {
            this.markers = [];
        }
        if (this.polygon) {
            this.polygon = null;
        }
        if (this.rotateMarker) {
            this.rotateMarker = null;
        }
        if (this.rotateLine) {
            this.rotateLine = null;
        }
    };
    LayerDefinition.prototype.clearAllLayerMapData = function (removeLayer) {
        if (removeLayer === void 0) { removeLayer = false; }
        this.clearEditLayers();
        if (this.newLeafletLayer && this.leafletLayer) {
            this.mapUtilityService.removeLayerFromMap(this.leafletLayer._secInfo.Id);
            this.leafletLayer = null;
            this.newLeafletLayer = false;
        }
        else if (removeLayer) {
            if (this.leafletLayer) {
                this.mapUtilityService.removeLayerFromMap(this.leafletLayer._secInfo.Id);
                this.leafletLayer = null;
            }
        }
    };
    LayerDefinition.prototype.placeImageOnMap = function () {
        switch (this.mapLayer.LayerFormat) {
            case LayerFormat.Image: {
                this.imageCenter = this.map.getCenter();
                this.mapLayer.IsConstrainedTo90 = true;
                this.mapLayer.IsMaintainAspect = true;
                this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
                this.mapLayer.Anchors = this.adminService.calculateImageAnchorsFromMap(this.mapLayer);
                if (this.mapLayer.Anchors) {
                    this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
                    this.mapUtilityService.addLayerToMap(this.leafletLayer);
                    this.newLeafletLayer = true;
                    this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
                    this.placeImagePolygon(this.anchorsLL);
                }
                break;
            }
            case LayerFormat.PlatformImage: {
                if (!this.mapLayer.MapOrigin) {
                    this.imageCenter = this.map.getCenter();
                    this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
                }
                this.mapLayer.Anchors = this.adminService.calculatePlatformImageAnchors(this.mapLayer);
                if (this.mapLayer.Anchors) {
                    this.leafletLayer = this.mapUtilityService.createLayer(this.mapLayer);
                    this.mapUtilityService.addLayerToMap(this.leafletLayer);
                    this.newLeafletLayer = true;
                    this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
                    this.placeRotatedImagePolygon(this.anchorsLL);
                    this.map.fitBounds(this.polygonGroup.getBounds().pad(0.3));
                }
                break;
            }
        }
        this.changeRef.markForCheck();
        this.checkCanSave();
    };
    LayerDefinition.prototype.placeImagePolygon = function (points) {
        var _this = this;
        this.polygon = L.polygon(points, this.polygonOptions);
        this.polygon.on('mousedown', this.onPolygonMouseDown, this);
        this.polygon.on('touchstart', this.onPolygonMouseDown, this);
        this.polygon.on('mouseover', this.onPolygonMouseOver, this);
        this.polygon.on('mouseout', this.onPolygonMouseOut, this);
        this.polygonGroup.addLayer(this.polygon);
        for (var ii = 0; ii < points.length; ii++) {
            this.markers.push(this.createMarker(L.latLng([points[ii].lat, points[ii].lng]), ii));
            this.polygonGroup.addLayer(this.markers[ii]);
        }
        if (this.mapLayer.IsConstrainedTo90) {
            this.placeRotateMarker();
        }
        this.polygonElem = $('.ms-polygonStyles');
        if (this.polygonElem.length > 0) {
            this.polygonElem.on('dragstart', false);
            $(document).mouseup(function (event) { _this.onMouseUp(event); });
        }
    };
    LayerDefinition.prototype.createMarker = function (pt, index) {
        var style = "position:relative;width:15px;height:15px;border:1px solid black;background-color:white";
        var html = '<div style="' + style + '"></div>';
        var iconOptions = { className: 'editMarker', html: html, iconSize: [15, 15] };
        var icon = L.divIcon(iconOptions);
        var draggable = this.mapLayer.IsMaintainAspect ? false : true;
        var markerOptions = { icon: icon, interactive: true, draggable: draggable };
        var marker = L.marker(pt, markerOptions);
        marker._secInfo = { index: index };
        this.setMarkerEvents(marker);
        return (marker);
    };
    LayerDefinition.prototype.setMarkerEvents = function (marker) {
        marker.off('mousedown', this.onMarkerMouseDown, this);
        marker.off('drag', this.onMarkerDrag, this);
        marker.off('dragstart', this.onMarkerDragStart, this);
        if (this.mapLayer.IsMaintainAspect) {
            marker.on('mousedown', this.onMarkerMouseDown, this);
        }
        else {
            marker.on('drag', this.onMarkerDrag, this);
            marker.on('dragstart', this.onMarkerDragStart, this);
        }
    };
    LayerDefinition.prototype.onMarkerDragStart = function (event) {
        this.saveAnchorsLL = [];
        for (var _i = 0, _a = this.anchorsLL; _i < _a.length; _i++) {
            var anchor = _a[_i];
            this.saveAnchorsLL.push(L.latLng(anchor.lat, anchor.lng));
        }
    };
    LayerDefinition.prototype.onMarkerDrag = function (event) {
        var marker = event.target;
        this.currentMarkerIndex = marker._secInfo.index;
        var newPt = L.latLng(marker.getLatLng());
        if (this.mapLayer.IsConstrainedTo90 === false) {
            this.anchorsLL[this.currentMarkerIndex] = L.latLng([newPt.lat, newPt.lng]);
            this.leafletLayer.setAnchors(this.anchorsLL);
            this.polygon.setLatLngs(this.anchorsLL);
            this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
        }
        else {
            //if (this.mapLayer.Rotation === 0) {
            //	let swLL: L.LatLng;
            //	let neLL: L.LatLng;
            //	switch (this.currentMarkerIndex) {
            //		// Northwest
            //		case 0: {
            //			swLL = L.latLng(this.mapLayer.Anchors[3].Coordinates[1], newPt.lng);
            //			neLL = L.latLng(newPt.lat, this.mapLayer.Anchors[1].Coordinates[0]);
            //			break;
            //		}
            //		// Northeast
            //		case 1: {
            //			swLL = this.anchorsLL[3];
            //			neLL = L.latLng(newPt);
            //			break;
            //		}
            //		// Southeast
            //		case 2: {
            //			swLL = L.latLng(newPt.lat, this.mapLayer.Anchors[3].Coordinates[0]);
            //			neLL = L.latLng(this.mapLayer.Anchors[1].Coordinates[1], newPt.lng);
            //			break;
            //		}
            //		// Southwest
            //		case 3: {
            //			swLL = L.latLng(newPt);
            //			neLL = this.anchorsLL[1];
            //			break;
            //		}
            //	}
            //	this.mapLayer.Anchors = [];
            //	this.mapLayer.Anchors.push({ Coordinates: [swLL.lng, neLL.lat], Type: 'Point' });
            //	this.mapLayer.Anchors.push({ Coordinates: [neLL.lng, neLL.lat], Type: 'Point' });
            //	this.mapLayer.Anchors.push({ Coordinates: [neLL.lng, swLL.lat], Type: 'Point' });
            //	this.mapLayer.Anchors.push({ Coordinates: [swLL.lng, swLL.lat], Type: 'Point' });
            //	this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
            //	this.leafletLayer.setAnchors(this.anchorsLL);
            //	this.polygon.setLatLngs(this.anchorsLL);
            //	for (let ii = 0; ii < this.markers.length; ii++) {
            //		if (ii !== this.currentMarkerIndex) {
            //			this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
            //		}
            //	}
            //	let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
            //	let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);
            //	let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
            //	this.imageCenter = this.map.layerPointToLatLng(centerPt);
            //	this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
            //	this.updateRotateMarker();
            //}
            //else {
            //this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
            //this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
            //this.leafletLayer.setAnchors(this.anchorsLL);
            //this.polygon.setLatLngs(this.anchorsLL);
            //for (let ii = 0; ii < this.markers.length; ii++) {
            //	if (ii !== this.currentMarkerIndex) {
            //		this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
            //	}
            //}
            //let pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
            //let pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);
            //let centerPt: L.Point = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
            //this.imageCenter = this.map.layerPointToLatLng(centerPt);
            //this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
            //this.updateRotateMarker();
            //}
            this.calculateConstrainedAnchors(newPt);
        }
    };
    LayerDefinition.prototype.calculateConstrainedAnchors = function (newPt) {
        this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
        this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
        this.leafletLayer.setAnchors(this.anchorsLL);
        this.polygon.setLatLngs(this.anchorsLL);
        for (var ii = 0; ii < this.markers.length; ii++) {
            if (ii !== this.currentMarkerIndex) {
                this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
            }
        }
        var pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
        var pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);
        var centerPt = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
        this.imageCenter = this.map.layerPointToLatLng(centerPt);
        this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
        this.updateRotateMarker();
    };
    LayerDefinition.prototype.onMarkerMouseDown = function (event) {
        var marker = event.target;
        this.currentMarkerIndex = marker._secInfo.index;
        this.saveAnchorsLL = [];
        for (var _i = 0, _a = this.anchorsLL; _i < _a.length; _i++) {
            var anchor = _a[_i];
            this.saveAnchorsLL.push(L.latLng(anchor.lat, anchor.lng));
        }
        this.map.dragging.disable();
        this.map.on("mousemove", this.onMaintainAspectMouseMove, this);
        this.map.on("mouseup", this.onMaintainAspectMouseUp, this);
    };
    LayerDefinition.prototype.onMaintainAspectMouseMove = function (event) {
        var newPt = event.latlng;
        this.anchorsLL = this.adminService.calculateNewCornerPts(newPt, this.saveAnchorsLL, this.currentMarkerIndex, this.mapLayer.IsMaintainAspect);
        this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
        this.leafletLayer.setAnchors(this.anchorsLL);
        this.polygon.setLatLngs(this.anchorsLL);
        for (var ii = 0; ii < this.markers.length; ii++) {
            this.markers[ii].setLatLng(L.latLng(this.anchorsLL[ii].lat, this.anchorsLL[ii].lng));
        }
        var pt1 = this.map.latLngToLayerPoint(this.anchorsLL[0]);
        var pt2 = this.map.latLngToLayerPoint(this.anchorsLL[2]);
        var centerPt = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
        this.imageCenter = this.map.layerPointToLatLng(centerPt);
        this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
        this.updateRotateMarker();
    };
    LayerDefinition.prototype.onMaintainAspectMouseUp = function (event) {
        this.map.off("mousemove", this.onMaintainAspectMouseMove, this);
        this.map.off("mouseup", this.onMaintainAspectMouseUp, this);
        this.map.dragging.enable();
        this.currentMarkerIndex = -1;
    };
    LayerDefinition.prototype.onPolygonMouseOver = function (event) {
        var elem = $('.ms-polygonStyles');
        if (elem.length > 0) {
            elem.addClass('ms-moveCursor');
        }
    };
    LayerDefinition.prototype.onPolygonMouseOut = function (event) {
        var elem = $('.ms-polygonStyles');
        if (elem.length > 0) {
            elem.removeClass('ms-moveCursor');
        }
    };
    LayerDefinition.prototype.onPolygonMouseDown = function (event) {
        this.map.dragging.disable();
        this.isDraggingPolygon = true;
        this.moveStartPt = event.latlng;
        this.map.on('mousemove', this.onMapMouseMove, this);
        //this.map.on('touchmove', this.onMapMouseMove, this);
        L.DomEvent.on(document.documentElement, 'mouseup', this.onMouseUp, this);
        L.DomEvent.on(document.documentElement, 'touchend', this.onMouseUp, this);
        L.DomEvent.preventDefault(event.originalEvent);
    };
    LayerDefinition.prototype.onMapMouseMove = function (event) {
        if (this.isDraggingPolygon) {
            var newPt = event.latlng;
            var moveLat = newPt.lat - this.moveStartPt.lat;
            var moveLng = newPt.lng - this.moveStartPt.lng;
            for (var _i = 0, _a = this.anchorsLL; _i < _a.length; _i++) {
                var latLng = _a[_i];
                latLng.lat = latLng.lat + moveLat;
                latLng.lng = latLng.lng + moveLng;
            }
            this.polygon.setLatLngs(this.anchorsLL);
            this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
            this.leafletLayer.setAnchors(this.anchorsLL);
            for (var _b = 0, _c = this.markers; _b < _c.length; _b++) {
                var marker = _c[_b];
                var latLng = marker.getLatLng();
                latLng.lat = latLng.lat + moveLat;
                latLng.lng = latLng.lng + moveLng;
                marker.setLatLng(latLng);
            }
            this.imageCenter.lat = this.imageCenter.lat + moveLat;
            this.imageCenter.lng = this.imageCenter.lng + moveLng;
            this.mapLayer.MapOrigin = this.mapUtilityService.convertLatLngToPosition(this.imageCenter);
            if (this.rotateMarker) {
                var latLng = this.rotateMarker.getLatLng();
                latLng.lat = latLng.lat + moveLat;
                latLng.lng = latLng.lng + moveLng;
                this.rotateMarker.setLatLng(latLng);
                var latLngs = this.rotateLine.getLatLngs();
                latLngs[0].lat = latLngs[0].lat + moveLat;
                latLngs[0].lng = latLngs[0].lng + moveLng;
                //latLngs[1].lat = latLngs[1].lat + moveLat;
                //latLngs[1].lng = latLngs[1].lng + moveLng;
                this.rotateLine.setLatLngs(latLngs);
            }
            this.moveStartPt = L.latLng(newPt);
        }
    };
    LayerDefinition.prototype.onMouseUp = function (event) {
        this.map.dragging.enable();
        if (this.isDraggingPolygon) {
            this.map.off('mousemove', this.onMapMouseMove, this);
            this.map.off('touchmove', this.onMapMouseMove, this);
        }
        this.isDraggingPolygon = false;
        L.DomEvent.off(document.documentElement, 'mouseup', this.onMouseUp, this);
        L.DomEvent.off(document.documentElement, 'touchend', this.onMouseUp, this);
    };
    LayerDefinition.prototype.placeRotatedImagePolygon = function (points) {
        var _this = this;
        this.polygon = L.polygon(points, this.polygonOptions);
        this.polygon.on('mousedown', this.onPolygonMouseDown, this);
        this.polygon.on('touchstart', this.onPolygonMouseDown, this);
        this.polygon.on('mouseover', this.onPolygonMouseOver, this);
        this.polygon.on('mouseout', this.onPolygonMouseOut, this);
        this.polygonGroup.addLayer(this.polygon);
        setTimeout(function () { _this.placeRotateMarker(); }, 400);
        this.polygonElem = $('.ms-polygonStyles');
        if (this.polygonElem.length > 0) {
            this.polygonElem.on('dragstart', false);
            $(document).mouseup(function (event) { _this.onMouseUp(event); });
        }
    };
    LayerDefinition.prototype.placeRotateMarker = function () {
        var style = "position:relative;width:15px;height:15px;border:1px solid black;background-color:white;border-radius:50%";
        var markerPts = this.createRotateMarkerPts();
        this.rotateLine = new L.Polyline([markerPts.lineStartPt, markerPts.rotateMarkerPt]);
        this.polygonGroup.addLayer(this.rotateLine);
        var html = '<div style="' + style + '"></div>';
        var iconOptions = { className: 'rotateMarker', html: html, iconSize: [15, 15] };
        var icon = L.divIcon(iconOptions);
        var markerOptions = { icon: icon, interactive: true, draggable: false };
        this.rotateMarker = L.marker(markerPts.rotateMarkerPt, markerOptions);
        this.rotateMarker.on('mousedown', this.onRotateStart, this);
        this.polygonGroup.addLayer(this.rotateMarker);
    };
    LayerDefinition.prototype.createRotateMarkerPts = function () {
        var rotateMarkerPts = {};
        var points = this.anchorsLL;
        var pt1 = this.map.latLngToLayerPoint(points[0]);
        var pt2 = this.map.latLngToLayerPoint(points[2]);
        var centerPt = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
        pt2 = this.map.latLngToLayerPoint(points[1]);
        // hehe, top is a reserved word
        var midPt = L.point((pt1.x + pt2.x) / 2, (pt1.y + pt2.y) / 2);
        var rotateMarkerPt = this.map.layerPointToLatLng(this.adminService.pointOnLine(centerPt, midPt, 20));
        rotateMarkerPts.lineStartPt = this.map.layerPointToLatLng(midPt);
        rotateMarkerPts.rotateMarkerPt = rotateMarkerPt;
        return (rotateMarkerPts);
    };
    LayerDefinition.prototype.removeRotateMarker = function () {
        if (this.rotateLine) {
            this.polygonGroup.removeLayer(this.rotateLine);
            this.rotateLine = null;
        }
        if (this.rotateMarker) {
            this.polygonGroup.removeLayer(this.rotateMarker);
            this.rotateMarker = null;
        }
    };
    LayerDefinition.prototype.onRotateStart = function (event) {
        this.map.dragging.disable();
        this.isRotatingPolygon = true;
        this.rotateStartPt = event.layerPoint;
        this.rotateOriginPt = this.map.latLngToLayerPoint(new L.LatLng((this.anchorsLL[0].lat + this.anchorsLL[2].lat) / 2, (this.anchorsLL[0].lng + this.anchorsLL[2].lng) / 2));
        this.rotateStartAngle = this.mapLayer.Rotation;
        this.map.on('mousemove', this.onRotateMapMouseMove, this);
        this.map.on('touchmove', this.onRotateMapMouseMove, this);
        L.DomEvent.on(document.documentElement, 'mouseup', this.onRotateMouseUp, this);
        L.DomEvent.on(document.documentElement, 'touchend', this.onRotateMouseUp, this);
    };
    LayerDefinition.prototype.onRotateMapMouseMove = function (event) {
        if (this.isRotatingPolygon) {
            var pos = event.layerPoint;
            var previous = this.rotateStartPt;
            var origin = this.rotateOriginPt;
            var newAngle = -(Math.atan2(pos.y - origin.y, pos.x - origin.x) -
                Math.atan2(previous.y - origin.y, previous.x - origin.x));
            newAngle = this.adminService.convertToDecDegrees(newAngle);
            // Keep it between 180 and -180
            var rotAngle = Math.round(this.rotateStartAngle + newAngle);
            if (rotAngle > 180) {
                rotAngle = rotAngle - 360;
            }
            else if (rotAngle <= -180) {
                rotAngle = rotAngle + 360;
            }
            this.rotateImage(rotAngle);
        }
    };
    LayerDefinition.prototype.onRotateMouseUp = function (event) {
        var _this = this;
        this.map.dragging.enable();
        if (this.isRotatingPolygon) {
            //this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1));
            setTimeout(function () {
                _this.updateRotateMarker();
            }, 400);
            this.map.off('mousemove', this.onRotateMapMouseMove, this);
            this.map.off('touchmove', this.onRotateMapMouseMove, this);
        }
        this.isRotatingPolygon = false;
        L.DomEvent.on(document.documentElement, 'mouseup', this.onMouseUp, this);
        L.DomEvent.on(document.documentElement, 'touchend', this.onMouseUp, this);
    };
    LayerDefinition.prototype.updateRotateMarker = function () {
        if (this.rotateMarker) {
            var markerPts = this.createRotateMarkerPts();
            this.rotateMarker.setLatLng(markerPts.rotateMarkerPt);
            this.rotateLine.setLatLngs([markerPts.lineStartPt, markerPts.rotateMarkerPt]);
        }
    };
    LayerDefinition.prototype.rotateImage = function (rotAngle) {
        if (this.mapLayer.LayerFormat === LayerFormat.PlatformImage) {
            this.mapLayer.Rotation = rotAngle;
            this.layerRotation = rotAngle;
            this.mapLayer.Anchors = this.adminService.calculatePlatformImageAnchors(this.mapLayer);
            this.anchorsLL = this.mapUtilityService.convertAnchorsPositionToLatLng(this.mapLayer.Anchors);
        }
        else {
            var incrementAngle = rotAngle - this.mapLayer.Rotation;
            this.mapLayer.Rotation = rotAngle;
            this.layerRotation = rotAngle;
            this.adminService.rotateImageAnchors(this.anchorsLL, this.imageCenter, -incrementAngle);
            this.mapLayer.Anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(this.anchorsLL);
        }
        this.leafletLayer.setAnchors(this.anchorsLL);
        this.polygon.setLatLngs(this.anchorsLL);
        for (var ii = 0; ii < this.markers.length; ii++) {
            var latLng = L.latLng([this.anchorsLL[ii].lat, this.anchorsLL[ii].lng]);
            this.markers[ii].setLatLng(latLng);
        }
        this.updateRotateMarker();
        this.changeRef.detectChanges();
    };
    LayerDefinition.prototype.onRotateSpinnerChange = function () {
        this.rotateImage(this.layerRotation);
        //this.fitBoundsIfNeeded(this.polygonGroup.getBounds().pad(0.1));
    };
    LayerDefinition.prototype.fitBoundsIfNeeded = function (polyBnds, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var doFit = force;
        if (!doFit) {
            var fitZoom = this.map.getBoundsZoom(polyBnds);
            var curZoom = this.map.getZoom();
            if ((fitZoom - curZoom) < 0 || (fitZoom - curZoom) > 1) {
                doFit = true;
            }
        }
        if (doFit) {
            this.map.fitBounds(polyBnds, this.fitOptions);
            setTimeout(function () {
                _this.updateRotateMarker();
            }, 400);
        }
    };
    LayerDefinition.prototype.getWMSCapabiliites = function () {
        var _this = this;
        var versionOption = this.mapLayer.Options.find(function (elem) { return (elem.Name === 'version'); });
        var version = versionOption ? versionOption.Value : '1.3.0';
        var temp = encodeURIComponent(this.mapLayer.URL + '?service=wms&VERSION=' + version + '&request=getcapabilities');
        var wmsURL = '?url=' + temp;
        //let wmsURL = '?url=http%3A%2F%2Fmesonet.agron.iastate.edu%2Fcgi-bin%2Fwms%2Fnexrad%2Fn0r.cgi%3Fservice%3Dwms%26VERSION%3D1.3.0%26request%3Dgetcapabilities';
        var url = '/maps/capabilities' + wmsURL;
        this.adminService.displayLoadingScreen('Loading WMS information');
        this.httpService.post(url, null, null, null, (function (errMsg) { _this.getWMSError(errMsg); })).then(function (data) {
            if (data) {
                setTimeout(function () {
                    _this.adminService.removeLoadingScreen();
                    _this.wmsModel = _this.adminService.createWMSCapabilitiesModel_1_3_0(data);
                    if (_this.wmsModel) {
                        _this.populateDialogWithWMSData();
                    }
                    _this.changeRef.markForCheck();
                }, 800);
            }
            else {
                setTimeout(function () {
                    _this.adminService.removeLoadingScreen();
                    _this.changeRef.markForCheck();
                }, 800);
            }
        });
    };
    LayerDefinition.prototype.getWMSError = function (error) {
        var _this = this;
        this.errorMessage = 'Error retrieving WMS information.';
        this.changeRef.detectChanges();
        setTimeout(function () {
            _this.adminService.removeLoadingScreen();
            _this.errorDialog.show();
        }, 800);
    };
    LayerDefinition.prototype.populateDialogWithWMSData = function () {
        this.wmsLayers = [];
        for (var _i = 0, _a = this.wmsModel.Layers; _i < _a.length; _i++) {
            var wmsLayer = _a[_i];
            this.wmsLayers.push({ label: wmsLayer.Title && wmsLayer.Title != '' ? wmsLayer.Title : wmsLayer.Name, value: wmsLayer.Name });
            if (wmsLayer.Layers) {
                for (var _b = 0, _c = wmsLayer.Layers; _b < _c.length; _b++) {
                    var subLayer = _c[_b];
                    this.wmsLayers.push({ label: subLayer.Title && subLayer.Title != '' ? subLayer.Title : subLayer.Name, value: subLayer.Name });
                }
            }
        }
    };
    LayerDefinition.prototype.uploadImage = function () {
        this.uploadDialog.show();
    };
    LayerDefinition.prototype.handleOnUploadComplete = function (event) {
        if (!event.ImageProperties) {
            var imageInfo_1 = new ImageInfo(null);
            imageInfo_1.Image = new Image(event.Image);
            imageInfo_1.ImageSize = event.ImageSize.slice(0);
            imageInfo_1.Anchors = [];
            imageInfo_1.Rotation = 0;
            var temp = this.availImages.find(function (elem) { return (elem.Image.Label === imageInfo_1.Image.Label); });
            if (!temp) {
                temp = imageInfo_1;
                this.availImages.push(imageInfo_1);
                this.images.push({ label: imageInfo_1.Image.Label, value: imageInfo_1 });
            }
            else {
                temp.Image.Uri = event.Image.Uri;
                temp.ImageSize = event.ImageSize.slice(0);
            }
            this.selectedImage = temp;
            this.layerURLDropdownChanged({ value: temp });
            this.changeRef.detectChanges();
        }
        else {
            var platformImageInfo_1 = new PlatformImageInfo(null);
            platformImageInfo_1.Image = new Image(event.Image);
            platformImageInfo_1.ImageSize = event.ImageSize.slice(0);
            platformImageInfo_1.ImageProperties = new PlatformImageProperties(event.ImageProperties);
            var temp = this.availPlatformImages.find(function (elem) { return (elem.Image.Label === platformImageInfo_1.Image.Label); });
            if (!temp) {
                temp = platformImageInfo_1;
                this.images.push({ label: platformImageInfo_1.Image.Label, value: platformImageInfo_1 });
                this.availPlatformImages.push(platformImageInfo_1);
            }
            else {
                temp.Image.Uri = event.Image.Uri;
                temp.ImageSize = event.ImageSize.slice(0);
                temp.ImageProperties.Origin = event.ImageProperties.Origin;
                temp.ImageProperties.Resolution = event.ImageProperties.Resolution;
            }
            this.selectedImage = temp;
            this.layerURLDropdownChanged({ value: temp });
            this.changeRef.detectChanges();
        }
    };
    LayerDefinition.prototype.hideErrorDialog = function () {
        this.errorDialog.hide();
        this.errorMessage = "";
    };
    __decorate([
        Input(),
        __metadata("design:type", Location)
    ], LayerDefinition.prototype, "location", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Tenant)
    ], LayerDefinition.prototype, "tenant", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], LayerDefinition.prototype, "onDialogClose", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], LayerDefinition.prototype, "onEnableSave", void 0);
    __decorate([
        ViewChild(UploadDialog),
        __metadata("design:type", UploadDialog)
    ], LayerDefinition.prototype, "uploadDialog", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], LayerDefinition.prototype, "errorDialog", void 0);
    LayerDefinition = __decorate([
        Component({
            selector: 'layer-definition',
            templateUrl: 'layer-definition.component.html',
            styleUrls: ['layer-definition.component.css', '../../shared/primeng-slider.css'],
            animations: [
                trigger('slideOut', [
                    state('in', style({
                        display: 'none',
                        left: '-408px'
                    })),
                    state('out', style({
                        left: '*'
                    })),
                    transition('in <=> out', animate('400ms ease-in-out'))
                ])
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef,
            NgZone,
            AdminService,
            HttpService])
    ], LayerDefinition);
    return LayerDefinition;
}());
export { LayerDefinition };
//# sourceMappingURL=layer-definition.component.js.map