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
import { LeafletMap } from '../leaflet-map.component';
import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { MapService } from '../map.service';
import { Platform } from '../../platforms/platform.class';
import { PatrolMapService } from '../patrols/patrolMap.service';
import { MapUtilityService } from '../map-utility.service';
import 'rxjs/add/operator/takeUntil';
var RobotMonitorMap = /** @class */ (function (_super) {
    __extends(RobotMonitorMap, _super);
    function RobotMonitorMap() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mapElementId = 'map';
        _this.zoom = 21;
        _this.zoomControl = false;
        _this.scrollWheelZoom = false;
        _this.dragging = false;
        _this.showAttribution = false;
        _this.isMapLocked = false;
        _this.onMapLockedChanged = new EventEmitter();
        _this.firstMove = true;
        return _this;
    }
    RobotMonitorMap.prototype.setIsMapLocked = function (isLocked) {
        this.isMapLocked = isLocked;
        if (!this.robotMap) {
            return;
        }
        if (this.isMapLocked) {
            this.robotMap.dragging.disable();
            this.robotMap.touchZoom.disable();
            this.robotMap.doubleClickZoom.disable();
            this.robotMap.scrollWheelZoom.enable();
            this.robotMap.boxZoom.disable();
            this.robotMap.keyboard.disable();
            if (this.robotMap.tap)
                this.robotMap.tap.disable();
            document.getElementById('map').style.cursor = 'default';
            this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
        }
        else {
            this.robotMap.dragging.enable();
            this.robotMap.touchZoom.enable();
            this.robotMap.doubleClickZoom.disable();
            this.robotMap.scrollWheelZoom.enable();
            this.robotMap.boxZoom.enable();
            this.robotMap.keyboard.enable();
            if (this.robotMap.tap)
                this.robotMap.tap.enable();
            document.getElementById('map').style.cursor = 'grab';
        }
        this.onMapLockedChanged.emit(this.isMapLocked);
    };
    RobotMonitorMap.prototype.onInit = function (map) {
        var _this = this;
        map.on('zoomend', function () {
            if (_this.isMapLocked) {
                _this.panToPlatform();
            }
        });
        this.setIsMapLocked(this.isMapLocked);
    };
    RobotMonitorMap.prototype.panToPlatform = function () {
        this.platformMapService.panTo(this.platformMapService.getMarker(this.getMarkerId()));
    };
    RobotMonitorMap.prototype.setMaps = function (map) {
        var _this = this;
        this.patrolMapService.scaleFactor = .5;
        this.patrolMapService.refreshOptions();
        this.mapService.setMap(map);
        this.platformMapService.setMap(map);
        this.patrolMapService.setMap(map);
        this.robotMap = map;
        this.setIsMapLocked(this.isMapLocked);
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (platform.id === _this.platform.id) {
                    _this.changeDetectorRef.detectChanges();
                }
            }
        });
    };
    RobotMonitorMap.prototype.getCenter = function () {
        if (this.platform) {
            return [this.platform.Position.coordinates[1], this.platform.Position.coordinates[0]];
        }
        else {
            return this.center;
        }
    };
    RobotMonitorMap.prototype.getMarkerId = function () {
        return 'pf-marker-' + this.platform.id;
    };
    RobotMonitorMap.prototype.handleMove = function () {
        if (this.firstMove) {
            this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
            this.firstMove = false;
        }
        if (this.isMapLocked) {
            this.panToPlatform();
        }
    };
    RobotMonitorMap.prototype.ngOnDestroy = function () {
        this.mapService.destroyMap();
        //this.mapService.setMap(null);
        //this.platformMapService.setMap(null);
        //this.patrolMapService.setMap(null);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    RobotMonitorMap.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (changes.isMapLocked) {
            this.setIsMapLocked(this.isMapLocked);
        }
        if (changes.platform) {
            this.platforms = [this.platform];
            setTimeout(function () {
                if (_this.platform && _this.platform.PatrolTemplateSubmittedId) {
                    _this.patrolService.toggleSelectedPatrol(_this.platform.PatrolTemplateSubmittedId, true);
                }
                else {
                    _this.patrolService.toggleSelectedPatrol(null, true);
                }
            });
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], RobotMonitorMap.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], RobotMonitorMap.prototype, "mapElementId", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], RobotMonitorMap.prototype, "zoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotMonitorMap.prototype, "zoomControl", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotMonitorMap.prototype, "scrollWheelZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotMonitorMap.prototype, "dragging", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotMonitorMap.prototype, "showAttribution", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RobotMonitorMap.prototype, "isMapLocked", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], RobotMonitorMap.prototype, "onMapLockedChanged", void 0);
    RobotMonitorMap = __decorate([
        Component({
            selector: 'robot-monitor-map',
            templateUrl: 'robot-monitor-map.component.html',
            styleUrls: ['robot-monitor-map.component.css', '../../shared/video-box.component.css'],
            // Provide MapService and PlatformMapService so that we have a new instance of them
            providers: [MapService, PatrolMapService, MapUtilityService],
            changeDetection: ChangeDetectionStrategy.OnPush
        })
    ], RobotMonitorMap);
    return RobotMonitorMap;
}(LeafletMap));
export { RobotMonitorMap };
//# sourceMappingURL=robot-monitor-map.component.js.map