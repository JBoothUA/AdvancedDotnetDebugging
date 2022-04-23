var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { PatrolTemplate, PatrolType } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from './../map/patrols/patrolMap.service';
import { PatrolBuilderService } from "./patrol-builder.service";
import { LocationFilterService } from "../shared/location-filter.service";
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PatrolBuilderStep1 } from './patrol-builder-step1.component';
import { PatrolBuilderStep2 } from './patrol-builder-step2.component';
var PatrolBuilder = /** @class */ (function () {
    function PatrolBuilder(patrolService, patrolBuilderService, patrolMapService, locFilterService) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.patrolMapService = patrolMapService;
        this.locFilterService = locFilterService;
        this.PatrolType = PatrolType;
        this.onHidePatrolBuilder = new EventEmitter();
        this.ngUnsubscribe = new Subject();
        this.step1Completed = false;
    }
    PatrolBuilder.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.patrol) {
            this.patrolInEdit = this.patrolBuilderService.createNewPatrol();
            this.step1Completed = false;
            this.step1ExpandedState = "out";
            this.patrolMapService.clearPatrol();
            this.dialogTitle = "Create New Patrol";
            setTimeout(function () { _this.patrolMapService.setActivePatrol(_this.patrolInEdit); }, 100);
            var mapviewTenants = this.locFilterService.getSelectedTenantLocations('mapview');
            if (mapviewTenants && mapviewTenants.length === 1 && mapviewTenants[0].Locations.length === 1) {
                this.patrolInEdit.TenantId = mapviewTenants[0].Id;
                this.patrolInEdit.LocationId = mapviewTenants[0].Locations[0].Id;
            }
        }
        else {
            this.dialogTitle = "Edit Patrol";
            this.patrolInEdit = new PatrolTemplate(this.patrol);
            if (!this.patrolInEdit.Points)
                this.patrolInEdit.Points = [];
            this.patrolMapService.clearPatrol();
            setTimeout(function () {
                _this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
                _this.patrolMapService.setActivePatrol(_this.patrolInEdit);
            }, 100);
            if (this.patrolBuilderService.isStep1Completed(this.patrolInEdit) === true) {
                this.step1ExpandedState = "in";
                this.step1Completed = true;
                setTimeout(function () {
                    _this.patrolMapService.map.on('moveend', _this.createTooltip, _this);
                    _this.patrolMapService.zoomToPatrolBounds();
                }, 100);
            }
        }
    };
    PatrolBuilder.prototype.ngAfterViewInit = function () {
        //this.saveTenants = this.locFilterService.getSelectedTenantLocations('mapview');
        //if (
    };
    PatrolBuilder.prototype.ngOnDestroy = function () {
        this.locFilterService.unregisterComponent('pbview');
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilder.prototype.hidePatrolBuilder = function () {
        this.patrolMapService.clearPatrol();
        this.onHidePatrolBuilder.emit();
    };
    PatrolBuilder.prototype.handleStep1Completed = function () {
        this.step1Completed = true;
    };
    PatrolBuilder.prototype.createTooltip = function () {
        this.patrolMapService.map.off('moveend', this.createTooltip, this);
        var content;
        content = '<div class="map-tooltip-content">' +
            '<div>To add points to an existing patrol, click</div>' +
            '<div>a line between points. To add a new section</div>' +
            '<div>to your patrol, click the first or last</div>' +
            '<div>point to start drawing.  </div>' +
            '</div>';
        this.patrolMapService.createTooltip(content);
        this.patrolMapService.openTooltip();
    };
    PatrolBuilder.prototype.setStepExpandedState = function (stepIndex, state) {
        if (stepIndex === 1 && state === 'out') {
            this.patrolBuilderStep2.setToggleState('in');
        }
        else if (stepIndex === 2 && state === 'out') {
            this.patrolBuilderStep1.setToggleState('in');
        }
    };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilder.prototype, "onHidePatrolBuilder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolBuilder.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilder.prototype, "pointCount", void 0);
    __decorate([
        ViewChild('patrolBuilderStep1'),
        __metadata("design:type", PatrolBuilderStep1)
    ], PatrolBuilder.prototype, "patrolBuilderStep1", void 0);
    __decorate([
        ViewChild('patrolBuilderStep2'),
        __metadata("design:type", PatrolBuilderStep2)
    ], PatrolBuilder.prototype, "patrolBuilderStep2", void 0);
    PatrolBuilder = __decorate([
        Component({
            selector: 'patrol-builder',
            templateUrl: 'patrol-builder.component.html',
            styleUrls: ['patrol-builder.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            LocationFilterService])
    ], PatrolBuilder);
    return PatrolBuilder;
}());
export { PatrolBuilder };
//# sourceMappingURL=patrol-builder.component.js.map