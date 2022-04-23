var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { AlarmService } from '../alarms/alarm.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformService } from '../platforms/platform.service';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { LeafletMap } from '../map/leaflet-map.component';
import { Modal } from './../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { LocationFilterService } from '../shared/location-filter.service';
import { ConciseRobotMonitor } from '../platforms/concise-robot-monitor.component';
import { ConfirmationDialog } from './../shared/confirmation-dialog.component';
import { AppSettings } from '../shared/app-settings';
import { MapViewOptions } from '../shared/map-view-options.class';
var MapView = /** @class */ (function () {
    function MapView(ngZone, alarmService, platformService, route, changeDetectorRef, patrolService, patrolMapService, alarmMapService, appSettings, locationFilterService, locationMapService, router) {
        this.ngZone = ngZone;
        this.alarmService = alarmService;
        this.platformService = platformService;
        this.route = route;
        this.changeDetectorRef = changeDetectorRef;
        this.patrolService = patrolService;
        this.patrolMapService = patrolMapService;
        this.alarmMapService = alarmMapService;
        this.appSettings = appSettings;
        this.locationFilterService = locationFilterService;
        this.locationMapService = locationMapService;
        this.router = router;
        this.loading = true;
        this.selectAlarmId = null;
        this.locationViewName = 'mapview';
        this.platforms = [];
        this.ngUnsubscribe = new Subject();
        // Restore alarm states
        this.alarmService.restoreMapViewAlarmStates();
        this.options = new MapViewOptions();
        this.options.showAlarmsTab = true;
        this.options.showPlatformsTab = false;
        this.options.showPatrolsTab = false;
        this.options.lastShownTab = 'Alarm';
        //TODO how to localization, angular-translate? resourceModel = Html.Raw(serializer.Serialize(Model["ResourceModel"]));
    }
    MapView.prototype.alarmsTabClicked = function () {
        this.options.showPlatformsTab = false;
        this.options.showPatrolsTab = false;
        this.options.showLeftPanelContent = !this.options.showAlarmsTab;
        this.options.showAlarmsTab = !this.options.showAlarmsTab;
        this.options.lastShownTab = 'Alarm';
        this.ensureMapResizes();
    };
    MapView.prototype.platformsTabClicked = function () {
        this.options.showAlarmsTab = false;
        this.options.showPatrolsTab = false;
        this.options.showLeftPanelContent = !this.options.showPlatformsTab;
        this.options.showPlatformsTab = !this.options.showPlatformsTab;
        this.options.lastShownTab = 'Platform';
        this.ensureMapResizes();
    };
    MapView.prototype.patrolsTabClicked = function () {
        this.options.showAlarmsTab = false;
        this.options.showPlatformsTab = false;
        this.options.showLeftPanelContent = !this.options.showPatrolsTab;
        this.options.showPatrolsTab = !this.options.showPatrolsTab;
        this.options.lastShownTab = 'Patrol';
        this.ensureMapResizes();
    };
    MapView.prototype.ensureMapResizes = function () {
        this.changeDetectorRef.detectChanges();
        $(window).resize();
    };
    MapView.prototype.handleShowPatrolBuilder = function (patrolTemplateId) {
        this.patrol = this.patrolService.getPatrolTemplate(patrolTemplateId);
        //if (this.patrol)
        //	this.patrolMapService.setActivePatrol(this.patrol);
        this.options.showLeftPanel = false;
        this.options.showPatrolBuilder = true;
    };
    MapView.prototype.handleHidePatrolBuilder = function () {
        this.options.showLeftPanel = true;
        this.options.showPatrolBuilder = false;
    };
    MapView.prototype.ngAfterViewInit = function () {
        var _this = this;
        //Bring back concise robot monitor if it was open
        if (this.platformService.robotMonitorPlatformId) {
            var platform = this.platformService.getPlatform(this.platformService.robotMonitorPlatformId);
            this.platformService.robotMonitorPlatformId = null;
            this.platformService.showRobotMonitor(platform);
        }
        this.router.events.takeUntil(this.ngUnsubscribe).subscribe(function (event) {
            if (event instanceof NavigationStart) {
                _this.appSettings.mapViewMapCenter = _this.alarmMapService.map.getCenter();
                _this.appSettings.mapViewMapZoom = _this.alarmMapService.map.getZoom();
                _this.alarmService.persistMapViewAlarmStates();
            }
        });
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (status) {
                if (status) {
                    // After dom is constructed, load the alarms
                    $(function () {
                        if (!_this.alarmService.filterAlarms || _this.alarmService.filterAlarms.length == 0) {
                            _this.applyLocationFilter(_this.locationViewName);
                        }
                        _this.checkRouteParams();
                    });
                }
            }
        });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.changeDetectorRef.markForCheck(); }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.changeDetectorRef.markForCheck(); }
        });
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.changeDetectorRef.markForCheck(); }
        });
        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) { return _this.updatePlatforms(); }
        });
        this.platformService.onNewPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) { return _this.updatePlatforms(); }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) { return _this.updatePlatforms(); }
        });
        this.platformService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) { return _this.changeDetectorRef.markForCheck(); }
        });
        this.platformService.onShowRobotMonitor
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.conciseRobotMonitor.setPlatform(platform);
            }
        });
        this.platformService.onConfirmAbortPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.pendingAbortPatrolPlatform = platform;
                _this.confirmAbort.show();
            }
        });
        this.patrolService.onExecutePatrolError
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (error) {
                _this.executeErrorMessage = error;
                _this.executePatrolError.show();
            }
        });
        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) { return _this.applyLocationFilter(view); }
        });
        this.locationFilterService.onZoomToLocation
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (location) { return _this.handleZoomToMapLocation(location); }
        });
        this.route.params.takeUntil(this.ngUnsubscribe).subscribe(function (params) {
            if (!_this.loading) {
                _this.checkRouteParams();
            }
        });
        this.loading = false;
    };
    MapView.prototype.checkRouteParams = function () {
        var _this = this;
        var tab = this.route.snapshot.data['tab'];
        if (tab) {
            this.options.lastShownTab = tab;
            var id_1 = this.route.snapshot.params['id'];
            // If a tab was specified, swap to it
            if (tab === 'Alarm') {
                this.options.showAlarmsTab = true;
                this.options.showPlatformsTab = false;
                this.options.showPatrolsTab = false;
                if (id_1) {
                    $(function () {
                        _this.alarmService.selectOnlyAlarm(id_1);
                    });
                }
                this.changeDetectorRef.markForCheck();
            }
            else if (tab === 'Platform') {
                this.options.showAlarmsTab = false;
                this.options.showPlatformsTab = true;
                this.options.showPatrolsTab = false;
                if (id_1) {
                    $(function () {
                        _this.platformService.selectPlatform(id_1);
                    });
                }
            }
            else if (tab === 'Patrol') {
                this.options.showAlarmsTab = false;
                this.options.showPlatformsTab = false;
                this.options.showPatrolsTab = true;
                if (id_1) {
                    $(function () {
                        // select patrol
                    });
                }
            }
        }
    };
    MapView.prototype.applyLocationFilter = function (view) {
        if (view === this.locationViewName) {
            var locations = this.locationFilterService.getSelectedLocationIDs(view);
            this.alarmService.setSelectedLocations(locations);
            this.platformService.setSelectedLocations(locations);
            this.alarmService.filterAlarms();
            this.platforms = this.getPlatforms();
            this.changeDetectorRef.markForCheck();
        }
    };
    MapView.prototype.updatePlatforms = function () {
        this.platforms = this.getPlatforms();
    };
    MapView.prototype.getPlatforms = function () {
        return this.platformService.getPlatforms();
    };
    MapView.prototype.getLocations = function () {
        return this.locationFilterService.getSelectedLocations(this.locationViewName);
    };
    MapView.prototype.abortPatrol = function () {
        var patrolInstance = this.patrolService.getPatrolInstanceByPlatformId(this.pendingAbortPatrolPlatform.id);
        this.patrolService.abortPatrol(patrolInstance, (patrolInstance) ? patrolInstance.TemplateId : this.pendingAbortPatrolPlatform.PatrolTemplateSubmittedId, this.pendingAbortPatrolPlatform.id);
        this.pendingAbortPatrolPlatform = null;
    };
    MapView.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    MapView.prototype.handleZoomToMapLocation = function (location) {
        this.Map.zoomToMapLocation(location);
    };
    __decorate([
        ViewChild(ConciseRobotMonitor),
        __metadata("design:type", ConciseRobotMonitor)
    ], MapView.prototype, "conciseRobotMonitor", void 0);
    __decorate([
        ViewChild('map'),
        __metadata("design:type", LeafletMap)
    ], MapView.prototype, "Map", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], MapView.prototype, "executePatrolError", void 0);
    __decorate([
        ViewChild(ConfirmationDialog),
        __metadata("design:type", ConfirmationDialog)
    ], MapView.prototype, "confirmAbort", void 0);
    MapView = __decorate([
        Component({
            selector: 'map-view',
            templateUrl: 'mapview.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [NgZone, AlarmService, PlatformService,
            ActivatedRoute, ChangeDetectorRef, PatrolService,
            PatrolMapService, AlarmMapService, AppSettings,
            LocationFilterService, LocationMapService,
            Router])
    ], MapView);
    return MapView;
}());
export { MapView };
//# sourceMappingURL=mapview.component.js.map