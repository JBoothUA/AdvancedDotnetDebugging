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
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmSort } from '../../alarms/alarm-sort.class';
import { LocationFilterService } from '../../shared/location-filter.service';
import { MapViewOptions } from '../../shared/map-view-options.class';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var AlarmTab = /** @class */ (function () {
    function AlarmTab(alarmService, alarmSort, ngZone, changeDetectorRef, locationFilterService) {
        var _this = this;
        this.alarmService = alarmService;
        this.alarmSort = alarmSort;
        this.ngZone = ngZone;
        this.changeDetectorRef = changeDetectorRef;
        this.locationFilterService = locationFilterService;
        this.showSettingsTrays = false;
        this.currentScroll = 0;
        this.resetScroll = false;
        this.toggleDisplay = 'Select All';
        this.currentlyToggling = false;
        this.ngUnsubscribe = new Subject();
        this.multiSelect = false;
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleNewAlarm(alarm); }
        });
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.buildGroupList(); }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleRemoveAlarm(alarm); }
        });
        this.alarmService.alarmSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.handleSelectedAlarm(alarm); }
        });
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (status) {
                if (status) {
                    _this.resetScroll = true;
                }
            }
        });
        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) { return _this.resetScroll = true; }
        });
    }
    AlarmTab.prototype.handleNewAlarm = function (alarm) {
        // A new alarm will not yet be in the dom, so we cannot get its position until ngAfterViewChecked
        // So store the alarm for now
        this.newAlarm = alarm;
    };
    AlarmTab.prototype.handleRemoveAlarm = function (alarm) {
        // When an alarm is removed, we need to find its position before it is actually removed from the dom
        // So handle updating the scrollbar now
        this.updateScroll(alarm, false);
    };
    AlarmTab.prototype.handleSelectedAlarm = function (alarm) {
        // An alarm was selected, so ensure it is in the viewport
        var item = document.getElementById('alarm-item-' + alarm);
        if (item) {
            // If the alarm item is outside of the current viewport 
            if (item.offsetTop < this.alarmsContainer.nativeElement.scrollTop ||
                item.offsetTop > this.alarmsContainer.nativeElement.scrollTop + this.alarmsContainer.nativeElement.clientHeight) {
                // Move the scroll height to the selected alarms position, minus half the tab height in order to place the alarm in the middle of the tab
                this.alarmsContainer.nativeElement.scrollTop = item.offsetTop - this.alarmsContainer.nativeElement.clientHeight / 2;
            }
            this.onContainerScroll(null);
        }
    };
    AlarmTab.prototype.ngAfterViewChecked = function () {
        if (this.newAlarm) {
            this.updateScroll(this.newAlarm, true);
            this.newAlarm = undefined;
        }
        if (this.resetScroll) {
            this.alarmsContainer.nativeElement.scrollTop = 0;
            this.resetScroll = false;
        }
    };
    AlarmTab.prototype.trackByOptionsFn = function (index, groupOption) {
        return groupOption.value;
    };
    AlarmTab.prototype.trackByGroupFn = function (index, group) {
        return group;
    };
    AlarmTab.prototype.updateScroll = function (alarm, newAlarm) {
        // Get the dom element of the alarm being added/removed
        var item = document.getElementById('alarm-item-' + alarm.Id);
        if (item) {
            // If the alarm item is in or above the viewable section of the alarm tab, change the current scroll top to prevent the scroll offset from changing
            if (item.offsetTop < this.alarmsContainer.nativeElement.scrollTop + this.alarmsContainer.nativeElement.clientHeight) {
                if (newAlarm) {
                    this.currentScroll += $(item).find('.lpItem').height() + 2; // +2 to account for border
                }
                else {
                    this.currentScroll -= item.children[0].clientHeight;
                }
            }
        }
        this.maintainScroll();
    };
    AlarmTab.prototype.maintainScroll = function () {
        this.alarmsContainer.nativeElement.scrollTop = this.currentScroll;
    };
    AlarmTab.prototype.getAlarmCount = function () {
        return this.alarms.length;
    };
    AlarmTab.prototype.groupChanged = function () {
        this.buildGroupList();
        this.showSettingsTrays = false;
        this.currentScroll = 0;
    };
    AlarmTab.prototype.buildGroupList = function () {
        if (this.alarms && this.alarms.length > 0) {
            this.groupList = this.alarmSort.getGroupList(this.alarms, this.alarmService.groupSelection, this.alarmService.sortOrder);
        }
    };
    AlarmTab.prototype.toggleGroupOrder = function () {
        this.alarmService.sortOrder = this.alarmService.sortOrder === 'asc' ? 'desc' : 'asc';
        this.buildGroupList();
    };
    AlarmTab.prototype.toggleAllAlarms = function () {
        this.toggleSelectionCheckboxes();
        this.currentlyToggling = true;
        var toggleOn = (this.toggleDisplay === 'Select All');
        this.toggleDisplay = (this.toggleDisplay === 'Select All') ? 'Unselect All' : 'Select All';
        for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
            var alarm = _a[_i];
            if (toggleOn) {
                this.alarmService.selectAlarm(alarm.Id, true, false);
            }
            else {
                this.alarmService.deSelectAlarm(alarm.Id, true);
            }
        }
        this.currentlyToggling = false;
    };
    AlarmTab.prototype.toggleSelectionCheckboxes = function () {
        this.multiSelect = !this.multiSelect;
        this.showSettingsTrays = false;
        this.toggleLeftPanelWidth();
    };
    // TODO: quick fix workaround, Angularize all $('#lpContent')
    // this works for now, as the Left Panel design changes every day
    AlarmTab.prototype.toggleLeftPanelWidth = function () {
        if (this.multiSelect) {
            $('#lpContent').attr('style', 'width: 445px');
        }
        else {
            $('#lpContent').attr('style', 'width: 407px');
        }
    };
    AlarmTab.prototype.ngOnInit = function () {
        var _this = this;
        this.groupOptions = [
            { value: 'Location', name: 'By Location' },
            { value: 'UserId', name: 'By Operator' },
            { value: 'Priority', name: 'By Priority' },
            { value: 'Created', name: 'By Reported Time' },
            { value: 'RobotName', name: 'By Robot Name' },
            { value: 'Type', name: 'By Type' },
            { value: 'State', name: 'By Status' }
        ];
        this.buildGroupList();
        // Bind scroll event outside of angular so that change detection is not fired on every scroll event
        // We only need to persist the current scroll value, so change detection is not required
        this.ngZone.runOutsideAngular(function () {
            _this.alarmsContainer.nativeElement.addEventListener('scroll', function (e) {
                _this.onContainerScroll(e);
            });
        });
    };
    AlarmTab.prototype.onContainerScroll = function (event) {
        this.currentScroll = this.alarmsContainer.nativeElement.scrollTop;
    };
    AlarmTab.prototype.refreshAlarmListItems = function () {
        this.alarmService.refreshTimerSub.next();
    };
    AlarmTab.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.alarmsContainer.nativeElement.scrollTop = 0;
        this.refreshInterval = setInterval(function () { _this.refreshAlarmListItems(); }, 60000);
    };
    AlarmTab.prototype.ngOnChanges = function (changes) {
        this.maintainScroll();
        if ((changes.alarms && changes.alarms.currentValue.length > 0) && (changes.alarms.previousValue && changes.alarms.previousValue.length === 0)) {
            this.buildGroupList();
        }
        if (changes.alarms && !this.currentlyToggling) {
            // Toggle to 'Unselect All'
            var allSelected = true;
            for (var _i = 0, _a = this.alarms; _i < _a.length; _i++) {
                var alarm = _a[_i];
                if (!alarm.Selected) {
                    allSelected = false;
                    break;
                }
            }
            if (allSelected) {
                this.toggleDisplay = 'Unselect All';
            }
            else {
                this.toggleDisplay = 'Select All';
            }
        }
    };
    AlarmTab.prototype.ngOnDestroy = function () {
        clearInterval(this.refreshInterval);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild('alarmsContainer'),
        __metadata("design:type", ElementRef)
    ], AlarmTab.prototype, "alarmsContainer", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], AlarmTab.prototype, "alarms", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], AlarmTab.prototype, "mapViewOptions", void 0);
    AlarmTab = __decorate([
        Component({
            selector: 'alarm-tab',
            templateUrl: 'alarm-tab.component.html',
            providers: [AlarmSort],
            /* OnPush change detection strategy causes change detection to only occur when an input variable is changed to a new value (or manually triggered).
               Objects in javascript are mutable, so when a object property is changed it will not trigger change detection. If passing an object as input,
               you must make it immutable (pass a new instance of the variable in) or pass each attribute invididually so that the inputs are primitive (immutable) types */
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [AlarmService, AlarmSort, NgZone, ChangeDetectorRef,
            LocationFilterService])
    ], AlarmTab);
    return AlarmTab;
}());
export { AlarmTab };
//# sourceMappingURL=alarm-tab.component.js.map