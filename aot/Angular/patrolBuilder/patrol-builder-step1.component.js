var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { PatrolTemplate, PatrolType, AreaType } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { slideDown } from '../shared/animations';
import { LocationFilterService } from '../shared/location-filter.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { MapUtilityService } from '../map/map-utility.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolBuilderStep1 = /** @class */ (function () {
    function PatrolBuilderStep1(patrolService, patrolBuilderService, patrolMapService, alarmMapService, platformMapService, locationMapService, locFilterService, mapUtilityService, changeRef) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.patrolMapService = patrolMapService;
        this.alarmMapService = alarmMapService;
        this.platformMapService = platformMapService;
        this.locationMapService = locationMapService;
        this.locFilterService = locFilterService;
        this.mapUtilityService = mapUtilityService;
        this.changeRef = changeRef;
        this.defaultStepTitle = "Patrol Details";
        this.onStep1Completed = new EventEmitter();
        this.onPatrolBuilderCancelled = new EventEmitter();
        this.onToggleExpandedGroup = new EventEmitter();
        this.PatrolType = PatrolType;
        this.AreaType = AreaType;
        this.ngUnsubscribe = new Subject();
    }
    PatrolBuilderStep1.prototype.setToggleState = function (state) {
        this.expandedState = state;
        this.changeRef.detectChanges();
    };
    PatrolBuilderStep1.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
        this.onToggleExpandedGroup.next(this.expandedState);
    };
    PatrolBuilderStep1.prototype.ngOnInit = function () {
        this.expandedState = this.expandedState || 'out';
        this.showRobotsAlarms = false;
        this.alarmMapService.manualZoomMode = true;
        this.platformMapService.manualZoomMode = true;
        if (this.step1Completed === true) {
            this.isReadOnly = false;
        }
        else {
            this.isReadOnly = false;
        }
    };
    PatrolBuilderStep1.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.platformMapService.hidePlatformMarkers();
        this.alarmMapService.hideAlarmMarkers();
        if (this.patrol.TenantId && this.patrol.LocationId) {
            var mvTenants = this.locFilterService.getAllTenantLocations('mapview');
            var patrolTenantId = this.patrol.TenantId;
            var patrolLocationId = this.patrol.LocationId;
            var found = false;
            if (mvTenants && mvTenants.length > 0) {
                for (var _i = 0, mvTenants_1 = mvTenants; _i < mvTenants_1.length; _i++) {
                    var mvTenant = mvTenants_1[_i];
                    if (mvTenant.Id === patrolTenantId) {
                        for (var _a = 0, _b = mvTenant.Locations; _a < _b.length; _a++) {
                            var mvLoc = _b[_a];
                            if (mvLoc.Id === patrolLocationId) {
                                found = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (found) {
                //				if (mvTenants && mvTenants.length === 1 && mvTenants[0].Locations && mvTenants[0].Locations.length === 1) {
                this.locFilterService.setTenantLocation('pbview', this.patrol.TenantId, this.patrol.LocationId);
                //				}
            }
        }
        // Subscribe to action definition selection events
        this.locFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) {
                _this.locationChanged(view);
            }
        });
    };
    PatrolBuilderStep1.prototype.ngOnDestroy = function () {
        if (this.showRobotsAlarms === false) {
            this.alarmMapService.showAlarmMarkers();
            this.platformMapService.showPlatformMarkers();
            this.showRobotsAlarms = true;
            this.alarmMapService.manualZoomMode = false;
            this.platformMapService.manualZoomMode = false;
        }
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilderStep1.prototype.getStepTitle = function () {
        if (!this.patrol || this.expandedState === 'out' || !this.patrolBuilderService.isStep1Completed(this.patrol))
            return (this.defaultStepTitle);
        else {
            var areaTypeStr = "";
            switch (this.patrol.AreaType) {
                case AreaType.Large:
                    areaTypeStr = "Large Area";
                    break;
                case AreaType.Perimeter:
                    areaTypeStr = "Perimeter";
                    break;
                case AreaType.Small:
                    areaTypeStr = "Small Area";
                    break;
                default:
                    break;
            }
            return (this.patrol.DisplayName + " - " + areaTypeStr);
        }
    };
    PatrolBuilderStep1.prototype.disableNext = function () {
        return (!this.patrolBuilderService.isStep1Completed(this.patrol));
    };
    PatrolBuilderStep1.prototype.gotoStep2 = function () {
        this.toggleExpandedGroup();
        this.onStep1Completed.emit(true);
    };
    PatrolBuilderStep1.prototype.cancelBuilder = function () {
        this.patrolMapService.clearPatrol();
        this.onPatrolBuilderCancelled.emit(true);
    };
    PatrolBuilderStep1.prototype.showRobotsAlarmsChanged = function (event) {
        if (this.showRobotsAlarms === false) {
            this.alarmMapService.showAlarmMarkers();
            this.platformMapService.showPlatformMarkers();
            this.showRobotsAlarms = true;
        }
        else {
            this.alarmMapService.hideAlarmMarkers();
            this.platformMapService.hidePlatformMarkers();
            this.showRobotsAlarms = false;
        }
    };
    PatrolBuilderStep1.prototype.locationChanged = function (view) {
        if (view === 'pbview') {
            var tenant = this.locFilterService.getSelectedTenantLocations(view);
            if (tenant && tenant.length > 0) {
                this.patrol.TenantId = tenant[0].Id;
                this.patrol.LocationId = tenant[0].Locations[0].Id;
                if (tenant[0].Locations[0].MapSettings && tenant[0].Locations[0].MapSettings.MapCenter) {
                    var loc = this.mapUtilityService.convertPositionToLatLng(tenant[0].Locations[0].MapSettings.MapCenter);
                    if (loc) {
                        this.patrolMapService.map.setView(loc, tenant[0].Locations[0].MapSettings.ZoomLevel);
                    }
                }
            }
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolBuilderStep1.prototype, "step1Completed", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolBuilderStep1.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolBuilderStep1.prototype, "expandedState", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep1.prototype, "onStep1Completed", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep1.prototype, "onPatrolBuilderCancelled", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep1.prototype, "onToggleExpandedGroup", void 0);
    PatrolBuilderStep1 = __decorate([
        Component({
            selector: 'patrol-builder-step1',
            templateUrl: 'patrol-builder-step1.component.html',
            styleUrls: ['patrol-builder-step1.component.css'],
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            AlarmMapService,
            PlatformMapService,
            LocationMapService,
            LocationFilterService,
            MapUtilityService,
            ChangeDetectorRef])
    ], PatrolBuilderStep1);
    return PatrolBuilderStep1;
}());
export { PatrolBuilderStep1 };
//# sourceMappingURL=patrol-builder-step1.component.js.map