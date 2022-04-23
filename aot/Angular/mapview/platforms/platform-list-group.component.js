var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformSort } from '../../platforms/platform-sort.class';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';
var PlatformListGroup = /** @class */ (function () {
    function PlatformListGroup(platformService, platformSort) {
        this.platformService = platformService;
        this.platformSort = platformSort;
    }
    PlatformListGroup.prototype.ngOnInit = function () {
        this.expandedState = this.expandedState || 'out';
    };
    PlatformListGroup.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    };
    PlatformListGroup.prototype.getPlatforms = function () {
        var platformList = [];
        for (var platform in this.platforms) {
            // If platform is part of this group, include it
            if (this.platformSort.getGroupName(this.platforms[platform], this.groupSelection) === this.groupName) {
                platformList.push(this.platforms[platform]);
            }
        }
        return this.platformSort.sortPlatforms(platformList, this.sortOrder);
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PlatformListGroup.prototype, "platforms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], PlatformListGroup.prototype, "multiSelect", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PlatformListGroup.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PlatformListGroup.prototype, "groupSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PlatformListGroup.prototype, "sortOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PlatformListGroup.prototype, "mapViewOptions", void 0);
    PlatformListGroup = __decorate([
        Component({
            selector: 'platform-list-group',
            templateUrl: 'platform-list-group.component.html',
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService, PlatformSort])
    ], PlatformListGroup);
    return PlatformListGroup;
}());
export { PlatformListGroup };
//# sourceMappingURL=platform-list-group.component.js.map