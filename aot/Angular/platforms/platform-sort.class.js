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
import { PlatformService } from './platform.service';
import { LocationFilterService } from './../shared/location-filter.service';
var PlatformSort = /** @class */ (function () {
    function PlatformSort(platformService, locationFilterService) {
        this.platformService = platformService;
        this.locationFilterService = locationFilterService;
    }
    PlatformSort.prototype.getGroupList = function (platforms, groupSelection, sortOrder) {
        var groupList = [];
        for (var platform in platforms) {
            var groupName = this.getGroupName(platforms[platform], groupSelection);
            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }
        // Sort based upon group selection
        this.genericSort(groupList, sortOrder);
        return groupList;
    };
    PlatformSort.prototype.getGroupName = function (platform, groupSelection) {
        var groupName;
        switch (groupSelection) {
            case 'State':
                var stateText = this.platformService.getAvailableText(platform);
                stateText = (stateText !== '') ? stateText : 'Heathly';
                if (platform[groupSelection]) {
                    groupName = stateText;
                }
                else {
                    groupName = 'Unknown';
                }
                break;
            case 'Manufacturer':
                if (platform[groupSelection]) {
                    groupName = this.platformService.getPlatformManufacturerName(platform);
                    if (groupName === 'gamma2') {
                        groupName = 'Gamma 2';
                    }
                }
                else {
                    groupName = 'Unknown';
                }
                break;
            case 'RobotName':
                groupName = 'Robot Name';
                break;
            case 'Location':
                var loc = this.locationFilterService.getLocation('mapview', platform.TenantId, platform.LocationId);
                if (!loc) {
                    groupName = 'Unknown';
                }
                else {
                    groupName = loc.Name;
                }
                break;
            default:
                if (platform[groupSelection]) {
                    groupName = platform[groupSelection];
                }
                else {
                    groupName = 'None';
                }
        }
        return groupName;
    };
    PlatformSort.prototype.genericSort = function (list, sortOrder) {
        list.sort(function (a, b) {
            var groupA = a.toLowerCase(); // ignore upper and lowercase
            var groupB = b.toLowerCase(); // ignore upper and lowercase
            var res = 0;
            if (groupA < groupB) {
                res = 1;
            }
            if (groupA > groupB) {
                res = -1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            // names must be equal
            return res;
        });
    };
    PlatformSort.prototype.sortPlatforms = function (platforms, sortOrder) {
        platforms.sort(function (a, b) {
            var res = 0;
            if (a.DisplayName < b.DisplayName) {
                res = 1;
            }
            else if (a.DisplayName > b.DisplayName) {
                res = -1;
            }
            else {
                res = 1;
            }
            if (sortOrder === 'asc') {
                res = res * -1;
            }
            return res;
        });
        return platforms;
    };
    PlatformSort = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [PlatformService,
            LocationFilterService])
    ], PlatformSort);
    return PlatformSort;
}());
export { PlatformSort };
//# sourceMappingURL=platform-sort.class.js.map