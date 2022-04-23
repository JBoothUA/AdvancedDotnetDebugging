var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, NgZone, ChangeDetectorRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { PatrolTemplate, PatrolType } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolMapService, PatrolMapInteractMode } from '../map/patrols/patrolMap.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { PatrolBuilderActionsDialog } from './patrol-builder-actionsDialog.component';
import { PatrolBuilderPointItem } from './patrol-builder-pointItem.component';
import { slideDown } from '../shared/animations';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { DragulaService } from 'ng2-dragula';
import { LocationFilterService } from "../shared/location-filter.service";
import { Modal } from '../shared/modal.component';
import { UserService } from '../shared/user.service';
var PatrolBuilderStep2 = /** @class */ (function () {
    function PatrolBuilderStep2(patrolService, patrolBuilderService, patrolMapService, locFilterService, userService, ngzone, changeRef) {
        this.patrolService = patrolService;
        this.patrolBuilderService = patrolBuilderService;
        this.patrolMapService = patrolMapService;
        this.locFilterService = locFilterService;
        this.userService = userService;
        this.ngzone = ngzone;
        this.changeRef = changeRef;
        this.onPatrolBuilderCancelled = new EventEmitter();
        this.onPatrolBuilderSaved = new EventEmitter();
        this.onToggleExpandedGroup = new EventEmitter();
        this.expandCollapseBtnText = 'Expand All';
        this.expandCollapseBtnTooltip = 'Expand All Actions';
        this.ngUnsubscribe = new Subject();
        this.numCheckpoints = 0;
        this.numCheckpointsExpanded = 0;
        this.patrolHasActions = false;
        this.PatrolType = PatrolType;
    }
    PatrolBuilderStep2.prototype.setToggleState = function (state) {
        this.expandedState = state;
        this.changeRef.detectChanges();
    };
    PatrolBuilderStep2.prototype.toggleExpandedGroup = function () {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
        this.onToggleExpandedGroup.next(this.expandedState);
    };
    PatrolBuilderStep2.prototype.ngOnInit = function () {
        var _this = this;
        this.expandedState = this.expandedState || 'out';
        if (this.pointCount === 0) {
            this.patrolMapService.setInteractMode(PatrolMapInteractMode.Append);
        }
        else {
            this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
        }
        this.patrolMapService.finishAddPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrol) { return _this.finishAddPatrol(patrol); }
        });
        this.patrolBuilderService.patrolPointAdded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (temp) { return _this.patrolPointsModified(); }
        });
        this.patrolBuilderService.patrolPointModified
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolPointsModified(); }
        });
        this.patrolBuilderService.patrolPointRemoved
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.patrolPointRemoved(patrolPoint); }
        });
        this.patrolBuilderService.patrolPointEditSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolPoint) { return _this.editPatrolPoint(patrolPoint); }
        });
        this.setCheckpointCnt();
        this.warningIcon = '../../Content/Images/warning.png';
    };
    PatrolBuilderStep2.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolBuilderStep2.prototype.setCheckpointCnt = function () {
        this.numCheckpoints = 0;
        for (var _i = 0, _a = this.patrol.Points; _i < _a.length; _i++) {
            var patrolPoint = _a[_i];
            if (patrolPoint.Actions && patrolPoint.Actions.length > 0) {
                this.numCheckpoints++;
            }
        }
    };
    PatrolBuilderStep2.prototype.setCheckpointExpandedCnt = function (patrolPoint) {
        var _this = this;
        this.numCheckpointsExpanded = 0;
        this.pointItemComps.forEach(function (pointItemComp) {
            if (!patrolPoint || (patrolPoint && pointItemComp.patrolPoint.PointId != patrolPoint.PointId)) {
                if (pointItemComp.expandedState == 'out') {
                    _this.numCheckpointsExpanded++;
                }
            }
        });
    };
    PatrolBuilderStep2.prototype.updateExpandedActionsCnt = function (expandedState) {
        if (expandedState === 'in') {
            this.numCheckpointsExpanded--;
            this.expandCollapseBtnText = 'Expand All';
            this.expandCollapseBtnTooltip = 'Expand All Actions';
        }
        else {
            this.numCheckpointsExpanded++;
            if (this.numCheckpoints === this.numCheckpointsExpanded) {
                this.expandCollapseBtnText = 'Collapse All';
                this.expandCollapseBtnTooltip = 'Collapse All Actions';
            }
        }
        this.changeRef.detectChanges();
    };
    PatrolBuilderStep2.prototype.expandCollapseAllActions = function () {
        if (this.numCheckpoints) {
            var expandedState_1;
            if (this.numCheckpoints == this.numCheckpointsExpanded) {
                expandedState_1 = 'in';
            }
            else {
                expandedState_1 = 'out';
            }
            this.pointItemComps.forEach(function (pointItemComp) {
                if (pointItemComp.patrolPoint.Actions.length > 0) {
                    if (pointItemComp.expandedState !== expandedState_1) {
                        pointItemComp.toggleExpandedGroup();
                    }
                }
            });
            this.changeRef.detectChanges();
        }
    };
    PatrolBuilderStep2.prototype.patrolPointsModified = function () {
        this.pointCount = this.patrol.Points.length;
        this.setCheckpointCnt();
        this.setCheckpointExpandedCnt(null);
        if (this.numCheckpoints && this.numCheckpoints === this.numCheckpointsExpanded) {
            this.expandCollapseBtnText = 'Collapse All';
            this.expandCollapseBtnTooltip = 'Collapse All Actions';
        }
        else {
            this.expandCollapseBtnText = 'Expand All';
            this.expandCollapseBtnTooltip = 'Expand All Actions';
        }
        this.changeRef.detectChanges();
    };
    PatrolBuilderStep2.prototype.patrolPointRemoved = function (patrolPoint) {
        this.pointCount = this.patrol.Points.length;
        this.setCheckpointCnt();
        this.setCheckpointExpandedCnt(patrolPoint);
        if (this.numCheckpoints && this.numCheckpoints === this.numCheckpointsExpanded) {
            this.expandCollapseBtnText = 'Collapse All';
            this.expandCollapseBtnTooltip = 'Collapse All Actions';
        }
        else {
            this.expandCollapseBtnText = 'Expand All';
            this.expandCollapseBtnTooltip = 'Expand All Actions';
        }
        this.changeRef.detectChanges();
    };
    PatrolBuilderStep2.prototype.disableSave = function () {
        if (this.patrol.Points && this.patrol.Points.length > 1) {
            return (false);
        }
        else
            return (true);
    };
    PatrolBuilderStep2.prototype.cancelBuilder = function () {
        this.patrolMapService.clearPatrol();
        this.onPatrolBuilderCancelled.emit(true);
    };
    PatrolBuilderStep2.prototype.savePatrol = function () {
        var temp = this.patrolService.getPatrolTemplate(this.patrol.TemplateId);
        if (!temp || temp.IsPatrolSubmitted === false) {
            //Check to see if the tenant/location for this patrol is being viewed in the map view
            var mvTenants = this.locFilterService.getAllTenantLocations('mapview');
            var patrolTenantId = this.patrol.TenantId;
            var patrolLocationId = this.patrol.LocationId;
            var modified = false;
            if (mvTenants && mvTenants.length > 0) {
                for (var _i = 0, mvTenants_1 = mvTenants; _i < mvTenants_1.length; _i++) {
                    var mvTenant = mvTenants_1[_i];
                    if (mvTenant.Id === patrolTenantId) {
                        if (mvTenant.Selected !== true) {
                            mvTenant.Selected = true;
                            modified = true;
                        }
                        for (var _a = 0, _b = mvTenant.Locations; _a < _b.length; _a++) {
                            var mvLoc = _b[_a];
                            if (mvLoc.Id === patrolLocationId) {
                                if (mvLoc.Selected !== true) {
                                    mvLoc.Selected = true;
                                    modified = true;
                                }
                            }
                        }
                        if (modified) {
                            this.locFilterService.setSelectedTenantLocations('mapview', mvTenants);
                        }
                        break;
                    }
                }
            }
            this.patrol.UserName = this.userService.currentUser.name;
            this.patrolBuilderService.savePatrol(this.patrol);
            if (temp) {
                temp.isPatrolBuilderEdit = true;
            }
            this.patrolMapService.clearPatrol();
            this.onPatrolBuilderSaved.emit(true);
        }
        else {
            this.saveErrorDialog.show();
        }
    };
    PatrolBuilderStep2.prototype.hideErrorDialog = function () {
        this.saveErrorDialog.hide();
    };
    PatrolBuilderStep2.prototype.editPatrolPoint = function (patrolPoint) {
        this.actionsDialog.show(this.patrol, patrolPoint);
        this.patrolMapService.toggleRedraw();
    };
    PatrolBuilderStep2.prototype.finishAddPatrol = function (patrol) {
        var _this = this;
        if (patrol.Points.length > 1) {
            this.patrolMapService.clearPatrol();
            setTimeout(function () {
                _this.patrolMapService.setInteractMode(PatrolMapInteractMode.Edit);
                _this.patrolMapService.setActivePatrol(_this.patrol);
            }, 100);
        }
        else {
            this.patrolMapService.setInteractMode(this.patrolMapService.interactMode);
        }
    };
    __decorate([
        ViewChild(PatrolBuilderActionsDialog),
        __metadata("design:type", PatrolBuilderActionsDialog)
    ], PatrolBuilderStep2.prototype, "actionsDialog", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], PatrolBuilderStep2.prototype, "saveErrorDialog", void 0);
    __decorate([
        ViewChildren(PatrolBuilderPointItem),
        __metadata("design:type", QueryList)
    ], PatrolBuilderStep2.prototype, "pointItemComps", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolBuilderStep2.prototype, "patrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolBuilderStep2.prototype, "expandedState", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolBuilderStep2.prototype, "pointCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolBuilderStep2.prototype, "redraw", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep2.prototype, "onPatrolBuilderCancelled", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep2.prototype, "onPatrolBuilderSaved", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], PatrolBuilderStep2.prototype, "onToggleExpandedGroup", void 0);
    PatrolBuilderStep2 = __decorate([
        Component({
            selector: 'patrol-builder-step2',
            templateUrl: 'patrol-builder-step2.component.html',
            styleUrls: ['patrol-builder-step2.component.css'],
            providers: [DragulaService],
            animations: [
                slideDown
            ],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolBuilderService,
            PatrolMapService,
            LocationFilterService,
            UserService,
            NgZone,
            ChangeDetectorRef])
    ], PatrolBuilderStep2);
    return PatrolBuilderStep2;
}());
export { PatrolBuilderStep2 };
//# sourceMappingURL=patrol-builder-step2.component.js.map