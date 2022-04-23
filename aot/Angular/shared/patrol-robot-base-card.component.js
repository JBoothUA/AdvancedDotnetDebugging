var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { PatrolTemplate, PatrolInstance } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PlatformService } from './../platforms/platform.service';
import { Platform, PlatformMode } from './../platforms/platform.class';
import { slideDown } from './../shared/animations';
import { LocationFilterService } from '../shared/location-filter.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { PatrolStatusValues } from '../patrols/patrol.class';
import { ChooserStatus } from './../shared/chooser-status.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolRobotBaseCard = /** @class */ (function () {
    function PatrolRobotBaseCard(patrolService, platformService, locationFilterService, mapService, ref) {
        this.patrolService = patrolService;
        this.platformService = platformService;
        this.locationFilterService = locationFilterService;
        this.mapService = mapService;
        this.ref = ref;
        this.actionMenuOpen = false;
        this.onExpandExpandedView = new EventEmitter();
        this.onExpandedViewHidden = new EventEmitter();
        this.PatrolStatusValues = PatrolStatusValues;
        this.chooserOpen = false;
        this.timer = null;
        this.blockSingleClick = false;
        this.ngUnsubscribe = new Subject();
        this.nextRunTimer = null;
    }
    PatrolRobotBaseCard.prototype.getPatrolCompleteness = function () {
        if (this.patrolService.getPatrolStatusClass(this.patrolTemplate, this.patrolInstance) === 'availableStatus')
            return 0.0;
        return this.patrolService.getPatrolCompleteness(this.patrolInstance);
    };
    PatrolRobotBaseCard.prototype.blockSelection = function (event) {
        event.stopPropagation();
    };
    PatrolRobotBaseCard.prototype.getPatrolcompletenessText = function () {
        return (Math.round(this.getPatrolCompleteness() * 100).toString());
    };
    //Need to output event
    //Need to handle platform toggle
    PatrolRobotBaseCard.prototype.toggleExpandedView = function () {
        event.stopPropagation();
        if (this.patrolTemplate) {
            if (this.patrolTemplate.expanded) {
                this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, false);
            }
            else {
                this.patrolService.toggleExpandedPatrol(this.patrolTemplate.TemplateId, true);
                this.onExpandExpandedView.emit(this.patrolTemplate);
            }
        }
        else if (this.platform) {
            if (this.platform.Expanded) {
                this.platformService.setExpandedItem(null);
            }
            else {
                this.platformService.setExpandedItem(this.platform.id);
            }
        }
        if (this.expanded) {
            this.onExpandedViewHidden.emit();
        }
    };
    PatrolRobotBaseCard.prototype.handleClick = function (event) {
        var _this = this;
        if (this.chooserOpen) {
            this.chooserOpen = false;
            return;
        }
        if (this.actionMenuOpen) {
            this.actionMenuOpen = false;
            return;
        }
        this.timer = setTimeout(function () {
            if (!_this.blockSingleClick) {
                if (_this.patrolTemplate) {
                    if (_this.patrolTemplate.selected) {
                        _this.patrolService.toggleSelectedPatrol(_this.patrolTemplate.TemplateId, false);
                    }
                    else {
                        _this.patrolService.toggleSelectedPatrol(_this.patrolTemplate.TemplateId, true);
                    }
                }
                else {
                    _this.platformService.handleClick(_this.platform);
                }
                _this.ref.markForCheck();
            }
            _this.blockSingleClick = false;
        }, 200);
    };
    PatrolRobotBaseCard.prototype.ngOnChanges = function () {
        if (!this.expanded) {
            this.onExpandedViewHidden.emit();
        }
    };
    PatrolRobotBaseCard.prototype.ngOnInit = function () {
        var _this = this;
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) {
                if (_this.platform && platform.id === _this.platform.id) {
                    try {
                        _this.ref.markForCheck();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
            }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                if ((_this.patrolTemplate && patrolInstance.TemplateId === _this.patrolTemplate.id) ||
                    (_this.patrolInstance && patrolInstance.TemplateId === _this.patrolInstance.TemplateId)) {
                    _this.chooserStatus.reset();
                    try {
                        _this.ref.markForCheck();
                    }
                    catch (e) {
                        console.warn(e);
                    }
                }
            }
        });
    };
    PatrolRobotBaseCard.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PatrolRobotBaseCard.prototype.handleDblClick = function (event) {
        if (this.chooserOpen) {
            this.chooserOpen = false;
            return;
        }
        if (this.actionMenuOpen) {
            this.actionMenuOpen = false;
            return;
        }
        clearTimeout(this.timer);
        this.blockSingleClick = true;
        if (!this.patrolTemplate) {
            this.platformService.selectOnlyPlatform(this.platform.id);
            this.mapService.zoomToPlatformMarker(this.platform.id + '-marker');
        }
        else if (this.patrolTemplate) {
            if (this.patrolTemplate.selected) {
                this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, false);
            }
            else {
                this.patrolService.toggleSelectedPatrol(this.patrolTemplate.TemplateId, true);
            }
        }
    };
    PatrolRobotBaseCard.prototype.openActionMenu = function (event) {
        event.preventDefault();
        if (this.patrolTemplate) {
            this.patrolService.openPatrolActionMenu(this.patrolTemplate, event);
        }
    };
    PatrolRobotBaseCard.prototype.getLocationDisplayname = function () {
        if (this.patrolTemplate) {
            var loc = this.locationFilterService.getLocation('mapview', this.patrolTemplate.TenantId, this.patrolTemplate.LocationId);
            if (loc) {
                return loc.Name;
            }
            else {
                return 'No Location';
            }
        }
        else if (this.platform) {
            var loc = this.locationFilterService.getLocation('mapview', this.platform.TenantId, this.platform.LocationId);
            if (loc) {
                return loc.Name;
            }
            else {
                return 'No Location';
            }
        }
        else {
            return '';
        }
    };
    PatrolRobotBaseCard.prototype.getPatrolRunText = function () {
        var _this = this;
        //Make this method cleaner
        var patrolTemplateDisplay = function (patrolTemplate) {
            if (patrolTemplate.RunSetData) {
                //In the delay
                if (patrolTemplate.RunSetData.NextRun !== null) {
                    clearTimeout(_this.nextRunTimer);
                    _this.nextRunTimer = setTimeout(function () {
                        _this.ref.markForCheck();
                    }, 60000);
                    return 'Next Run ' + moment.utc(patrolTemplate.RunSetData.NextRun).local().fromNow();
                }
                else {
                    //In pending
                    return 'Patrol Run ' + patrolTemplate.RunSetData.CurrentRunNumber + ' of ' + ((patrolTemplate.RunSetData.TotalRunNumber === -1) ? 'infinite' : patrolTemplate.RunSetData.TotalRunNumber.toString());
                }
            }
            else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        };
        if (this.patrolInstance) {
            if (this.patrolInstance.RunSetData) {
                clearTimeout(this.nextRunTimer);
                return 'Patrol Run ' + this.patrolInstance.RunSetData.CurrentRunNumber + ' of ' + ((this.patrolInstance.RunSetData.TotalRunNumber === -1) ? 'infinite' : this.patrolInstance.RunSetData.TotalRunNumber.toString());
            }
            else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        }
        else if (this.patrolTemplate) {
            return patrolTemplateDisplay(this.patrolTemplate);
        }
        else {
            //From the platform pov
            var patrolTemplate = this.patrolService.getPatrolTemplate(this.platform.PatrolTemplateSubmittedId);
            if (patrolTemplate.RunSetData) {
                return patrolTemplateDisplay(patrolTemplate);
            }
            else {
                //This should just be for legacy patrol
                return 'Patrol Run 1 of 1';
            }
        }
    };
    PatrolRobotBaseCard.prototype.isEstopEnabled = function () {
        if (this.platform) {
            if (this.platform.State.PlatformMode === PlatformMode.Estop || this.platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                return true;
            }
        }
        else {
            if (this.patrolInstance) {
                var platform = this.platformService.getPlatform(this.patrolInstance.PlatformId);
                if (platform) {
                    if (this.platform.State.PlatformMode === PlatformMode.Estop || this.platform.State.PlatformMode === PlatformMode.EstopPhysical) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    __decorate([
        Input(),
        __metadata("design:type", PatrolTemplate)
    ], PatrolRobotBaseCard.prototype, "patrolTemplate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", PatrolInstance)
    ], PatrolRobotBaseCard.prototype, "patrolInstance", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolRobotBaseCard.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolRobotBaseCard.prototype, "expanded", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Platform)
    ], PatrolRobotBaseCard.prototype, "platform", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolRobotBaseCard.prototype, "isOnPatrol", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PatrolRobotBaseCard.prototype, "statusClass", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolRobotBaseCard.prototype, "updateToggle", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PatrolRobotBaseCard.prototype, "actionMenuOpen", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolRobotBaseCard.prototype, "onExpandExpandedView", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolRobotBaseCard.prototype, "onExpandedViewHidden", void 0);
    __decorate([
        ViewChild(ChooserStatus),
        __metadata("design:type", ChooserStatus)
    ], PatrolRobotBaseCard.prototype, "chooserStatus", void 0);
    PatrolRobotBaseCard = __decorate([
        Component({
            selector: 'patrol-robot-base-card',
            templateUrl: 'patrol-robot-base-card.component.html',
            styleUrls: ['patrol-robot-base-card.component.css'],
            animations: [slideDown],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PlatformService,
            LocationFilterService,
            PlatformMapService,
            ChangeDetectorRef])
    ], PatrolRobotBaseCard);
    return PatrolRobotBaseCard;
}());
export { PatrolRobotBaseCard };
//# sourceMappingURL=patrol-robot-base-card.component.js.map