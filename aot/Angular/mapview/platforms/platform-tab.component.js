var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ViewChild, ChangeDetectionStrategy, ElementRef, NgZone, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { PlatformService } from '../../platforms/platform.service';
import { PlatformSort } from '../../platforms/platform-sort.class';
import { MapViewOptions } from '../../shared/map-view-options.class';
import { LocationFilterService } from '../../shared/location-filter.service';
var PlatformTab = /** @class */ (function () {
    function PlatformTab(platformService, platformSort, ngZone, changeDetectorRef, locationFilterService) {
        var _this = this;
        this.platformService = platformService;
        this.platformSort = platformSort;
        this.ngZone = ngZone;
        this.changeDetectorRef = changeDetectorRef;
        this.locationFilterService = locationFilterService;
        this.isActionMenuOpen = false;
        this.showSettingsTrays = false;
        this.currentScroll = 0;
        this.ngUnsubscribe = new Subject();
        this.multiSelect = false;
        this.platformService.openPlatformActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) {
                if (obj.disableScroll) {
                    _this.isActionMenuOpen = true;
                }
            }
        });
        this.platformService.platformCommandDialogClosed
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return setTimeout(function () {
                _this.isActionMenuOpen = false;
                _this.changeDetectorRef.detectChanges();
            }); }
        });
    }
    PlatformTab.prototype.handleNewPlatform = function (platform) {
        // A new platform will not yet be in the dom, so we cannot get its position until ngAfterViewChecked
        // So store the platform for now
        this.newPlatform = platform;
    };
    PlatformTab.prototype.handleSelectedPlatform = function (platform) {
        // A platform was selected, so ensure it is in the viewport
        // Get the dom element of the platform being added/removed
        var item = document.getElementById('platform-item-' + platform);
        if (item) {
            // If the alarm item is outside of the current viewport 
            if (item.offsetTop < this.platformsContainer.nativeElement.scrollTop ||
                item.offsetTop > this.platformsContainer.nativeElement.scrollTop + this.platformsContainer.nativeElement.clientHeight) {
                // Move the scroll height to the selected platforms position, minus half the tab height in order to place the platform in the middle of the tab
                this.platformsContainer.nativeElement.scrollTop = item.offsetTop - this.platformsContainer.nativeElement.clientHeight / 2;
            }
            this.onContainerScroll(null);
        }
    };
    PlatformTab.prototype.getPlatformCount = function () {
        return this.platforms.length;
    };
    //To-Do
    PlatformTab.prototype.getHighestStatePlatform = function () {
        //return this.platformService.getPlatforms().sort(function (a, b) {
        //    return a.State - b.State;
        //})[0];
    };
    PlatformTab.prototype.groupChanged = function () {
        this.buildGroupList();
        this.showSettingsTrays = false;
        this.currentScroll = 0;
    };
    PlatformTab.prototype.buildGroupList = function () {
        this.groupList = this.platformSort.getGroupList(this.platforms, this.platformService.groupSelection, this.platformService.sortOrder);
    };
    PlatformTab.prototype.toggleGroupOrder = function () {
        this.platformService.sortOrder = this.platformService.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
    };
    PlatformTab.prototype.selectAllPlatforms = function () {
        this.multiSelect = true;
        for (var platform in this.platforms) {
            this.platformService.selectPlatform(this.platforms[platform].id, true, false);
        }
        this.showSettingsTrays = false;
    };
    PlatformTab.prototype.toggleSelectionCheckboxes = function () {
        this.multiSelect = !this.multiSelect;
        this.showSettingsTrays = false;
        this.toggleLeftPanelWidth();
    };
    // TODO: quick fix workaround, Angularize all $('#lpContent')
    // this works for now, as the Left Panel design changes every day.
    PlatformTab.prototype.toggleLeftPanelWidth = function () {
        if (this.multiSelect) {
            $('#lpContent').attr('style', 'width: 445px');
        }
        else {
            $('#lpContent').attr('style', 'width: 407px');
        }
    };
    //To-Do
    PlatformTab.prototype.toggleExpandedGroup = function (groupName) {
        //for (var group in this.displayPlatforms) {
        //    if (this.displayPlatforms[group].groupName === groupName) {
        //        this.displayPlatforms[group].expandedState = this.displayPlatforms[group].expandedState === 'out' ? 'in' : 'out';
        //    }
        //}
    };
    PlatformTab.prototype.onContainerScroll = function (event) {
        this.currentScroll = this.platformsContainer.nativeElement.scrollTop;
    };
    PlatformTab.prototype.refreshPlatformListItems = function () {
        this.platformService.refreshTimerSub.next();
    };
    PlatformTab.prototype.ngOnInit = function () {
        var _this = this;
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'Manufacturer', name: 'By Manufacturer' },
            { value: 'RobotName', name: 'By Robot Name' },
            { value: 'State', name: 'By Status' }
        ];
        this.buildGroupList();
        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(function () {
            _this.platformsContainer.nativeElement.addEventListener('scroll', function (e) {
                _this.onContainerScroll(e);
            });
        });
    };
    PlatformTab.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.platformsContainer.nativeElement.scrollTop = 0;
        this.refreshInterval = setInterval(function () { _this.refreshPlatformListItems(); }, 60000);
    };
    PlatformTab.prototype.ngOnChanges = function (changes) {
        // On change to platform list, rebuild groups
        if (changes.platforms) {
            this.buildGroupList();
        }
        if (changes.platform && changes.platform.currentValue.State !== changes.platform.previousValue.State) {
            this.platformService.closePlatformActionMenuSub.next();
        }
    };
    PlatformTab.prototype.ngOnDestroy = function () {
        clearInterval(this.refreshInterval);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild('platformsContainer'),
        __metadata("design:type", ElementRef)
    ], PlatformTab.prototype, "platformsContainer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], PlatformTab.prototype, "platforms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], PlatformTab.prototype, "mapViewOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], PlatformTab.prototype, "isActionMenuOpen", void 0);
    PlatformTab = __decorate([
        Component({
            selector: 'platform-tab',
            templateUrl: 'platform-tab.component.html',
            providers: [PlatformSort],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [PlatformService,
            PlatformSort,
            NgZone,
            ChangeDetectorRef,
            LocationFilterService])
    ], PlatformTab);
    return PlatformTab;
}());
export { PlatformTab };
//# sourceMappingURL=platform-tab.component.js.map