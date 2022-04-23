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
import { PatrolService } from './patrol.service';
import { PatrolType, AreaType } from './patrol.class';
import { LocationFilterService } from './../shared/location-filter.service';
var PatrolSortService = /** @class */ (function () {
    function PatrolSortService(patrolService, locationFilterService) {
        this.patrolService = patrolService;
        this.locationFilterService = locationFilterService;
    }
    PatrolSortService.prototype.getGroupList = function (patrolTemplates, groupSelection, sortOrder) {
        var groupList = [];
        for (var patrol in patrolTemplates) {
            var groupName = this.getGroupName(patrolTemplates[patrol], this.patrolService.getPatrolInstance(patrolTemplates[patrol].TemplateId), groupSelection);
            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }
        if (groupSelection === 'Status') {
            this.genericSort(groupList, (sortOrder === 'asc') ? 'desc' : 'asc');
        }
        else {
            this.genericSort(groupList, sortOrder);
        }
        return groupList;
    };
    PatrolSortService.prototype.getGroupName = function (patrolTemplate, patrolInstance, groupSelection) {
        var groupName;
        switch (groupSelection) {
            case 'Status':
                if (patrolInstance || patrolTemplate.IsPatrolSubmitted) {
                    groupName = 'On Patrol';
                }
                else {
                    groupName = 'Available';
                }
                break;
            case 'PatrolArea':
                switch (patrolTemplate.AreaType) {
                    case AreaType.Large:
                        groupName = 'Large Area';
                        break;
                    case AreaType.Small:
                        groupName = 'Small Area';
                        break;
                    case AreaType.Perimeter:
                        groupName = 'Perimeter';
                        break;
                }
                break;
            case 'PatrolType':
                switch (patrolTemplate.Type) {
                    case PatrolType.Air:
                        groupName = 'Air';
                        break;
                    case PatrolType.Ground:
                        groupName = 'Ground';
                        break;
                }
                break;
            case 'PatrolName':
                groupName = 'Patrol Name';
                break;
            case 'Location':
                var loc = this.locationFilterService.getLocation('mapview', patrolTemplate.TenantId, patrolTemplate.LocationId);
                if (!loc) {
                    groupName = 'Unknown';
                }
                else {
                    groupName = loc.Name;
                }
                break;
            default:
                groupName = 'None';
        }
        return groupName;
    };
    PatrolSortService.prototype.genericSort = function (list, sortOrder) {
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
    PatrolSortService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [PatrolService,
            LocationFilterService])
    ], PatrolSortService);
    return PatrolSortService;
}());
export { PatrolSortService };
//# sourceMappingURL=patrol-sort.service.js.map