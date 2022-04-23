var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Output, EventEmitter, ChangeDetectionStrategy, Input, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { PatrolSortService } from '../../patrols/patrol-sort.service';
import { PatrolService } from '../../patrols/patrol.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { UserService } from '../../shared/user.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var PatrolTab = /** @class */ (function () {
    function PatrolTab(patrolService, PatrolSortService, ref, locationFilterService, userService) {
        this.patrolService = patrolService;
        this.PatrolSortService = PatrolSortService;
        this.ref = ref;
        this.locationFilterService = locationFilterService;
        this.userService = userService;
        this.onShowPatrolBuilder = new EventEmitter();
        this.sortOrder = 'asc';
        this.searchFocus = false;
        this.showSettingsTrays = false;
        this.ngUnsubscribe = new Subject();
    }
    PatrolTab.prototype.groupChanged = function () {
        this.buildGroupList();
        this.showSettingsTrays = false;
    };
    PatrolTab.prototype.buildGroupList = function () {
        this.groupList = this.PatrolSortService.getGroupList(this.patrolTemplates, this.patrolService.groupSelection, this.sortOrder);
    };
    PatrolTab.prototype.toggleGroupOrder = function () {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
    };
    PatrolTab.prototype.showPatrolBuilder = function () {
        this.onShowPatrolBuilder.emit();
    };
    PatrolTab.prototype.getPatrolCount = function () {
        return this.patrolService.getLocationBasedPatrolTemplates().length;
    };
    PatrolTab.prototype.getFilteredTemplates = function () {
        var _this = this;
        this.filterBy = (this.filterBy && this.filterBy.trim()) ? this.filterBy.toLowerCase().trim() : null;
        if (this.filterBy) {
            return this.patrolTemplates.filter(function (template) {
                return template.DisplayName.toLowerCase().lastIndexOf(_this.filterBy) !== -1;
            });
        }
        else {
            return this.patrolTemplates;
        }
    };
    PatrolTab.prototype.trackByOptionsFn = function (index, groupOption) {
        return groupOption.value;
    };
    PatrolTab.prototype.trackByGroupFn = function (index, group) {
        return group;
    };
    PatrolTab.prototype.ngOnInit = function () {
        var _this = this;
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'PatrolArea', name: 'By Patrol Area ' },
            { value: 'PatrolName', name: 'By Patrol Name' },
            { value: 'Status', name: 'By Status' }
        ];
        this.buildGroupList();
        this.patrolService.onScollToPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolID) {
                _this.scrollToPatrol(_this.patrolService.getPatrolTemplate(patrolID));
                _this.patrolService.toggleSelectedPatrol(patrolID, true);
            }
        });
        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                _this.buildGroupList();
                _this.ref.markForCheck();
            }
        });
        this.patrolService.onEditPatrol
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolId) { return _this.onShowPatrolBuilder.emit(patrolId); }
        });
        this.patrolService.onUpsertTemplate
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolTemplate) {
                _this.buildGroupList();
                _this.ref.markForCheck();
                if (patrolTemplate.UserName === _this.userService.currentUser.name && patrolTemplate.isPatrolBuilderEdit) {
                    setTimeout(function () {
                        _this.scrollToPatrol(patrolTemplate);
                        _this.patrolService.toggleSelectedPatrol(patrolTemplate.TemplateId, true);
                        _this.ref.markForCheck();
                        patrolTemplate.isPatrolBuilderEdit = false;
                    });
                }
            }
        });
        this.patrolService.onPatrolInstanceComplete
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                _this.buildGroupList();
                _this.ref.markForCheck();
            }
        });
        this.patrolService.onUpsertInstance
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolInstance) {
                _this.buildGroupList();
                _this.ref.markForCheck();
            }
        });
        this.patrolService.onPatrolSelectionChange
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (patrolTempalteId) {
                _this.handleSelection(patrolTempalteId);
            }
        });
    };
    PatrolTab.prototype.handleSelection = function (patrolTempalteId) {
        this.selectedPatrolTemplateId = patrolTempalteId;
    };
    PatrolTab.prototype.scrollToPatrol = function (patrol) {
        var _this = this;
        setTimeout(function () {
            // Get the dom element of the alarm being added/removed
            var item = document.getElementById('card_' + patrol.TemplateId);
            if (item) {
                // If the patrol card is in or above the viewable section of the patrol tab, change the current scroll top to prevent the scroll offset from changing
                if (item.offsetTop < _this.patrolsContainer.nativeElement.scrollTop + _this.patrolsContainer.nativeElement.clientHeight) {
                    $(_this.patrolsContainer.nativeElement).scrollTop($(_this.patrolsContainer.nativeElement).scrollTop() + ($(item).offset().top - 154));
                }
            }
        }, 1000);
    };
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], PatrolTab.prototype, "onShowPatrolBuilder", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolTab.prototype, "patrolTemplates", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PatrolTab.prototype, "patrolInstances", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolTab.prototype, "patrolInstancesCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], PatrolTab.prototype, "patrolTemplateCount", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PatrolTab.prototype, "mapViewOptions", void 0);
    __decorate([
        ViewChild('patrolsContainer'),
        __metadata("design:type", ElementRef)
    ], PatrolTab.prototype, "patrolsContainer", void 0);
    PatrolTab = __decorate([
        Component({
            selector: 'patrol-tab',
            templateUrl: 'patrol-tab.component.html',
            styleUrls: ['patrol-tab.component.css'],
            providers: [PatrolSortService],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PatrolService,
            PatrolSortService,
            ChangeDetectorRef,
            LocationFilterService,
            UserService])
    ], PatrolTab);
    return PatrolTab;
}());
export { PatrolTab };
//# sourceMappingURL=patrol-tab.component.js.map