var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { LocationFilterService } from './location-filter.service';
import { slideDown } from '../shared/animations';
import { Subject } from 'rxjs/Subject';
import { MapViewOptions } from '../shared/map-view-options.class';
var LocationFilter = /** @class */ (function () {
    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    function LocationFilter(locationFilterService, changeDetectorRef) {
        this.locationFilterService = locationFilterService;
        this.changeDetectorRef = changeDetectorRef;
        this.selectedTenant = null;
        this.tenantLocationHeader = '';
        this.tenantLocationHeader_TenantName = '';
        this.tenantLocationFilters = [];
        this.expandedState = 'in';
        this.defaultSelection = true;
        this.allowZoomToLocation = true;
        this.ngUnsubscribe = new Subject();
    }
    LocationFilter.prototype.ngOnInit = function () {
        // register this component with the location-filter service so that 
        // the service can maintain state for the selected locations for the component (i.e. so that switching
        // between the dashboard and the map view will keep the users selection)
        if (this.locationFilterService.registerComponent(this.scView, this.multiSelect, this.defaultSelection)) {
            this.tenants = this.locationFilterService.getAllTenantLocations(this.scView);
            this.setLocationHeader();
            if (!this.multiSelect) {
                //make sure we hold on to the selected tenant from the this.tenants arrary so that when its changed,
                //its changing data in that array
                var selTenantId_1 = this.locationFilterService.getSelectedTenantIDs(this.scView)[0];
                this.selectedTenant = this.tenants.filter(function (t) { return t.Id === selTenantId_1; })[0];
            }
        }
    };
    LocationFilter.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.locationFilterService.locationsChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) { return _this.locationChanged(view); }
        });
        this.locationFilterService.locationsUpdated
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (view) { return _this.locationChanged(view); }
        });
    };
    LocationFilter.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    LocationFilter.prototype.locationChanged = function (view) {
        if (!this.multiSelect) {
            //in single select mode
            //the tenant/location was set directly in the service
            //make sure we set the global selected tenant
            var tenant = this.locationFilterService.getSelectedTenantOrLocations(view);
            if (tenant.length > 0) {
                this.selectedTenant = tenant[0];
            }
        }
        this.setLocationHeader();
        this.changeDetectorRef.detectChanges();
    };
    LocationFilter.prototype.expandedViewState = function () {
        return this.expandedState;
    };
    LocationFilter.prototype.toggleExpandedView = function () {
        if (this.mapViewOptions && !this.mapViewOptions.showLeftPanelContent) {
            this.showLastShownTab();
            this.mapViewOptions.showLeftPanelContent = true;
            return;
        }
        if (!this.readOnly) {
            this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
        }
    };
    LocationFilter.prototype.showLastShownTab = function () {
        if (this.mapViewOptions.lastShownTab === 'Alarm') {
            this.mapViewOptions.showAlarmsTab = true;
            this.mapViewOptions.showPlatformsTab = false;
            this.mapViewOptions.showPatrolsTab = false;
        }
        else if (this.mapViewOptions.lastShownTab === 'Platform') {
            this.mapViewOptions.showAlarmsTab = false;
            this.mapViewOptions.showPlatformsTab = true;
            this.mapViewOptions.showPatrolsTab = false;
        }
        else {
            this.mapViewOptions.showAlarmsTab = false;
            this.mapViewOptions.showPlatformsTab = false;
            this.mapViewOptions.showPatrolsTab = true;
        }
    };
    LocationFilter.prototype.setLocationHeader = function () {
        var _this = this;
        var parent = true;
        var totalTenantCount = 0;
        var totalSelTenantCount = 0;
        this.tenantLocationFilters = [];
        var tenantIndex = 0;
        for (var _i = 0, _a = this.tenants; _i < _a.length; _i++) {
            var tenant = _a[_i];
            totalTenantCount = totalTenantCount + tenant.Locations.length;
            var selectedLoc = (tenant.Locations.filter(function (c) { return c.Selected === true; }).length);
            if (selectedLoc > 0) {
                this.tenantLocationFilters[tenantIndex] = {
                    'SelectedLocation': tenant.CustomerName + ' (' + selectedLoc + ')',
                    'TenantId': tenant.Id
                };
                tenantIndex++;
            }
            totalSelTenantCount = totalSelTenantCount + selectedLoc;
        }
        if (this.multiSelect) {
            parent = (this.tenants.filter(function (p) { return !p.Selected; })).length > 0 ? false : true;
            if (parent) {
                // means all high level tenants are selected
                this.tenantLocationHeader = 'All Locations (' + totalTenantCount + ')';
                this.tenantLocationFilters = [];
            }
            else {
                if (totalSelTenantCount === 0) {
                    this.tenantLocationHeader = 'Choose Location';
                }
                else if (this.showFilter || totalSelTenantCount > 1) {
                    this.tenantLocationHeader = 'Showing (' + totalSelTenantCount + ') Locations';
                }
                else if (totalSelTenantCount === 1) {
                    this.tenantLocationHeader = '';
                    var tenant = this.tenants.filter(function (t) { return t.Id === _this.tenantLocationFilters[0].TenantId; });
                    if (tenant && tenant.length) {
                        this.tenantLocationHeader_TenantName = tenant[0].CustomerName;
                        if (tenant[0].Locations && tenant[0].Locations.length) {
                            var location_1 = tenant[0].Locations.filter(function (l) { return l.Selected; });
                            if (location_1) {
                                this.tenantLocationHeader_LocationInfo = location_1[0];
                            }
                        }
                    }
                }
            }
        }
        else {
            //single select mode
            if (totalSelTenantCount === 0) {
                this.tenantLocationHeader = 'Choose Location';
            }
            else if (totalSelTenantCount === 1) {
                this.tenantLocationHeader = '';
                var tenant = this.tenants.filter(function (t) { return t.Id === _this.tenantLocationFilters[0].TenantId; });
                if (tenant && tenant.length) {
                    this.tenantLocationHeader_TenantName = tenant[0].CustomerName;
                    if (tenant[0].Locations && tenant[0].Locations.length) {
                        var location_2 = tenant[0].Locations.filter(function (l) { return l.Selected; });
                        if (location_2) {
                            this.tenantLocationHeader_LocationInfo = location_2[0];
                        }
                    }
                }
            }
        }
    };
    LocationFilter.prototype.locationSelected = function (tenId, locId) {
        //let tenant: Tenant[];
        //tenant = this.tenants.filter(t => t.Id === tenId);
        //if (this.multiSelect) {
        //    if (locId === '') {
        //        // they toggled the high level Tenant checkbox
        //        tenant[0].Selected = !tenant[0].Selected;
        //        tenant[0].Locations.map(function (x) {
        //            x.Selected = tenant[0].Selected;
        //        });
        //    } else {
        //        if (tenId) {
        //            // they toggled a specific location for a Tenant               
        //            let loc: Location[];
        //            let selLoc: Location[];
        //            loc = tenant[0].Locations.filter(location => location.Id === locId);
        //            loc[0].Selected = !loc[0].Selected;
        //            selLoc = tenant[0].Locations.filter(location => !location.Selected);
        //            if (selLoc.length === 0)
        //                tenant[0].Selected = true;
        //            else
        //                tenant[0].Selected = false;
        //        } else {
        //            //TODO: this is an error
        //        }
        //    }
        //} else {
        //    //single select mode
        //    if (tenId)
        //    {
        //        if (locId === '') {
        //            // they toggled the high level Tenant checkbox
        //            // they can not do that in single select
        //            return;
        //        }
        //        //unselect the previously selected tenant/location
        //        if (this.selectedTenant) {
        //            let curSelLoc = this.selectedTenant.Locations.filter(location => location.Selected);
        //            curSelLoc[0].Selected = false;
        //        }
        //        //select the newly selected tenant/location
        //        let newSelLoc = tenant[0].Locations.filter(location => location.Id === locId);
        //        newSelLoc[0].Selected = true;
        //        this.selectedTenant = tenant[0];
        //    }
        //}
        if (this.multiSelect) {
            if (!locId) {
                tenId.Selected = !tenId.Selected;
                tenId.Locations.map(function (x) {
                    x.Selected = tenId.Selected;
                });
            }
            else {
                if (tenId) {
                    // they toggled a specific location for a Tenant  
                    locId.Selected = !locId.Selected;
                    var selLoc = tenId.Locations.filter(function (location) { return !location.Selected; });
                    if (selLoc.length === 0)
                        tenId.Selected = true;
                    else
                        tenId.Selected = false;
                }
                else {
                    //TODO: this is an error
                }
            }
        }
        else {
            //single select mode
            if (tenId) {
                if (!locId) {
                    // they toggled the high level Tenant checkbox
                    // they can not do that in single select
                    return;
                }
                //unselect the previously selected tenant/location
                if (this.selectedTenant) {
                    var curSelLoc = this.selectedTenant.Locations.filter(function (location) { return location.Selected; });
                    curSelLoc[0].Selected = false;
                }
                //select the newly selected tenant/location
                locId.Selected = true;
                this.selectedTenant = tenId;
            }
        }
        if (!this.showButtons) {
            //the cancel and apply buttons are not being shown so go ahead and apply the changes
            this.applySelectedLocations();
        }
    };
    LocationFilter.prototype.applySelectedLocations = function () {
        // set the selected customers on the dashboard service
        this.locationFilterService.setSelectedTenantLocations(this.scView, this.tenants); //notification is done by the service
        this.toggleExpandedView();
        this.setLocationHeader();
    };
    LocationFilter.prototype.cancelSelectedLocations = function () {
        //the user canceled the selection - revert to previously selected tenants/locations
        this.tenants = this.locationFilterService.getBackupTenantLocations(this.scView);
        if (!this.multiSelect) {
            //make sure we hold on to the selected tenant from the this.tenants arrary so that when its changed,
            //its changing data in that array
            var selTenantId_2 = this.locationFilterService.getSelectedTenantIDs(this.scView)[0];
            this.selectedTenant = this.tenants.filter(function (t) { return t.Id === selTenantId_2; })[0];
        }
        this.toggleExpandedView();
        this.setLocationHeader();
    };
    LocationFilter.prototype.removeSelectedLocationFilter = function (tenId) {
        var tent;
        tent = this.tenants.filter(function (tenant) { return tenant.Id === tenId; });
        tent[0].Locations.map(function (x) {
            x.Selected = false;
        });
        tent[0].Selected = false;
        this.locationFilterService.setSelectedTenantLocations(this.scView, this.tenants); //notification is done by the service
        this.setLocationHeader();
    };
    LocationFilter.prototype.zoomToLocation = function (location) {
        event.stopPropagation();
        this.locationFilterService.onZoomToLocation.next(location);
    };
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "multiSelect", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], LocationFilter.prototype, "scView", void 0);
    __decorate([
        Input(),
        __metadata("design:type", MapViewOptions)
    ], LocationFilter.prototype, "mapViewOptions", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "showFilter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "filterOverride", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "showButtons", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "readOnly", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "defaultSelection", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], LocationFilter.prototype, "allowZoomToLocation", void 0);
    LocationFilter = __decorate([
        Component({
            selector: 'location-filter',
            templateUrl: 'location-filter.component.html',
            styleUrls: ['location-filter.component.css'],
            animations: [
                slideDown
            ]
        }),
        __metadata("design:paramtypes", [LocationFilterService,
            ChangeDetectorRef])
    ], LocationFilter);
    return LocationFilter;
}());
export { LocationFilter };
//# sourceMappingURL=location-filter.component.js.map