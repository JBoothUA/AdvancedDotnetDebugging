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
import { PlatformImageProperties } from '../shared/map-settings.class';
import { LocationFilterService } from '../shared/location-filter.service';
var AdminService = /** @class */ (function () {
    function AdminService(httpService, ngZone, locFilterService) {
        this.httpService = httpService;
        this.ngZone = ngZone;
        this.locFilterService = locFilterService;
        this.radToDegrees = 180 / Math.PI;
        this.degreesToRad = Math.PI / 180;
        this.leafletLayers = [];
    }
    AdminService.prototype.setMapInfo = function (map, mapUtilServ) {
        this.map = map;
        this.mapUtilityService = mapUtilServ;
    };
    AdminService.prototype.getMapUtilityService = function () {
        return (this.mapUtilityService);
    };
    AdminService.prototype.formatLatLng = function (latLng) {
        var tempLat = latLng.lat.toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
        var tempLng = latLng.lng.toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
        var temp = tempLat + this.getListSeparator() + ' ' + tempLng;
        return (temp);
    };
    AdminService.prototype.formatPosition = function (position) {
        var tempLat = position.Coordinates[1].toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
        var tempLng = position.Coordinates[0].toLocaleString(undefined, { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 7 });
        var temp = tempLat + this.getListSeparator() + ' ' + tempLng;
        return (temp);
    };
    AdminService.prototype.getListSeparator = function () {
        var list = ['a', 'b'];
        var listSeparator = list.toLocaleString().substring(1, 2);
        return (listSeparator);
    };
    AdminService.prototype.calculateImageAnchorsFromMap = function (mapLayer) {
        var pixelBnds = this.map.getPixelBounds();
        var curZoom = this.map.getZoom();
        var mapSize = this.map.getSize();
        var scaledMapSize = mapSize.divideBy(2);
        if (!mapLayer.ImageSize || mapLayer.ImageSize.length === 0) {
            mapLayer.ImageSize = [scaledMapSize.x, scaledMapSize.y];
        }
        var scaledImageSize;
        var imageSize = mapLayer.ImageSize;
        if (imageSize && imageSize.length > 0) {
            var mapRatio = scaledMapSize.x / scaledMapSize.y;
            var imageRatio = imageSize[0] / imageSize[1];
            scaledImageSize = mapRatio > imageRatio ? [imageSize[0] * scaledMapSize.y / imageSize[1], scaledMapSize.y] : [scaledMapSize.x, imageSize[1] * scaledMapSize.x / imageSize[0]];
        }
        var size;
        if (scaledImageSize) {
            size = L.point(scaledImageSize[0], scaledImageSize[1]);
        }
        else {
            size = scaledMapSize;
        }
        var center = pixelBnds.getCenter();
        var sw;
        var ne;
        mapLayer.ImageProperties = new PlatformImageProperties(null);
        sw = L.point(center.x - (size.x / 2), center.y + (size.y / 2));
        ne = L.point(center.x + (size.x / 2), center.y - (size.y / 2));
        var swLL = this.map.unproject(sw, curZoom);
        var neLL = this.map.unproject(ne, curZoom);
        var anchors = [];
        anchors.push({ Coordinates: [swLL.lng, neLL.lat], Type: 'Point' });
        anchors.push({ Coordinates: [neLL.lng, neLL.lat], Type: 'Point' });
        anchors.push({ Coordinates: [neLL.lng, swLL.lat], Type: 'Point' });
        anchors.push({ Coordinates: [swLL.lng, swLL.lat], Type: 'Point' });
        mapLayer.MapOrigin = { Coordinates: [(swLL.lng + neLL.lng) / 2, (swLL.lat, neLL.lat) / 2], Type: 'Point' };
        return (anchors);
    };
    AdminService.prototype.calculatePlatformImageAnchors = function (mapLayer) {
        var anchors;
        if (mapLayer.MapOrigin === null || (mapLayer.ImageProperties.Origin[0] === 0 && mapLayer.ImageProperties.Origin[1] === 0)) {
            return null;
        }
        var x = mapLayer.ImageProperties.Origin[0];
        var y = mapLayer.ImageProperties.Origin[1];
        var dist = {};
        dist.X = Math.abs(x);
        dist.Y = Math.abs(y);
        dist.Hypotenuse = Math.sqrt(x * x + y * y);
        var platOrigin = this.mapUtilityService.convertPositionToLatLng(mapLayer.MapOrigin);
        var anchorsLL = this.getImageAnchorsByRotationDist(platOrigin, mapLayer.Rotation, dist);
        anchors = this.mapUtilityService.convertAnchorsLatLngToPosition(anchorsLL);
        return (anchors);
    };
    AdminService.prototype.getImageAnchorsByRotationDist = function (platformOrigin, rotation, dist) {
        var imageCorners = this.getImageCornerLatLngs(platformOrigin, rotation, dist);
        var anchorsLL = [];
        anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.UpperLeft.lat), this.convertToDecDegrees(imageCorners.UpperLeft.lng)));
        anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.UpperRight.lat), this.convertToDecDegrees(imageCorners.UpperRight.lng)));
        anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.LowerRight.lat), this.convertToDecDegrees(imageCorners.LowerRight.lng)));
        anchorsLL.push(L.latLng(this.convertToDecDegrees(imageCorners.LowerLeft.lat), this.convertToDecDegrees(imageCorners.LowerLeft.lng)));
        return anchorsLL;
    };
    AdminService.prototype.getImageCornerLatLngs = function (platformOrigin, rotation, dist) {
        var imageCorners = {};
        var platOriginRad = this.convertLatLngToRadians(platformOrigin);
        var rotationRad = this.convertToRadians(rotation);
        var angle = Math.acos(dist.X / dist.Hypotenuse);
        imageCorners["UpperLeft"] = this.calcLatLngFromBearingDistance(platOriginRad, -angle - rotationRad, dist.Hypotenuse);
        imageCorners["UpperRight"] = this.calcLatLngFromBearingDistance(platOriginRad, angle - rotationRad, dist.Hypotenuse);
        angle = Math.acos(dist.Y / dist.Hypotenuse);
        imageCorners["LowerLeft"] = this.calcLatLngFromBearingDistance(platOriginRad, -(angle + (Math.PI / 2)) - rotationRad, dist.Hypotenuse);
        imageCorners["LowerRight"] = this.calcLatLngFromBearingDistance(platOriginRad, (angle + (Math.PI / 2)) - rotationRad, dist.Hypotenuse);
        return imageCorners;
    };
    AdminService.prototype.calcLatLngFromBearingDistance = function (startPt, bearing, dist) {
        var R = 6371000; // Earth radius in meters
        var dOverR = dist / R;
        var startLat = startPt.lat;
        var startLng = startPt.lng;
        var newLat = Math.asin(Math.sin(startLat) * Math.cos(dOverR) +
            Math.cos(startLat) * Math.sin(dOverR) * Math.cos(bearing));
        var newLng = startLng + Math.atan2(Math.sin(bearing) * Math.sin(dOverR) * Math.cos(startLat), Math.cos(dOverR) - Math.sin(startLat) * Math.sin(newLat));
        var newLatLng = L.latLng(newLat, newLng);
        return (newLatLng);
    };
    AdminService.prototype.rotateImageAnchors = function (anchors, center, angle) {
        anchors[0] = this.rotateLatLng(anchors[0], center, angle);
        anchors[1] = this.rotateLatLng(anchors[1], center, angle);
        anchors[2] = this.rotateLatLng(anchors[2], center, angle);
        anchors[3] = this.rotateLatLng(anchors[3], center, angle);
        return (anchors);
    };
    AdminService.prototype.rotateLatLng = function (latLng, center, angle) {
        // cx, cy - center of square coordinates
        // x, y - coordinates of a corner point of the square
        // theta is the angle of rotation
        var newLatLng;
        var theta = this.convertToRadians(angle);
        var curZoom = this.map.getZoom();
        var centerPt = this.map.project(center, curZoom);
        var pt = this.map.project(latLng, curZoom);
        // translate point to origin
        var tempX = pt.x - centerPt.x;
        var tempY = pt.y - centerPt.y;
        // now apply rotation
        var rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta);
        var rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta);
        // translate back
        pt.x = rotatedX + centerPt.x;
        pt.y = rotatedY + centerPt.y;
        newLatLng = this.map.unproject(pt, curZoom);
        return (newLatLng);
    };
    AdminService.prototype.calculateNewCornerPts = function (newLatLng, anchors, idx, maintainAspect) {
        var newAnchors = [];
        var anchorPts = [];
        var newCornerPt;
        var pt1 = this.map.latLngToLayerPoint(anchors[0]);
        var pt2 = this.map.latLngToLayerPoint(anchors[1]);
        var pt3 = this.map.latLngToLayerPoint(anchors[2]);
        var pt4 = this.map.latLngToLayerPoint(anchors[3]);
        var newPt = this.map.latLngToLayerPoint(newLatLng);
        if (maintainAspect) {
            var centerPt = L.point((pt1.x + pt3.x) / 2, (pt1.y + pt3.y) / 2);
            var anchorPt = this.map.latLngToLayerPoint(anchors[idx]);
            var dist1 = anchorPt.distanceTo(centerPt);
            var dist2 = newPt.distanceTo(centerPt);
            var scale = dist2 / dist1;
            for (var _i = 0, anchors_1 = anchors; _i < anchors_1.length; _i++) {
                var point = anchors_1[_i];
                var tempPt = this.map.latLngToLayerPoint(point);
                var x1 = (tempPt.x - centerPt.x) * scale + centerPt.x;
                var y1 = (tempPt.y - centerPt.y) * scale + centerPt.y;
                var scaledPt = L.point(x1, y1);
                newAnchors.push(this.map.layerPointToLatLng(scaledPt));
            }
        }
        else {
            switch (idx) {
                case 0: {
                    newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt2, pt3, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng(anchors[2].lat, anchors[2].lng));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt3, pt4, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    break;
                }
                case 1: {
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt4, pt1, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt3, pt4, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng(anchors[3].lat, anchors[3].lng));
                    break;
                }
                case 2: {
                    newAnchors.push(L.latLng(anchors[0].lat, anchors[0].lng));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt1, pt2, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt4, pt1, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    break;
                }
                case 3: {
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt1, pt2, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng(anchors[1].lat, anchors[1].lng));
                    newCornerPt = this.calculatePerpendicularIntersectPt(pt2, pt3, newPt);
                    newAnchors.push(this.map.layerPointToLatLng(newCornerPt));
                    newAnchors.push(L.latLng([newLatLng.lat, newLatLng.lng]));
                    break;
                }
            }
        }
        return (newAnchors);
    };
    AdminService.prototype.calculateAngleBetween2Lines = function (seg1Pt1, seg1Pt2, seg2Pt1, seg2Pt2) {
        var angle1 = Math.atan2(seg1Pt1.y - seg1Pt2.y, seg1Pt1.x - seg1Pt2.x);
        var angle2 = Math.atan2(seg2Pt1.y - seg2Pt2.y, seg2Pt1.x - seg2Pt2.x);
        return angle1 - angle2;
    };
    AdminService.prototype.calculatePerpendicularIntersectPt = function (segPt1, segPt2, pt) {
        var k = ((segPt2.y - segPt1.y) * (pt.x - segPt1.x) - (segPt2.x - segPt1.x) *
            (pt.y - segPt1.y)) / (Math.pow((segPt2.y - segPt1.y), 2) + Math.pow((segPt2.x - segPt1.x), 2));
        var x4 = pt.x - k * (segPt2.y - segPt1.y);
        var y4 = pt.y + k * (segPt2.x - segPt1.x);
        var perpIntPt = L.point(x4, y4);
        return (perpIntPt);
    };
    AdminService.prototype.convertToRadians = function (decDegs) {
        var rads = isNaN(decDegs) === true ? 0.0 : decDegs * this.degreesToRad;
        return rads;
    };
    AdminService.prototype.convertLatLngToRadians = function (latLng) {
        return (L.latLng([this.convertToRadians(latLng.lat), this.convertToRadians(latLng.lng)]));
    };
    AdminService.prototype.convertToDecDegrees = function (rad) {
        var decDegrees = isNaN(rad) === true ? 0.0 : rad * this.radToDegrees;
        return decDegrees;
    };
    AdminService.prototype.convertLatLngToDecDegrees = function (latLng) {
        return (L.latLng([this.convertToDecDegrees(latLng.lat), this.convertToDecDegrees(latLng.lng)]));
    };
    AdminService.prototype.pointOnLine = function (start, final, distPx) {
        if (start.x === final.x && start.y === final.y) {
            return (L.point(start.x, start.y));
        }
        var ratio = 1 + distPx / start.distanceTo(final);
        return new L.Point(start.x + (final.x - start.x) * ratio, start.y + (final.y - start.y) * ratio);
    };
    AdminService.prototype.createWMSCapabilitiesModel_1_3_0 = function (jsonObj) {
        //convert the string into a xml doc object
        var wmsCapabilities = {};
        var layerId;
        var crsToken;
        var layerInfo = {};
        var layerDef;
        if (typeof jsonObj.WMS_Capabilities !== 'undefined') {
            if (typeof jsonObj.WMS_Capabilities['@version'] !== 'undefined') {
                wmsCapabilities.Version = jsonObj.WMS_Capabilities['@version'];
                if (wmsCapabilities.Version === '1.3.0') {
                    crsToken = 'CRS';
                }
                else if (wmsCapabilities['Version'] === '1.1.1') {
                    crsToken = 'SRS';
                }
            }
            if (typeof jsonObj.WMS_Capabilities.Capability !== 'undefined') {
                if (jsonObj.WMS_Capabilities.Capability.Request !== 'undefined') {
                    if (jsonObj.WMS_Capabilities.Capability.Request.GetMap !== 'undefined') {
                        if (jsonObj.WMS_Capabilities.Capability.Request.GetMap.Format !== 'undefined') {
                            var formats = jsonObj.WMS_Capabilities.Capability.Request.GetMap.Format;
                            if (!(formats.length > 0)) {
                                var tempDef_1 = formats;
                                formats = [];
                                formats.push(tempDef_1);
                            }
                            wmsCapabilities.Formats = [];
                            for (var ii in formats) {
                                var formatDef = formats[ii];
                                wmsCapabilities.Formats.push(formatDef);
                            }
                        }
                    }
                }
                if (typeof jsonObj.WMS_Capabilities.Capability.Layer !== 'undefined') {
                    wmsCapabilities.Layers = [];
                    if (!(jsonObj.WMS_Capabilities.Capability.Layer.length > 0)) {
                        var tempDef = jsonObj.WMS_Capabilities.Capability.Layer;
                        jsonObj.WMS_Capabilities.Capability.Layer = [];
                        jsonObj.WMS_Capabilities.Capability.Layer.push(tempDef);
                    }
                    for (var ii in jsonObj.WMS_Capabilities.Capability.Layer) {
                        layerDef = jsonObj.WMS_Capabilities.Capability.Layer[ii];
                        layerInfo.Title = layerDef.Title;
                        if (typeof layerDef.Name !== 'undefined') {
                            layerInfo.Name = layerDef.Name;
                            layerId = layerInfo.Name;
                        }
                        else
                            layerId = layerInfo.Title;
                        if (typeof layerDef.Abstract !== 'undefined')
                            layerInfo.Abstract = layerDef.Abstract;
                        if (typeof layerDef.EX_GeographicBoundingBox !== 'undefined') {
                            var exBBox = {};
                            exBBox.WestBoundLongitude = layerDef.EX_GeographicBoundingBox.westBoundLongitude;
                            exBBox.EastBoundLongitude = layerDef.EX_GeographicBoundingBox.eastBoundLongitude;
                            exBBox.SouthBoundLatitude = layerDef.EX_GeographicBoundingBox.southBoundLatitude;
                            exBBox.NorthBoundLatitude = layerDef.EX_GeographicBoundingBox.northBoundLatitude;
                            layerInfo.EX_GeographicBoundingBox = exBBox;
                        }
                        if (typeof layerDef.Title !== 'undefined') {
                            layerInfo.Title = layerDef.Title;
                        }
                        if (typeof layerDef.BoundingBox !== 'undefined') {
                            if (!(layerDef.BoundingBox.length > 0)) {
                                var tempDef_2 = layerDef.BoundingBox;
                                layerDef.BoundingBox = [];
                                layerDef.BoundingBox.push(tempDef_2);
                            }
                            layerInfo.BoundingBox = [];
                            for (var _i = 0, _a = layerDef.BoundingBox; _i < _a.length; _i++) {
                                var bboxDef = _a[_i];
                                var bbox = {};
                                if (typeof bboxDef['@' + crsToken] !== 'undefined') {
                                    bbox[crsToken] = bboxDef['@' + crsToken];
                                    bbox.MinX = bboxDef['@minx'];
                                    bbox.MinY = bboxDef['@miny'];
                                    bbox.MaxX = bboxDef['@maxx'];
                                    bbox.MaxY = bboxDef['@maxy'];
                                }
                                layerInfo.BoundingBox.push(bbox);
                            }
                        }
                        if (typeof layerDef[crsToken] !== 'undefined') {
                            if (!(layerDef.CRS.length > 0)) {
                                var tempDef_3 = layerDef[crsToken];
                                layerDef[crsToken] = [];
                                layerDef[crsToken].push(tempDef_3);
                            }
                            layerInfo.CRS = [];
                            for (var _b = 0, _c = layerDef[crsToken]; _b < _c.length; _b++) {
                                var crsDef = _c[_b];
                                layerInfo.CRS.push(crsDef);
                            }
                        }
                    }
                    if (typeof layerDef.Layer !== 'undefined') {
                        if (!(layerDef.Layer.length > 0)) {
                            var tempDef_4 = layerDef.Layer.Layer;
                            layerDef.Layer.Layer = [];
                            layerDef.Layer.push(tempDef_4);
                        }
                        layerInfo.Layers = [];
                        for (var _d = 0, _e = layerDef.Layer; _d < _e.length; _d++) {
                            var subLayerDef = _e[_d];
                            var subLayerInfo = {};
                            if (typeof (subLayerDef.Title) !== 'undefined') {
                                subLayerInfo.Title = subLayerDef.Title;
                            }
                            if (typeof (subLayerDef.Name) !== 'undefined') {
                                subLayerInfo.Name = subLayerDef.Name;
                            }
                            if (typeof (subLayerDef.Abstract) !== 'undefined') {
                                subLayerInfo.Abstract = subLayerDef.Abstract;
                            }
                            if (typeof (subLayerDef.EX_GeographicBoundingBox) !== 'undefined') {
                                var exBBox_1 = {};
                                exBBox_1.WestBoundLongitude = subLayerDef.EX_GeographicBoundingBox.westBoundLongitude;
                                exBBox_1.EastBoundLongitude = subLayerDef.EX_GeographicBoundingBox.eastBoundLongitude;
                                exBBox_1.SouthBoundLatitude = subLayerDef.EX_GeographicBoundingBox.southBoundLatitude;
                                exBBox_1.NorthBoundLatitude = subLayerDef.EX_GeographicBoundingBox.northBoundLatitude;
                                subLayerInfo.EX_GeographicBoundingBox = exBBox_1;
                            }
                            if (typeof (subLayerDef.BoundingBox) !== 'undefined') {
                                if (!(subLayerDef.BoundingBox.length > 0)) {
                                    var tempDef_5 = subLayerDef.BoundingBox;
                                    subLayerDef.BoundingBox = [];
                                    subLayerDef.BoundingBox.push(tempDef_5);
                                }
                                subLayerInfo.BoundingBox = [];
                                for (var _f = 0, _g = subLayerDef.BoundingBox; _f < _g.length; _f++) {
                                    var bboxDef = _g[_f];
                                    var bbox = {};
                                    if (typeof bboxDef['@' + crsToken] !== 'undefined') {
                                        bbox[crsToken] = bboxDef['@' + crsToken];
                                        bbox.MinX = bboxDef['@minx'];
                                        bbox.MinY = bboxDef['@miny'];
                                        bbox.MaxX = bboxDef['@maxx'];
                                        bbox.MaxY = bboxDef['@maxy'];
                                    }
                                    subLayerInfo.BoundingBox.push(bbox);
                                }
                            }
                            if (typeof (subLayerDef[crsToken]) !== 'undefined') {
                                if (!(subLayerDef[crsToken].length > 0)) {
                                    var tempDef_6 = subLayerDef[crsToken];
                                    subLayerDef[crsToken] = [];
                                    subLayerDef[crsToken].push(tempDef_6);
                                }
                                subLayerInfo.CRS = [];
                                for (var _h = 0, _j = subLayerDef[crsToken]; _h < _j.length; _h++) {
                                    var crsDef = _j[_h];
                                    subLayerInfo.CRS.push(crsDef);
                                }
                            }
                            subLayerInfo.ParentLayerID = layerId;
                            layerInfo.Layers.push(subLayerInfo);
                        }
                        layerInfo.ParentLayerID = null;
                        wmsCapabilities.Layers.push(layerInfo);
                    }
                }
            }
            //Return the corrected json object
        }
        return wmsCapabilities;
    };
    AdminService.prototype.saveTenant = function (tenant) {
        var _this = this;
        var url = '/tenants/save';
        this.displayLoadingScreen('Saving map settings information');
        this.httpService.post(url, tenant).then(function (data) {
            if (data) {
                setTimeout(function () {
                    _this.removeLoadingScreen();
                }, 800);
            }
            ;
        });
    };
    AdminService.prototype.savePlatforms = function (platforms) {
        var _this = this;
        var url = '/platforms/platforms';
        this.displayLoadingScreen('Saving platform map information');
        for (var _i = 0, platforms_1 = platforms; _i < platforms_1.length; _i++) {
            var platform = platforms_1[_i];
            this.httpService.put(url, platform).then(function (data) {
                if (data) {
                    console.log("New map saved on platform");
                }
                ;
            });
        }
        setTimeout(function () {
            _this.removeLoadingScreen();
        }, 800);
    };
    AdminService.prototype.displayLoadingScreen = function (message) {
        var loading = '<div id="loadingScreen" style="display:none;">' +
            '<i style="position:relative;font-size:20pt; top:27px;left:0;" class="fa-li fa fa-spinner fa-spin"></i>' +
            '<span style="font-weight:bold;position:absolute;top:25px;">' + message + '</span>' +
            '</div>';
        $("body").append('<div class="slide-in-menu-modal loadingModal"></div>');
        $("body").append(loading);
        $("#loadingScreen").fadeIn();
    };
    AdminService.prototype.removeLoadingScreen = function () {
        $("#loadingScreen").fadeOut("400");
        $("#loadingScreen").remove();
        $(".loadingModal").remove();
    };
    AdminService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [HttpService,
            NgZone,
            LocationFilterService])
    ], AdminService);
    return AdminService;
}());
export { AdminService };
//# sourceMappingURL=admin.service.js.map