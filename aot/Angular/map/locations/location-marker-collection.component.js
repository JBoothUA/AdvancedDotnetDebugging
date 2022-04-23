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
import { LocationMapService } from './locationMap.service';
import { LocationFilterService } from '../../shared/location-filter.service';
var LocationMarkerCollection = /** @class */ (function () {
    function LocationMarkerCollection(mapService, locationService, changeDetectorRef) {
        this.mapService = mapService;
        this.locationService = locationService;
        this.changeDetectorRef = changeDetectorRef;
        this.locationFilterChanged = false;
        this.ngUnsubscribe = new Subject();
    }
    LocationMarkerCollection.prototype.ngOnInit = function () {
        var _this = this;
        this.mapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (zoom) {
                if (zoom >= 10) {
                    _this.mapService.hideLocationMarkers();
                }
                else {
                    _this.mapService.showLocationMarkers();
                }
            }
        });
    };
    LocationMarkerCollection.prototype.ngAfterViewInit = function () {
        if (this.mapService.getMapZoom() >= 10) {
            this.mapService.hideLocationMarkers();
        }
    };
    LocationMarkerCollection.prototype.ngOnChanges = function (changes) {
        var _this = this;
        if (changes.locations && this.locationFilterChanged) {
            // Allow time for the markers to be added/removed before fitting them
            setTimeout(function () { _this.mapService.fitMarkers(); }, 200);
        }
    };
    LocationMarkerCollection.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], LocationMarkerCollection.prototype, "locations", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationMarkerCollection.prototype, "locationFilterChanged", void 0);
    LocationMarkerCollection = __decorate([
        Component({
            selector: 'location-marker-collection',
            templateUrl: 'location-marker-collection.component.html',
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [LocationMapService, LocationFilterService,
            ChangeDetectorRef])
    ], LocationMarkerCollection);
    return LocationMarkerCollection;
}());
export { LocationMarkerCollection };
//# sourceMappingURL=location-marker-collection.component.js.map