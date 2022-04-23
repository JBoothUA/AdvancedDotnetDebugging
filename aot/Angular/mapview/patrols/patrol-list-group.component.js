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
import { PatrolService } from '../../patrols/patrol.service';
import { PatrolSortService } from '../../patrols/patrol-sort.service';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';
var PatrolListGroup = /** @class */ (function () {
    function PatrolListGroup(patrolService, patrolSort) {
        this.patrolService = patrolService;
        this.patrolSort = patrolSort;
    }
    PatrolListGroup.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    };
    PatrolListGroup.prototype.getPatrols = function () {
        var patrolTemplateList = [];
        for (var patrol in this.patrolTemplates) {
            if (this.patrolSort.getGroupName(this.patrolTemplates[patrol], this.getPatrolInstance(this.patrolTemplates[patrol]), this.groupSelection) === this.groupName) {
                patrolTemplateList.push(this.patrolTemplates[patrol]);
            }
        }
        this.patrolTemplates = patrolTemplateList;
        if (this.sortOrder === 'asc') {
            return patrolTemplateList.sort(this.patrolService.sortbyDisplayNameAscFunc);
        }
        else {
            return patrolTemplateList.sort(this.patrolService.sortbyDisplayNameDescFunc);
        }
    };
    PatrolListGroup.prototype.getPatrolInstance = function (patrolTemplate) {
        for (var patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].TemplateId === patrolTemplate.TemplateId) {
                return this.patrolInstances[patrol];
            }
        }
        return null;
    };
    PatrolListGroup.prototype.trackByPatrolFn = function (index, patrolTemplate) {
        return patrolTemplate.id;
    };
    PatrolListGroup.prototype.ngOnInit = function () {
        this.expandedState = this.expandedState || 'out';
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolListGroup.prototype, "patrolTemplates", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolListGroup.prototype, "patrolInstances", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolListGroup.prototype, "groupName", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolListGroup.prototype, "groupSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolListGroup.prototype, "sortOrder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PatrolListGroup.prototype, "mapViewOptions", void 0);
    PatrolListGroup = __decorate([
        Component({
            selector: 'patrol-list-group',
            templateUrl: 'patrol-list-group.component.html',
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService, PatrolSortService])
    ], PatrolListGroup);
    return PatrolListGroup;
}());
export { PatrolListGroup };
//# sourceMappingURL=patrol-list-group.component.js.map