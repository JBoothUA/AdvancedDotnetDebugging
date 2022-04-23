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
import { CommandDefinition, PlatformCommand, CommandName, Parameter, ParameterName, ParameterType } from '../../patrols/action.class';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../map.service';
import { AlarmMapService } from '../alarms/alarmMap.service';
import { NavigationService } from '../../shared/navigation.service';
var PlatformMapService = /** @class */ (function (_super) {
    __extends(PlatformMapService, _super);
    function PlatformMapService(navigationService, platformService, alarmMapService) {
        var _this = _super.call(this, navigationService) || this;
        _this.navigationService = navigationService;
        _this.platformService = platformService;
        _this.alarmMapService = alarmMapService;
        _this.dropPinSize = 42;
        _this.platformMarkers = [];
        _this.platformsVisible = true;
        _this.dynamicLine = [];
        _this.manualZoomMode = false;
        return _this;
    }
    PlatformMapService.prototype.getMarker = function (markerId) {
        return _super.prototype.getMarker.call(this, markerId, this.platformMarkers);
    };
    PlatformMapService.prototype.setMap = function (map) {
        var _this = this;
        _super.prototype.setMap.call(this, map);
        if (map) {
            var curZoom = this.map.getZoom();
            if (curZoom < 19) {
                this.visibleMarkers = false;
            }
            this.platformMarkerGroup = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    var markers = cluster.getAllChildMarkers();
                    var childCount = 0;
                    var childSelected = false;
                    var labelHtml = '';
                    var highestStatus = 4;
                    for (var i = 0; i < markers.length; i++) {
                        var scMarker = markers[i];
                        childCount++;
                        if (!childSelected && scMarker.Selected) {
                            childSelected = true;
                        }
                        labelHtml += "<div>" + scMarker.DisplayName + "</div>";
                        var status_1 = _this.platformService.getPlatformStatusPriortyMapping(_this.platformService.getPlatform(scMarker.RefId));
                        if (status_1 < highestStatus) {
                            highestStatus = status_1;
                        }
                    }
                    var classes = 'platform-marker-wrapper';
                    var markerClasses = 'sc-div-icon';
                    if (childSelected) {
                        classes += ' selected';
                    }
                    if (!_this.visibleMarkers) {
                        markerClasses += ' hidden unclickable';
                    }
                    var iconHtml = "<div class=\"" + classes + "\">\n                                    <div class=\"platform-marker-inner-wrapper\">\n                                        <img class=\"platform-marker-image\" src=\"" + _this.getPlatformClusterrImageFile(_this.platformService.getPlatformStatusPriortyName(highestStatus)) + "\"/>\n                                    </div>\n                                    <div class=\"platform-marker-label platform-marker-label-small platform-cluster-label\">\n                                        " + labelHtml + "\n                                    </div>\n                                    <div class=\"platform-cluster-number\">\n                                        " + childCount + "\n                                    </div>\n                                </div>";
                    var icon = new L.DivIcon({ html: iconHtml, className: markerClasses, iconSize: new L.Point(48, 48) });
                    // Need a Selected property but can't extend the DivIcon and using a custom icon causes problems when calling zoomToShowLayer()
                    icon['Selected'] = childSelected;
                    return icon;
                },
                removeOutsideVisibleBounds: false,
                spiderfyDistanceMultiplier: 3,
                showCoverageOnHover: false,
                maxClusterRadius: 40,
                chunkedLoading: true
            });
            this.map.addLayer(this.platformMarkerGroup);
        }
        else {
            this.platformMarkerGroup = null;
        }
    };
    PlatformMapService.prototype.createPlatformMarker = function (markerId, platform) {
        if (platform.Position.coordinates) {
            var icon = new L.SmartCommandIcon({ targetId: markerId, iconSize: new L.Point(60, 60) });
            var marker = new L.SmartCommandMarker(new L.LatLng(+platform.Position.coordinates[1], +platform.Position.coordinates[0]), { icon: icon });
            marker.Selected = platform.Selected;
            marker.RefId = platform.id;
            marker.DisplayName = platform.DisplayName;
            marker.Type = L.ScMarkerTypes.Platform;
            marker.MarkerId = markerId;
            if (this.visibleMarkers) {
                this.platformMarkerGroup.addLayer(marker);
            }
            this.platformMarkers.push(marker);
        }
    };
    PlatformMapService.prototype.updatePlatformMarker = function (markerId, platform) {
        var marker = this.getMarker(markerId);
        if (marker) {
            marker.Selected = platform.Selected;
            _super.prototype.updateMarker.call(this, marker);
            this.platformMarkerGroup.refreshClusters(marker);
        }
    };
    PlatformMapService.prototype.refreshMarker = function (markerId) {
        _super.prototype.updateMarker.call(this, this.getMarker(markerId));
    };
    PlatformMapService.prototype.removePlatformMarker = function (id) {
        var marker = this.getMarker(id);
        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.platformMarkerGroup.removeLayer(marker);
                }
                catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }
            var index = this.platformMarkers.indexOf(marker);
            if (index !== -1) {
                this.platformMarkers.splice(index, 1);
            }
        }
    };
    PlatformMapService.prototype.movePlatformMarker = function (markerId, platform) {
        var marker = this.getMarker(markerId);
        if (marker && platform.Position.coordinates) {
            marker.setLatLng(new L.LatLng(+platform.Position.coordinates[1], +platform.Position.coordinates[0]));
        }
    };
    PlatformMapService.prototype.zoomToPlatformMarker = function (markerId) {
        var _this = this;
        if (this.map) {
            if (!this.visibleMarkers) {
                this.showPlatformMarkers();
            }
            var marker_1 = this.getMarker(markerId);
            if (marker_1) {
                this.platformMarkerGroup.zoomToShowLayer(marker_1, function () {
                    _this.zoomTo(marker_1, 21);
                });
            }
        }
    };
    PlatformMapService.prototype.createPlatformMarkerNotification = function (markerId, content, className) {
        var popup = L.popup({ className: className, closeButton: false, closeOnClick: false, autoPan: false });
        popup.setContent(content);
        var marker = this.getMarker(markerId);
        if (marker) {
            marker.bindPopup(popup).openPopup();
            setTimeout(function () {
                marker.closePopup();
                marker.unbindPopup();
            }, 6000); // Notify for 6 seconds.
        }
    };
    PlatformMapService.prototype.panIfOutOfView = function (markerId) {
        if (!this.visibleMarkers) {
            this.showPlatformMarkers();
        }
        var marker = this.getMarker(markerId);
        var bounds = this.map.getBounds();
        var pos = marker.getLatLng();
        if (!bounds.contains(pos)) {
            this.panToPlatformMarker(markerId);
        }
        else {
            if (this.map.getZoom() < 19) {
                this.zoomToPlatformMarker(markerId);
            }
        }
    };
    PlatformMapService.prototype.panToPlatformMarker = function (markerId) {
        if (this.map) {
            if (!this.visibleMarkers) {
                this.showPlatformMarkers();
            }
            var marker = this.getMarker(markerId);
            if (marker) {
                this.zoomTo(marker);
            }
        }
    };
    PlatformMapService.prototype.getPlatformMarkerImage = function (platform) {
        var status = this.platformService.getPlatformStatusClass(platform);
        return this.getPlatformMarkerImageFile(status);
    };
    PlatformMapService.prototype.getPlatformMarkerImageFile = function (status) {
        switch (status) {
            case 'failed':
                return '/Content/images/Platforms/single-robot-red.png';
            case 'warning':
                return '/Content/images/Platforms/single-robot-amber.png';
            default:
                return '/Content/images/Platforms/single-robot-green.png';
        }
    };
    PlatformMapService.prototype.getPlatformClusterrImageFile = function (status) {
        switch (status) {
            case 'failed':
                return '/Content/images/Platforms/multiple-robots-red.png';
            case 'warning':
                return '/Content/images/Platforms/multiple-robots-amber.png';
            default:
                return '/Content/images/Platforms/multiple-robots-green.png';
        }
    };
    PlatformMapService.prototype.hidePlatformMarkers = function () {
        if (this.visibleMarkers) {
            try {
                this.platformMarkerGroup.clearLayers();
                if (this.goToLocationMarker) {
                    this.map.removeLayer(this.goToLocationMarker);
                }
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = false;
        }
    };
    PlatformMapService.prototype.showPlatformMarkers = function () {
        if (!this.visibleMarkers) {
            try {
                this.platformMarkerGroup.addLayers(this.platformMarkers);
                if (this.goToLocationMarker) {
                    this.map.addLayer(this.goToLocationMarker);
                }
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = true;
        }
    };
    PlatformMapService.prototype.togglePlatformMarkers = function () {
        if (this.visibleMarkers) {
            this.hidePlatformMarkers();
        }
        else {
            this.showPlatformMarkers();
        }
    };
    PlatformMapService.prototype.setGoToLocationMode = function (platform, commandDef) {
        this.interactivePlatform = platform;
        if (commandDef) {
            this.interactiveCommandDef = commandDef;
        }
        else {
            var defaultCommand = new CommandDefinition();
            defaultCommand.CommandName = CommandName.GoToLocation;
            this.interactiveCommandDef = defaultCommand;
        }
        this.setGoToLocationCursor();
        if (this.map) {
            this.map.on('click', this.onMapClick, this);
            this.map.on('mousemove', this.onMapDynamicPoint, this);
        }
        this.keyPressFunc = this.onMapKeypress.bind(this);
        document.addEventListener('keydown', this.keyPressFunc, true);
    };
    PlatformMapService.prototype.stopInteractiveMode = function () {
        this.interactivePlatform = null;
        this.interactiveCommandDef = null;
        this.resetMouse();
    };
    PlatformMapService.prototype.setGoToLocationCursor = function () {
        var dropPinCenter = this.dropPinSize / 2;
        document.getElementById('map').style.cursor = "url(\"content/images/platforms/go-to-location.png\") " + dropPinCenter + " " + dropPinCenter + ", crosshair";
        // Set cursor for all Alarm Icons
        $('.sc-marker, .sc-marker-icon').css('cursor', 'url("content/images/platforms/go-to-alarm.png"), crosshair');
    };
    PlatformMapService.prototype.resetMouse = function () {
        this.removeDynamics();
        this.map.off('click', this.onMapClick, this);
        this.map.off('mousemove', this.onMapDynamicPoint);
        if (this.keyPressFunc) {
            document.removeEventListener('keydown', this.keyPressFunc, true);
            this.keyPressFunc = null;
        }
        // Reset the cursor
        document.getElementById('map').style.cursor = '';
        $('.sc-marker, .sc-marker-icon').css('cursor', '');
    };
    PlatformMapService.prototype.onMapClick = function (e) {
        this.sendGoToLocationCommand(e.latlng, this.alarmMapService.mouseOverAlarmMarkerInformation);
    };
    PlatformMapService.prototype.sendGoToLocationCommand = function (latLng, alarm) {
        var platformCommand = new PlatformCommand(this.interactivePlatform.id, this.interactiveCommandDef.CommandName, this.getParameters(latLng, alarm));
        this.platformService.executePlatformCommand(platformCommand, this.interactivePlatform.TenantId);
        this.stopInteractiveMode();
    };
    PlatformMapService.prototype.addGoToLocationIcon = function (latLng, platformId, displayName) {
        var robotId = (platformId || this.interactivePlatform.id);
        var icon = L.icon({
            iconUrl: 'content/images/platforms/go-to-location.png',
            iconSize: [this.dropPinSize, this.dropPinSize],
            className: 'go-to-location-icon-' + robotId
        });
        this.goToLocationMarker = new L.SmartCommandMarker(latLng, { icon: icon, title: 'Go to Location - ' + (displayName || robotId) });
        this.goToLocationMarker.on('click', function () { this.openGoToLocationDialog(platformId || this.interactivePlatform.id); }, this);
        if (this.visibleMarkers) {
            this.goToLocationMarker.addTo(this.map);
        }
    };
    PlatformMapService.prototype.openGoToLocationDialog = function (platformId) {
        var platform = this.platformService.getPlatform(platformId);
        this.platformService.showGoToLocationDialog.next(platform);
    };
    PlatformMapService.prototype.getParameters = function (latLng, alarm) {
        if (alarm) {
            var positionParam = new Parameter(null);
            positionParam.Name = ParameterName.Position;
            positionParam.Type = ParameterType.Double;
            positionParam.Value = alarm.Position.Coordinates[1] + ", " + alarm.Position.Coordinates[0];
            var alarmIdParam = new Parameter(null);
            alarmIdParam.Name = ParameterName.AlarmId;
            alarmIdParam.Type = ParameterType.String;
            alarmIdParam.Value = this.alarmMapService.mouseOverAlarmMarkerInformation.Id;
            return [positionParam, alarmIdParam];
        }
        else if (latLng) {
            var positionParam = new Parameter(null);
            positionParam.Name = ParameterName.Position;
            positionParam.Type = ParameterType.Double;
            positionParam.Value = latLng.lat + ", " + latLng.lng;
            return [positionParam];
        }
    };
    PlatformMapService.prototype.removeGoToLocationIcon = function () {
        if (this.goToLocationMarker) {
            this.goToLocationMarker.removeFrom(this.map);
        }
    };
    PlatformMapService.prototype.removeGoToLocationIconHandler = function () {
        var _this = this;
        return function () { return _this.removeGoToLocationIcon(); };
    };
    PlatformMapService.prototype.onMapDynamicPoint = function (e) {
        // Sets a dynamic polyline from the platform to the cursor
        if (!this.interactivePlatform)
            return;
        var pts = [];
        var lat = this.interactivePlatform.Position.coordinates[1];
        var lng = this.interactivePlatform.Position.coordinates[0];
        pts[0] = L.latLng([lat, lng]);
        pts[1] = e.latlng;
        if (!this.dynamicLine[0]) {
            var dynamicPathOptions = { color: '#7F5CB3', dashArray: '5,10', weight: 5, interactive: false };
            this.dynamicLine[0] = L.polyline(pts, dynamicPathOptions);
            this.platformMarkerGroup.addLayer(this.dynamicLine[0]);
        }
        else {
            this.dynamicLine[0].setLatLngs(pts);
        }
    };
    PlatformMapService.prototype.onMapKeypress = function (e) {
        if (e.code === 'Escape') {
            e.stopPropagation();
            this.stopInteractiveMode();
        }
    };
    PlatformMapService.prototype.removeDynamics = function () {
        if (this.dynamicLine[0]) {
            this.platformMarkerGroup.removeLayer(this.dynamicLine[0]);
            this.dynamicLine[0] = null;
        }
    };
    PlatformMapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NavigationService, PlatformService, AlarmMapService])
    ], PlatformMapService);
    return PlatformMapService;
}(MapService));
export { PlatformMapService };
//# sourceMappingURL=platformMap.service.js.map