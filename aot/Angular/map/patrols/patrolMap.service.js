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
import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import { PointStatusValues } from '../../patrols/point.class';
import { MapService } from '../map.service';
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { NavigationService } from '../../shared/navigation.service';
export var PatrolMapInteractMode;
(function (PatrolMapInteractMode) {
    PatrolMapInteractMode[PatrolMapInteractMode["None"] = 0] = "None";
    PatrolMapInteractMode[PatrolMapInteractMode["Append"] = 1] = "Append";
    PatrolMapInteractMode[PatrolMapInteractMode["Prepend"] = 2] = "Prepend";
    PatrolMapInteractMode[PatrolMapInteractMode["Edit"] = 3] = "Edit";
})(PatrolMapInteractMode || (PatrolMapInteractMode = {}));
var PatrolMapService = /** @class */ (function (_super) {
    __extends(PatrolMapService, _super);
    function PatrolMapService(patrolService, patrolBuilderService, ngzone, navigationService) {
        var _this = 
        //Load fake data for now
        _super.call(this, navigationService) || this;
        _this.patrolService = patrolService;
        _this.patrolBuilderService = patrolBuilderService;
        _this.ngzone = ngzone;
        _this.navigationService = navigationService;
        _this.interactMode = PatrolMapInteractMode.None;
        _this.pointCount = 0;
        _this.redraw = false;
        _this.polylineColor = '#0FADDF';
        _this.polylineHighlightColor = '#42f4f4';
        _this.markerOptions = { interactive: false };
        _this.onClick = new Subject;
        _this.patrolPointAdded = new Subject();
        _this.finishAddPatrol = new Subject();
        _this.markerDragged = new Subject();
        _this.activePatrolSet = new Subject();
        _this.activePatrolCleared = new Subject();
        _this.scaleFactor = 1;
        _this.delay = 250;
        _this.prevent = false;
        _this.timer = null;
        _this.ngUnsubscribe = new Subject();
        _this.patrolMarkers = [];
        _this.patrolPolylines = [];
        _this.activePatrol = null;
        _this.pathOptions = { dashArray: (5 * _this.scaleFactor) + ',' + (10 * _this.scaleFactor), color: _this.polylineColor, weight: (5 * _this.scaleFactor), interactive: false };
        _this.reachedPathOptions = { dashArray: null, weight: (5 * _this.scaleFactor), color: '#a7b5b9' };
        _this.notReachedPathOptions = { color: '#a7b5b9' };
        _this.dynamicPathOptions = { color: '#0FADDF', weight: 5, opacity: .5, interactive: false };
        _this.iconOptions = { iconSize: [(40 * _this.scaleFactor), (40 * _this.scaleFactor)], iconAnchor: [(20 * _this.scaleFactor), (20 * _this.scaleFactor)] };
        _this.dynamicLine = [];
        //this.activePatrol = new PatrolTemplate(null);
        //this.activePatrol.Points = [];
        _this.pointCount = 0;
        _this.patrolService.onPatrolSelectionChange
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (patrolTemplateId) { return _this.patrolSelected(patrolTemplateId); }
        });
        _this.patrolService.onNewInstance
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) { return _this.newPatrolInstance(patrolInstance); }
        });
        //this.patrolService.onPatrolInstanceComplete
        //	.takeUntil(this.ngUnsubscribe)
        //	.subscribe({
        //		next: (patrolInstance) => this.patrolInstanceComplete(patrolInstance)
        //	});
        _this.patrolService.onPatrolTemplateDeleted
            .takeUntil(_this.ngUnsubscribe)
            .subscribe({
            next: function (templateId) { return _this.patrolTemplateDeleted(templateId); }
        });
        return _this;
    }
    PatrolMapService.prototype.patrolSelected = function (patrolTemplateId) {
        var _this = this;
        if (!patrolTemplateId) {
            this.clearPatrol();
        }
        else {
            this.setInteractMode(PatrolMapInteractMode.None);
            var patrol = this.patrolService.getPatrolInstance(patrolTemplateId);
            if (!patrol) {
                patrol = this.patrolService.getPatrolTemplate(patrolTemplateId);
            }
            if (patrol) {
                this.setActivePatrol(patrol);
                setTimeout(function () { _this.zoomToPatrolBounds(); }, 100);
            }
        }
    };
    PatrolMapService.prototype.newPatrolInstance = function (patrolInstance) {
        var _this = this;
        if (this.activePatrol && this.activePatrol.TemplateId === patrolInstance.TemplateId &&
            this.interactMode === PatrolMapInteractMode.None) {
            this.clearPatrol();
            setTimeout(function () {
                _this.setActivePatrol(patrolInstance);
            });
        }
    };
    //private patrolInstanceComplete(patrolInstance: PatrolInstance) {
    //if (this.activePatrol && this.activePatrol.id == patrolInstance.id) {
    //	this.clearPatrol();
    //	let patrol = this.patrolService.getPatrolTemplate(patrolInstance.TemplateId);
    //	if (patrol) {
    //		this.setActivePatrol(patrol);
    //	}
    //}
    //}
    PatrolMapService.prototype.patrolTemplateDeleted = function (templateId) {
        if (this.activePatrol && this.activePatrol.id === templateId) {
            this.clearPatrol();
        }
    };
    PatrolMapService.prototype.isPatrolTemplate = function (arg) {
        if (arg && arg.IsTemplate)
            return (arg);
        else
            return (null);
    };
    PatrolMapService.prototype.getActivePatrolPoints = function () {
        if (!this.activePatrol || !this.activePatrol.Points)
            return (null);
        else
            //return this.activePatrol.Points.slice(0);
            return this.activePatrol.Points;
    };
    PatrolMapService.prototype.getActivePatrolPointCount = function () {
        return (this.pointCount);
    };
    PatrolMapService.prototype.setMap = function (map) {
        _super.prototype.setMap.call(this, map);
        if (map) {
            this.patrolGroup = L.featureGroup();
            this.map.addLayer(this.patrolGroup);
        }
        else {
            this.patrolGroup = null;
        }
    };
    PatrolMapService.prototype.setInteractMode = function (mode) {
        if (!this.map) {
            return;
        }
        var container = this.map.getContainer();
        this.interactMode = mode;
        if (mode === PatrolMapInteractMode.Append || mode === PatrolMapInteractMode.Prepend) {
            container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.cur"), auto';
            this.map._container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.png") 6 6, crosshair';
            if (this.activePatrol && this.activePatrol.Points.length === 0) {
                var content = void 0;
                content = '<div class="map-tooltip-content">' +
                    '<div>Click on the map to draw patrol points</div>' +
                    '<div>for the patrol. Double-click on the</div>' +
                    '<div>map or press the escape key to end.</div></div>';
                this.createTooltip(content);
                this.openTooltip();
            }
        }
        else if (mode === PatrolMapInteractMode.Edit) {
            this.map.off('click', this.onMapClick, this);
            this.map.off('mousemove', this.onMapDynamicPoint, this);
            this.map.off('dblclick', this.onMapDblClick, this);
            this.removeDynamics();
            container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.cur"), auto';
            container.style.cursor = 'url("content/images/patrols/map-tool-cursor-md-add.png") 6 6, crosshair';
        }
        else {
            container.style.cursor = '';
        }
        this.setEvents();
    };
    PatrolMapService.prototype.createTooltip = function (content) {
        if (!this.tooltip) {
            var options = { direction: 'right', offset: L.point(30, 25), sticky: true, className: 'map-tooltip' };
            this.tooltip = L.tooltip(options);
            var bounds = this.map.getBounds().pad(0.25); // slightly out of screen 
            var lat = bounds.getNorth();
            var lng = bounds.getCenter().lng;
            this.tooltip.setLatLng(new L.LatLng(lat, lng));
            this.tooltip.setContent(content);
        }
    };
    PatrolMapService.prototype.openTooltip = function () {
        if (this.tooltip) {
            this.map.openTooltip(this.tooltip);
            this.map.on('mousemove', this.updateTooltip, this);
        }
    };
    PatrolMapService.prototype.updateTooltip = function (evt) {
        if (this.tooltip)
            this.tooltip.setLatLng(evt.latlng);
    };
    PatrolMapService.prototype.closeTooltip = function () {
        if (this.tooltip) {
            this.map.off('mousemove', this.updateTooltip);
            this.map.closeTooltip(this.tooltip);
            this.tooltip = null;
        }
    };
    PatrolMapService.prototype.removeDynamics = function () {
        // Remove the dynamic line if needed
        if (this.dynamicLine[0]) {
            this.patrolGroup.removeLayer(this.dynamicLine[0]);
            this.dynamicLine[0] = null;
        }
    };
    //((e: any) => { this.ngzone.run(() => this.appendPointHandler(e)); this.afterAppendPoint(); })
    PatrolMapService.prototype.onMapClick = function (e) {
        var _this = this;
        this.closeTooltip();
        this.timer = setTimeout(function () {
            if (!_this.prevent) {
                if (_this.interactMode === PatrolMapInteractMode.Append) {
                    _this.ngzone.run(function () { return _this.appendPointHandler(e); });
                    _this.afterAppendPoint();
                }
                else if (_this.interactMode === PatrolMapInteractMode.Prepend) {
                    _this.ngzone.run(function () { return _this.prependPointHandler(e); });
                    _this.afterPrependPoint();
                }
            }
            _this.prevent = false;
        }, this.delay);
    };
    PatrolMapService.prototype.onMapDblClick = function (e) {
        this.prevent = true;
        clearTimeout(this.timer);
        this.finishAdd();
    };
    PatrolMapService.prototype.onMapDynamicPoint = function (e) {
        // In case someone has not set the active patrol
        if (!this.activePatrol)
            return;
        // Sets a dynamic polyline from the last point of the patrol to the cursor
        if (this.activePatrol.Points.length > 0) {
            var pts = [];
            if (this.interactMode === PatrolMapInteractMode.Append) {
                var lat = this.activePatrol.Points[this.activePatrol.Points.length - 1].Position.Coordinates[1];
                var lng = this.activePatrol.Points[this.activePatrol.Points.length - 1].Position.Coordinates[0];
                pts[0] = L.latLng([lat, lng]);
            }
            else if (this.interactMode === PatrolMapInteractMode.Prepend) {
                var lat = this.activePatrol.Points[0].Position.Coordinates[1];
                var lng = this.activePatrol.Points[0].Position.Coordinates[0];
                pts[0] = L.latLng([lat, lng]);
            }
            pts[1] = e.latlng;
            if (!this.dynamicLine[0]) {
                this.dynamicLine[0] = L.polyline(pts, this.dynamicPathOptions);
                this.patrolGroup.addLayer(this.dynamicLine[0]);
            }
            else {
                this.dynamicLine[0].setLatLngs(pts);
            }
        }
    };
    PatrolMapService.prototype.onMapMouseOut = function (e) {
        if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
            var polyline = this.dynamicLine[0];
            if (polyline) {
                polyline.setStyle({ opacity: 0 });
            }
        }
        this.map.on('mouseover', this.onMapMouseOver, this);
    };
    PatrolMapService.prototype.onMapMouseOver = function (e) {
        if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
            var polyline = this.dynamicLine[0];
            if (polyline) {
                polyline.setStyle({ opacity: 1 });
            }
        }
        this.map.off('mouseover', this.onMapMouseOver, this);
    };
    PatrolMapService.prototype.onMapKeypress = function (e) {
        if (e.code === 'Escape') {
            this.finishAdd();
        }
    };
    PatrolMapService.prototype.onMarkerClick = function (patrolPoint) {
        var _this = this;
        var patrol = this.activePatrol;
        this.closeTooltip();
        if (patrolPoint.Ordinal === 1 || patrolPoint.Ordinal === patrol.Points.length) {
            var mode_1;
            if (patrolPoint.Ordinal === patrol.Points.length) {
                mode_1 = PatrolMapInteractMode.Append;
            }
            else if (patrolPoint.Ordinal === 1) {
                mode_1 = PatrolMapInteractMode.Prepend;
            }
            this.timer = setTimeout(function () {
                if (!_this.prevent) {
                    var patrol_1 = _this.activePatrol;
                    _this.clearPatrol();
                    setTimeout(function () {
                        _this.setInteractMode(mode_1);
                        _this.setActivePatrol(patrol_1);
                    }, 100);
                }
                _this.prevent = false;
            }, this.delay);
        }
    };
    PatrolMapService.prototype.onMarkerMouseOver = function (event) {
    };
    PatrolMapService.prototype.onMarkerMouseOut = function (event) {
    };
    PatrolMapService.prototype.onMarkerMoveEnd = function (event) {
    };
    PatrolMapService.prototype.onMarkerDrag = function (event) {
        this.closeTooltip();
        this.dynamicMoveMarker(event);
        this.markerDragged.next(event.target);
    };
    PatrolMapService.prototype.onPolylineMouseOut = function (e) {
        var polyline = e.target;
        polyline.setStyle({ color: this.polylineColor });
        this.map.closeTooltip();
    };
    PatrolMapService.prototype.onPolylineMouseOver = function (e) {
        var polyline = e.target;
        polyline.setStyle({ color: this.polylineHighlightColor });
    };
    PatrolMapService.prototype.onPolylineClick = function (e) {
        this.closeTooltip();
        var patrolPoint = e.target.StartMarker.Data;
        this.patrolBuilderService.insertPatrolPointAfter(this.getActivePatrolTemplate(), patrolPoint, e.latlng.lat, e.latlng.lng);
    };
    PatrolMapService.prototype.appendPointToActivePatrol = function (lat, lng) {
        this.patrolBuilderService.appendPatrolPoint(this.activeTemplate, lat, lng);
        this.pointCount = this.activePatrol.Points.length;
        return true;
    };
    PatrolMapService.prototype.prependPointToActivePatrol = function (lat, lng) {
        this.patrolBuilderService.prependPatrolPoint(this.activeTemplate, lat, lng);
        this.pointCount = this.activePatrol.Points.length;
        return true;
    };
    PatrolMapService.prototype.setMapEvents = function () {
        if (!this.map) {
            return;
        }
        if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
            this.map.on('click', this.onMapClick, this);
            this.map.on('mousemove', this.onMapDynamicPoint, this);
            this.map.on('dblclick', this.onMapDblClick, this);
            this.map.on('mouseout', this.onMapMouseOut, this);
            this.keyPressFunc = this.onMapKeypress.bind(this);
            document.addEventListener('keydown', this.keyPressFunc, true);
        }
        else {
            this.map.off('click', this.onMapClick, this);
            this.map.off('mousemove', this.onMapDynamicPoint, this);
            this.map.off('dblclick', this.onMapDblClick, this);
            this.map.off('mouseout', this.onMapMouseOut, this);
            if (this.keyPressFunc) {
                document.removeEventListener('keydown', this.keyPressFunc, true);
                this.keyPressFunc = null;
            }
        }
    };
    PatrolMapService.prototype.setEvents = function () {
        this.setMapEvents();
        if (Object.keys(this.patrolMarkers).length > 0) {
            for (var _i = 0, _a = this.patrolMarkers; _i < _a.length; _i++) {
                var marker = _a[_i];
                this.setMarkerEvents(marker);
            }
        }
        if (Object.keys(this.patrolPolylines).length > 0) {
            for (var _b = 0, _c = this.patrolPolylines; _b < _c.length; _b++) {
                var polyline = _c[_b];
                this.setPolylineEvents(polyline);
            }
        }
    };
    PatrolMapService.prototype.setMarkerEvents = function (marker) {
        if (this.interactMode === PatrolMapInteractMode.Edit) {
            marker.off();
            //			marker.on('click', this.onMarkerClick, this);
            //			marker.on('dblClick', this.onMarkerDblClick, this);
            marker.on('mouseover', this.onMarkerMouseOver, this);
            marker.on('mouseout', this.onMarkerMouseOut, this);
            marker.on('drag', this.onMarkerDrag, this);
            marker.on('moveend', this.onMarkerMoveEnd, this);
        }
        else if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
            marker.off();
        }
        else if (this.interactMode === PatrolMapInteractMode.None) {
            marker.off();
        }
    };
    PatrolMapService.prototype.setPolylineEvents = function (polyline) {
        if (this.interactMode === PatrolMapInteractMode.Edit) {
            polyline.on('click', this.onPolylineClick, this);
            polyline.on('mouseover', this.onPolylineMouseOver, this);
            polyline.on('mouseout', this.onPolylineMouseOut, this);
        }
        else if (this.interactMode === PatrolMapInteractMode.Append || this.interactMode === PatrolMapInteractMode.Prepend) {
            polyline.off('click', this.onPolylineClick, this);
            polyline.off('mouseover', this.onPolylineMouseOver, this);
            polyline.off('mouseout', this.onPolylineMouseOut, this);
        }
        else if (this.interactMode === PatrolMapInteractMode.None) {
            polyline.off('click', this.onPolylineClick, this);
            polyline.off('mouseover', this.onPolylineMouseOver, this);
            polyline.off('mouseout', this.onPolylineMouseOut, this);
        }
    };
    PatrolMapService.prototype.mapClicked = function (e) {
        this.onClick.next(e);
    };
    PatrolMapService.prototype.appendPointHandler = function (e) {
        this.appendPointToActivePatrol(e.latlng.lat, e.latlng.lng);
    };
    PatrolMapService.prototype.afterAppendPoint = function () {
    };
    PatrolMapService.prototype.prependPointHandler = function (e) {
        this.prependPointToActivePatrol(e.latlng.lat, e.latlng.lng);
    };
    PatrolMapService.prototype.afterPrependPoint = function () {
    };
    PatrolMapService.prototype.dynamicMoveMarker = function (e) {
        // In case someone has not set the active patrol
        if (!this.activePatrol || Object.keys(this.patrolPolylines).length === 0)
            return;
        var marker = e.target;
        var index = marker.Number;
        var patrolPoint = marker.Data;
        // Sets a dynamic polyline from the last point of the patrol to the cursor
        var pts = [];
        if (Object.keys(this.patrolPolylines).length >= index) {
            var polylineAfter = this.patrolPolylines[patrolPoint.PointId];
            pts = polylineAfter.getLatLngs();
            pts[0] = e.latlng;
            polylineAfter.setLatLngs(pts);
        }
        if (index > 1) {
            patrolPoint = this.activePatrol.Points[index - 2];
            var polylineBefore = this.patrolPolylines[patrolPoint.PointId];
            pts = polylineBefore.getLatLngs();
            pts[1] = e.latlng;
            polylineBefore.setLatLngs(pts);
        }
        this.activePatrol.Points[index - 1].Position.Coordinates = [e.latlng.lng, e.latlng.lat];
    };
    PatrolMapService.prototype.finishAdd = function () {
        this.finishAddPatrol.next(this.activeTemplate);
    };
    PatrolMapService.prototype.addPatrolPointToMap = function (patrolPoint) {
        // Use SmartCommandMarker that pulls angular component from dom to use as marker
        var id = patrolPoint.PointId;
        this.iconOptions.targetId = id;
        var icon = new L.SmartCommandIcon(this.iconOptions);
        this.markerOptions.icon = icon;
        this.markerOptions.interactive = (this.interactMode == PatrolMapInteractMode.Edit);
        this.markerOptions.draggable = (this.interactMode == PatrolMapInteractMode.Edit);
        var marker = new L.SmartCommandMarker(new L.LatLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]), this.markerOptions);
        marker.Number = patrolPoint.Ordinal;
        marker.Data = patrolPoint;
        marker.Type = L.ScMarkerTypes.Patrol;
        marker.Selected = false;
        this.patrolGroup.addLayer(marker);
        this.patrolMarkers[patrolPoint.PointId] = marker;
        this.setMarkerEvents(marker);
        if (!patrolPoint.IsInserted) {
            this.addPatrolPolylineToMap(marker, patrolPoint);
        }
        else {
            this.insertPatrolPolylineOnMap(marker, patrolPoint);
        }
        this.patrolPointAdded.next(patrolPoint);
    };
    PatrolMapService.prototype.addPatrolPolylineToMap = function (marker, patrolPoint) {
        var prepend = false;
        var prevPoint;
        var startMarker;
        var endMarker;
        // Check if we are prepending the point/marker to the beginning of the patrol.
        if (Object.keys(this.patrolMarkers).length > 1) {
            if (marker.Number === 1) {
                prepend = true;
                prevPoint = this.activePatrol.Points[1];
                startMarker = marker;
                endMarker = this.patrolMarkers[prevPoint.PointId];
            }
            else {
                prevPoint = this.activePatrol.Points[patrolPoint.Ordinal - 2];
                startMarker = this.patrolMarkers[prevPoint.PointId];
                endMarker = marker;
            }
            if (prevPoint) {
                var pts = [];
                if (prepend) {
                    pts[0] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
                    pts[1] = L.latLng(prevPoint.Position.Coordinates[1], prevPoint.Position.Coordinates[0]);
                }
                else {
                    pts[0] = L.latLng(prevPoint.Position.Coordinates[1], prevPoint.Position.Coordinates[0]);
                    pts[1] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
                }
                var pathOp = this.getPathOptions(endMarker);
                pathOp.interactive = (this.interactMode === PatrolMapInteractMode.Edit);
                var tmpline = new L.SmartCommandPolyline(pts, pathOp);
                tmpline.StartMarker = startMarker;
                tmpline.EndMarker = endMarker;
                this.patrolPolylines[startMarker.Data.PointId] = tmpline;
                startMarker.PatrolPolyline = tmpline;
                this.patrolGroup.addLayer(tmpline);
                this.setPolylineEvents(tmpline);
            }
        }
    };
    PatrolMapService.prototype.insertPatrolPolylineOnMap = function (marker, patrolPoint) {
        patrolPoint.IsInserted = false;
        var prevPoint = this.activePatrol.Points[patrolPoint.Ordinal - 2];
        var prevPolyline = this.patrolPolylines[prevPoint.PointId];
        var prevEndMarker = prevPolyline.EndMarker;
        var pts = prevPolyline.getLatLngs();
        var endPt = pts[1];
        pts[1] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
        prevPolyline.setLatLngs(pts);
        prevPolyline.EndMarker = marker;
        pts[0] = L.latLng(patrolPoint.Position.Coordinates[1], patrolPoint.Position.Coordinates[0]);
        pts[1] = L.latLng(endPt.lat, endPt.lng);
        this.pathOptions.interactive = (this.interactMode === PatrolMapInteractMode.Edit);
        var tmpline = new L.SmartCommandPolyline(pts, this.pathOptions);
        tmpline.StartMarker = marker;
        tmpline.EndMarker = prevEndMarker;
        this.patrolPolylines[marker.Data.PointId] = tmpline;
        marker.PatrolPolyline = tmpline;
        this.patrolGroup.addLayer(tmpline);
        this.setPolylineEvents(tmpline);
    };
    PatrolMapService.prototype.getPathOptions = function (endMarker) {
        if (this.interactMode === PatrolMapInteractMode.Edit ||
            this.interactMode === PatrolMapInteractMode.Append ||
            this.interactMode === PatrolMapInteractMode.Prepend) {
            return (this.pathOptions);
        }
        else if (this.interactMode === PatrolMapInteractMode.None) {
            if (endMarker.Data.CurrentStatus === PointStatusValues.NotReached) {
                return (this.notReachedPathOptions);
            }
            else if (endMarker.Data.CurrentStatus === PointStatusValues.Reached) {
                return (this.reachedPathOptions);
            }
            else {
                return (this.pathOptions);
            }
        }
    };
    PatrolMapService.prototype.removePatrolPointFromMap = function (patrolPoint) {
        var marker = this.patrolMarkers[patrolPoint.PointId];
        var polyline = marker.PatrolPolyline;
        // If we are not just clearing the patrol, deal with the polylines.
        if (this.activePatrol) {
            var endMarker = void 0;
            var endPt = void 0;
            var prevPoint = void 0;
            var prevPolyline = void 0;
            var prevMarker = void 0;
            if (patrolPoint.Ordinal > 1) {
                prevPoint = this.activePatrol.Points[patrolPoint.Ordinal - 2];
                prevPolyline = this.patrolPolylines[prevPoint.PointId];
                prevMarker = this.patrolMarkers[prevPoint.PointId];
            }
            if (polyline) {
                var pts = polyline.getLatLngs();
                endPt = L.latLng(pts[1].lat, pts[1].lng);
                endMarker = polyline.EndMarker;
            }
            if (prevPolyline) {
                if (polyline) {
                    var pts = prevPolyline.getLatLngs();
                    pts[1] = endPt;
                    prevPolyline.setLatLngs(pts);
                    prevPolyline.EndMarker = endMarker;
                }
                else {
                    this.patrolGroup.removeLayer(prevPolyline);
                    delete this.patrolPolylines[marker.Data.PointId];
                    prevMarker.PatrolPolyline = null;
                }
            }
        }
        if (polyline) {
            this.patrolGroup.removeLayer(polyline);
            delete this.patrolPolylines[marker.Data.PointId];
        }
        this.patrolGroup.removeLayer(marker);
        delete this.patrolMarkers[patrolPoint.PointId];
        this.pointCount--;
    };
    PatrolMapService.prototype.getPatrolMarker = function (pointId) {
        if (this.patrolMarkers) {
            return this.patrolMarkers[pointId];
        }
    };
    PatrolMapService.prototype.clearPatrol = function () {
        if (this.map) {
            this.setInteractMode(PatrolMapInteractMode.None);
            this.closeTooltip();
            this.removeDynamics();
            // Reset the cursor
            this.map.getContainer().style.cursor = '';
        }
        this.activePatrol = null;
        this.activePatrolCleared.next();
    };
    PatrolMapService.prototype.setActivePatrol = function (patrol) {
        if (!patrol) {
            return;
        }
        if (patrol.IsTemplate)
            this.activeTemplate = patrol;
        else
            this.activeInstance = patrol;
        this.activePatrol = patrol;
        if (!this.activePatrol.Points)
            this.activePatrol.Points = [];
        this.pointCount = this.activePatrol.Points.length;
        this.activePatrolSet.next(this.activePatrol);
    };
    PatrolMapService.prototype.getActivePatrol = function () {
        return (this.activePatrol);
    };
    PatrolMapService.prototype.getActivePatrolTemplate = function () {
        return (this.activeTemplate);
    };
    PatrolMapService.prototype.getPatrolMarkerSrc = function (patrolPoint, patrol) {
        if (patrolPoint.Ordinal === 1)
            return ('../../Content/Images/Patrols/first-point.png');
        else if (patrolPoint.Ordinal > 1 && (patrolPoint.Actions && patrolPoint.Actions.length > 0))
            return ('../../Content/Images/Patrols/checkpoint-icon.png');
        else if (patrolPoint.Ordinal > 1 && patrolPoint.Ordinal === patrol.Points.length)
            return ('../../Content/Images/Patrols/last-point.png');
        else
            return ('../../Content/Images/Patrols/patrol-point.png');
    };
    PatrolMapService.prototype.toggleRedraw = function () {
        this.redraw = !this.redraw;
        return (this.redraw);
    };
    PatrolMapService.prototype.zoomToPatrolBounds = function () {
        if (this.map) {
            var fitBoundsOptions = { padding: [5, 5] };
            var pts = [];
            for (var _i = 0, _a = this.activePatrol.Points; _i < _a.length; _i++) {
                var point = _a[_i];
                pts.push(L.latLng(point.Position.Coordinates[1], point.Position.Coordinates[0]));
            }
            if (pts.length > 1) {
                this.map.fitBounds(L.latLngBounds(pts).pad(0.3));
            }
        }
    };
    PatrolMapService.prototype.refreshOptions = function () {
        this.pathOptions = { dashArray: (5 * this.scaleFactor) + ',' + (10 * this.scaleFactor), color: this.polylineColor, weight: (5 * this.scaleFactor), interactive: false };
        this.iconOptions = { iconSize: [(40 * this.scaleFactor), (40 * this.scaleFactor)], iconAnchor: [(20 * this.scaleFactor), (20 * this.scaleFactor)] };
        this.reachedPathOptions = { dashArray: null, weight: (5 * this.scaleFactor), color: '#a7b5b9' };
    };
    PatrolMapService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            NgZone,
            NavigationService])
    ], PatrolMapService);
    return PatrolMapService;
}(MapService));
export { PatrolMapService };
//# sourceMappingURL=patrolMap.service.js.map