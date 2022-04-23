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
import { Subject } from 'rxjs/Subject';
import { MapService } from '../map.service';
import { NavigationService } from '../../shared/navigation.service';
export function GetAlarmMarkerId(alarm) {
    return alarm && alarm.Position ? alarm.Position.Coordinates[1] + ',' + alarm.Position.Coordinates[0] : 'Unknown';
}
var AlarmMapService = /** @class */ (function (_super) {
    __extends(AlarmMapService, _super);
    function AlarmMapService(navigationService) {
        var _this = _super.call(this, navigationService) || this;
        _this.navigationService = navigationService;
        _this.mouseOverAlarmMarkerInformation = null;
        _this.openOverlappingAlarmsSub = new Subject();
        _this.refreshOverlappingAlarmsSub = new Subject();
        _this.closeOverlappingAlarmsSub = new Subject();
        _this.forceCloseOverlappingAlarmsSub = new Subject();
        _this.deSelectGroupSub = new Subject();
        _this.manualZoomMode = false;
        _this.alarmMarkers = [];
        return _this;
    }
    AlarmMapService.prototype.setMap = function (map) {
        var _this = this;
        _super.prototype.setMap.call(this, map);
        if (map) {
            var curZoom = this.map.getZoom();
            if (curZoom < 10) {
                this.visibleMarkers = false;
            }
            this.alarmMarkerGroup = L.markerClusterGroup({
                iconCreateFunction: function (cluster) {
                    var markers = cluster.getAllChildMarkers();
                    var childCount = 0;
                    var highestPriority = 4;
                    var childSelected = false;
                    for (var i = 0; i < markers.length; i++) {
                        var scMarker = markers[i];
                        childCount += scMarker.Number;
                        if (scMarker.HighestPriority < highestPriority) {
                            highestPriority = scMarker.HighestPriority;
                        }
                        if (!childSelected && scMarker.Selected) {
                            childSelected = true;
                        }
                    }
                    var classes = 'marker-cluster p' + highestPriority;
                    var markerClasses = 'sc-div-icon';
                    if (childSelected) {
                        classes += ' selected';
                    }
                    if (!_this.visibleMarkers) {
                        markerClasses += ' hidden unclickable';
                    }
                    var icon = new L.DivIcon({ html: '<div class="' + classes + '"><div>' + childCount + '</div></div>', className: markerClasses, iconSize: new L.Point(42, 42) });
                    // Need a Selected property but can't extend the DivIcon and using a custom icon causes problems when calling zoomToShowLayer()
                    icon['Selected'] = childSelected;
                    return icon;
                },
                removeOutsideVisibleBounds: false,
                spiderfyDistanceMultiplier: 3,
                showCoverageOnHover: false,
                chunkedLoading: true
            });
            this.map.addLayer(this.alarmMarkerGroup);
        }
        else {
            this.alarmMarkerGroup = null;
        }
    };
    AlarmMapService.prototype.getMarker = function (markerId) {
        return _super.prototype.getMarker.call(this, markerId, this.alarmMarkers);
    };
    AlarmMapService.prototype.zoomToAlarmMarker = function (markerId) {
        var _this = this;
        if (!this.visibleMarkers) {
            this.showAlarmMarkers();
        }
        var marker = this.getMarker(markerId);
        if (marker) {
            this.alarmMarkerGroup.zoomToShowLayer(marker, function () {
                if (_this.map.getZoom() < 10) {
                    _this.zoomTo(marker, 10);
                }
                _this.alarmMarkerGroup.zoomToShowLayer(marker);
            });
        }
    };
    AlarmMapService.prototype.panToAlarmMarker = function (markerId) {
        var marker = this.getMarker(markerId);
        if (marker) {
            var visibleOne = this.alarmMarkerGroup.getVisibleParent(marker);
            if (!visibleOne) {
                visibleOne = marker;
            }
            if (this.map.getZoom() < 10) {
                if (!this.visibleMarkers) {
                    this.showAlarmMarkers();
                }
                this.zoomTo(visibleOne, 10);
            }
            else {
                this.panTo(visibleOne);
            }
        }
    };
    AlarmMapService.prototype.getAlarmMarkerId = function (alarm) {
        return GetAlarmMarkerId(alarm);
    };
    AlarmMapService.prototype.createAlarmGroupMarker = function (markerId, alarms) {
        // Create marker
        if (!alarms[0].Position) {
            return;
        }
        var icon = new L.SmartCommandIcon({ targetId: markerId });
        var marker = new L.SmartCommandMarker(new L.LatLng(+alarms[0].Position.Coordinates[1], +alarms[0].Position.Coordinates[0]), { icon: icon });
        marker.Number = alarms.length;
        marker.HighestPriority = this.getHighestPriority(alarms);
        marker.Selected = this.anySelectedAlarm(alarms);
        marker.Type = L.ScMarkerTypes.Alarm;
        marker.MarkerId = markerId;
        marker.RefId = markerId;
        if (this.visibleMarkers) {
            this.alarmMarkerGroup.addLayer(marker);
        }
        this.alarmMarkers.push(marker);
    };
    AlarmMapService.prototype.updateGroupMarker = function (markerId, alarms) {
        var marker = this.getMarker(markerId);
        if (marker) {
            marker.Number = alarms.length;
            marker.HighestPriority = this.getHighestPriority(alarms);
            marker.Selected = this.anySelectedAlarm(alarms);
            if (!this.alarmMarkerGroup.hasLayer(marker)) {
                this.alarmMarkerGroup.addLayer(marker);
            }
            this.alarmMarkerGroup.refreshClusters(marker);
            _super.prototype.updateMarker.call(this, marker);
        }
    };
    AlarmMapService.prototype.refreshMarker = function (markerId) {
        _super.prototype.updateMarker.call(this, this.getMarker(markerId));
    };
    AlarmMapService.prototype.removeAlarmMarker = function (id) {
        var marker = this.getMarker(id);
        if (marker) {
            if (this.visibleMarkers) {
                try {
                    this.alarmMarkerGroup.removeLayer(marker);
                }
                catch (e) {
                    // Leaflet and Angular don't play well on route change, so ignore this if we are changing routes
                    if (!this.navigationService.RouteChanging) {
                        console.error(e);
                    }
                }
            }
            var index = this.alarmMarkers.indexOf(marker);
            if (index !== -1) {
                this.alarmMarkers.splice(index, 1);
            }
        }
    };
    AlarmMapService.prototype.anySelectedAlarm = function (alarms) {
        var selected = false;
        for (var alarm in alarms) {
            if (alarms[alarm].Selected) {
                selected = true;
                break;
            }
        }
        return selected;
    };
    AlarmMapService.prototype.getHighestPriority = function (alarms) {
        if (alarms && alarms.length) {
            var highestPriority = alarms.sort(function (a, b) {
                return a.Priority - b.Priority;
            })[0].Priority;
            return (highestPriority === 0 ? 1 : highestPriority);
        }
        return null;
    };
    AlarmMapService.prototype.getHighestPriorityAlarm = function (alarms) {
        if (alarms && alarms.length) {
            return alarms.sort(function (a, b) {
                var res = 0;
                if (a.Priority === b.Priority) {
                    if (a.ReportedTime !== null && b.ReportedTime !== null) {
                        if (a.ReportedTime < b.ReportedTime) {
                            res = 1;
                        }
                        else {
                            res = -1;
                        }
                    }
                    else if (a.ReportedTime === null && b.ReportedTime === null) {
                        res = 0;
                    }
                    else if (a.ReportedTime === null) {
                        res = 1;
                    }
                    else if (b.ReportedTime === null) {
                        res = -1;
                    }
                }
                else if (a.Priority < b.Priority) {
                    return -1;
                }
                else if (a.Priority > b.Priority) {
                    return 1;
                }
                return res;
            })[0];
        }
        return null;
    };
    AlarmMapService.prototype.openOverlappingAlarms = function (groupName, alarms) {
        this.openOverlappingAlarmsSub.next({ groupName: groupName, alarms: alarms });
    };
    AlarmMapService.prototype.refreshOverlappingAlarms = function (groupName) {
        this.refreshOverlappingAlarmsSub.next(groupName);
    };
    AlarmMapService.prototype.closeOverlappingAlarms = function (groupName) {
        this.closeOverlappingAlarmsSub.next(groupName);
    };
    AlarmMapService.prototype.forceCloseOverlappingAlarms = function () {
        this.forceCloseOverlappingAlarmsSub.next();
    };
    AlarmMapService.prototype.fitMarkers = function (alarms) {
        // If only one alarm is selected, pan to it if it is near the current 
        if (alarms.length === 1) {
            if (alarms[0].Position) {
                var groupName = GetAlarmMarkerId(alarms[0]);
                var marker = this.getMarker(groupName);
                if (marker) {
                    if (marker.Number === 1) {
                        var bounds = this.map.getBounds();
                        var pos = marker.getLatLng();
                        if (!bounds.contains(pos) || !this.visibleMarkers) {
                            this.panToAlarmMarker(groupName);
                        }
                    }
                    else if (marker.Number > 1) {
                        this.panToAlarmMarker(groupName);
                    }
                }
            }
        }
        else if (alarms.length > 1) {
            var selectedMarkers = [];
            for (var alarm in alarms) {
                if (alarms[alarm].Position) {
                    var groupName = GetAlarmMarkerId(alarms[alarm]);
                    var marker = this.getMarker(groupName);
                    if (marker) {
                        if (!selectedMarkers.includes(marker)) {
                            selectedMarkers.push(marker);
                        }
                    }
                }
            }
            if (selectedMarkers.length === 1) {
                // Multiple alarms selected, but they are in the same group so just zoom to it
                this.panToAlarmMarker(GetAlarmMarkerId(alarms[0]));
            }
            else {
                if (selectedMarkers.length > 0) {
                    if (!this.visibleMarkers) {
                        this.showAlarmMarkers();
                    }
                    var group = L.featureGroup(selectedMarkers);
                    this.map.fitBounds(group.getBounds().pad(0.3));
                }
            }
        }
    };
    AlarmMapService.prototype.deSelectGroupMarker = function (groupName) {
        this.deSelectGroupSub.next(groupName);
    };
    AlarmMapService.prototype.hideAlarmMarkers = function () {
        if (this.visibleMarkers) {
            try {
                this.alarmMarkerGroup.clearLayers();
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.forceCloseOverlappingAlarms();
            this.visibleMarkers = false;
        }
    };
    AlarmMapService.prototype.showAlarmMarkers = function () {
        if (!this.visibleMarkers) {
            try {
                this.alarmMarkerGroup.addLayers(this.alarmMarkers);
            }
            catch (ex) {
                // Ignore exceptions when removing/adding layers. Leaflet and Marker Cluster throw random exceptions here
                // This is mainly due to using angular components as marker icons
            }
            this.visibleMarkers = true;
        }
    };
    AlarmMapService.prototype.toggleAlarmMarkers = function () {
        if (this.visibleMarkers) {
            this.hideAlarmMarkers();
        }
        else {
            this.showAlarmMarkers();
        }
    };
    AlarmMapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [NavigationService])
    ], AlarmMapService);
    return AlarmMapService;
}(MapService));
export { AlarmMapService };
//# sourceMappingURL=alarmMap.service.js.map