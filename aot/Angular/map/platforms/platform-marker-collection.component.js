var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../map.service';
import { PlatformMapService } from './platformMap.service';
import { AlarmService } from '../../alarms/alarm.service';
import { MapViewOptions } from '../../shared/map-view-options.class';
var PlatformMarkerCollection = /** @class */ (function () {
    function PlatformMarkerCollection(mapService, platformService, platformMapService, changeDetectorRef, alarmService) {
        var _this = this;
        this.mapService = mapService;
        this.platformService = platformService;
        this.platformMapService = platformMapService;
        this.changeDetectorRef = changeDetectorRef;
        this.alarmService = alarmService;
        this.ngUnsubscribe = new Subject();
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                // When alarm selection changes, update all platform markers so that their z-index is recalculated
                var selPlatform = _this.platformService.getSelectedPlatform();
                if (selPlatform) {
                    _this.platformMapService.refreshMarker(_this.getMarkerId(selPlatform.id));
                }
            }
        });
        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platformId) { return _this.platformSelected(platformId); }
        });
        this.platformMapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (zoom) {
                if (!_this.platformMapService.manualZoomMode) {
                    if (zoom >= 19) {
                        _this.platformMapService.showPlatformMarkers();
                    }
                    else {
                        _this.platformMapService.hidePlatformMarkers();
                    }
                }
            }
        });
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                _this.changeDetectorRef.detectChanges();
            }
        });
    }
    PlatformMarkerCollection.prototype.platformSelected = function (platformId) {
        if (platformId)
            this.platformMapService.panIfOutOfView(this.getMarkerId(platformId));
    };
    PlatformMarkerCollection.prototype.getMarkerId = function (platformId) {
        return platformId + '-marker';
    };
    PlatformMarkerCollection.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PlatformMarkerCollection.prototype, "platforms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PlatformMarkerCollection.prototype, "mapViewOptions", void 0);
    PlatformMarkerCollection = __decorate([
        Component({
            selector: 'platform-marker-collection',
            templateUrl: 'platform-marker-collection.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [MapService, PlatformService, PlatformMapService,
            ChangeDetectorRef, AlarmService])
    ], PlatformMarkerCollection);
    return PlatformMarkerCollection;
}());
export { PlatformMarkerCollection };
//# sourceMappingURL=platform-marker-collection.component.js.map