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
import { Location } from '../shared/location.class';
import { Tenant } from '../shared/tenant.class';
import { Subject } from 'rxjs/Subject';
import { AlarmService } from '../alarms/alarm.service';
import { UserService } from './user.service';
var LocationFilterService = /** @class */ (function () {
    function LocationFilterService(alarmService, userService) {
        var _this = this;
        this.alarmService = alarmService;
        this.userService = userService;
        //will hold the default set of tenants 
        //that's associated with the User object
        this.tenants = [];
        this.registeredComponents = new Map();
        this.backupRegisteredComponents = new Map();
        this.locationHeader = '';
        this.locationsChanged = new Subject();
        this.locationsUpdated = new Subject();
        this.onZoomToLocation = new Subject();
        this.ngUnsubscribe = new Subject();
        //NOTE: The Tenant/Loation model from the User Service must be mapped into the 
        //      location-filter Tenant and Location Classes because Selected and Prioty flags 
        //      are added to the model.
        var t = this.userService.currentUser.tenant;
        var ct = this.userService.currentUser.childTenants;
        if (t != null) {
            var parentTenant = new Tenant(t);
            this.tenants.push(parentTenant);
        }
        if (ct != null) {
            for (var _i = 0, ct_1 = ct; _i < ct_1.length; _i++) {
                var cTenant = ct_1[_i];
                var childTenant = new Tenant(cTenant);
                this.tenants.push(childTenant);
            }
        }
        // Subscribe to get alarm notifications
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (status) {
                if (status) {
                    _this.updateTenantPriority();
                }
            }
        });
        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.updateTenantPriority(); }
        });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (alarm) { return _this.updateTenantPriority(); }
        });
    }
    LocationFilterService.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    //////////////////////////////////////////////
    //Notification Methods
    //////////////////////////////////////////////
    LocationFilterService.prototype.updateTenantPriority = function () {
        var alarms = this.alarmService.alarms;
        this.registeredComponents.forEach(function (value, key) {
            var view = key;
            var tenants = value;
            var _loop_1 = function (tenant) {
                if ((tenant.Locations) && (tenant.Locations.length > 0)) {
                    var _loop_2 = function (locations) {
                        var lPriorityAlarms = alarms.filter(function (a) { return ((a.TenantId == tenant.Id) && (a.LocationId == locations.Id)); });
                        var lPriority = 0;
                        if (lPriorityAlarms.filter(function (a) { return a.Priority === 1; }).length > 0)
                            lPriority = 1;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 2; }).length > 0) && (lPriority == 0))
                            lPriority = 2;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 3; }).length > 0) && (lPriority == 0))
                            lPriority = 3;
                        else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 4; }).length > 0) && (lPriority == 0))
                            lPriority = 4;
                        else if (lPriority == 0)
                            lPriority = 5; //5 means the location is in a normal state with no alarms
                        locations.Priority = lPriority.toString();
                    };
                    for (var _i = 0, _a = tenant.Locations; _i < _a.length; _i++) {
                        var locations = _a[_i];
                        _loop_2(locations);
                    }
                }
            };
            for (var _i = 0, tenants_1 = tenants; _i < tenants_1.length; _i++) {
                var tenant = tenants_1[_i];
                _loop_1(tenant);
            }
            this.locationsUpdated.next(view);
        }, this);
    };
    //////////////////////////////////////////////
    //Component Methods
    //////////////////////////////////////////////
    //registers a view (UI area - i.e. map view, dashboard, patrol builder) with the location service
    LocationFilterService.prototype.registerComponent = function (view, multiselect, defaultSelection) {
        if (defaultSelection === void 0) { defaultSelection = true; }
        //make sure there is a valid view
        if (view) {
            //make sure the view is not already registered
            //if so, just return true
            if (!this.registeredComponents.has(view)) {
                //add the view to the registered component collection
                //with default tenants settings
                var selectedTenants = this.deepCopyTenants(this.tenants); //this.tenants.slice(0);
                if (defaultSelection) {
                    //make default selections - hard coded for now
                    //this may change in the future if user preferences are stored in the db
                    if (multiselect) {
                        //select all locations in the collection
                        for (var _i = 0, selectedTenants_1 = selectedTenants; _i < selectedTenants_1.length; _i++) {
                            var selTenant = selectedTenants_1[_i];
                            selTenant.Locations.map(function (x) {
                                x.Selected = true;
                            });
                            selTenant.Selected = true;
                        }
                    }
                    else {
                        //select the first location in the collection
                        //clear all selections
                        for (var _a = 0, selectedTenants_2 = selectedTenants; _a < selectedTenants_2.length; _a++) {
                            var selTenant = selectedTenants_2[_a];
                            selTenant.Locations.map(function (x) {
                                x.Selected = false;
                            });
                            selTenant.Selected = false;
                        }
                        for (var i = 0; i < selectedTenants.length; i++) {
                            if (selectedTenants[i].Locations.length > 0) {
                                selectedTenants[i].Locations[i].Selected = true;
                                break;
                            }
                        }
                    }
                }
                else {
                    //make sure none of the tenant locations are selected
                    for (var _b = 0, selectedTenants_3 = selectedTenants; _b < selectedTenants_3.length; _b++) {
                        var selTenant = selectedTenants_3[_b];
                        selTenant.Locations.map(function (x) {
                            x.Selected = false;
                        });
                        selTenant.Selected = false;
                    }
                }
                this.setTenantPriority(selectedTenants);
                this.registeredComponents.set(view, selectedTenants);
                //make a copy of registered components to revert back to if a user does a cancel
                var backupSelectedTenants = this.deepCopyTenants(selectedTenants);
                this.backupRegisteredComponents.set(view, backupSelectedTenants);
                this.locationsChanged.next(view);
                return true;
            }
            else
                return true;
        }
        return false;
    };
    LocationFilterService.prototype.unregisterComponent = function (view) {
        //make sure there is a valid view
        if (view) {
            //make sure the view is not already registered
            //if so, just return true
            if (this.registeredComponents.has(view)) {
                this.registeredComponents.delete(view);
                this.backupRegisteredComponents.delete(view);
            }
        }
    };
    LocationFilterService.prototype.setTenantPriority = function (tenants) {
        var alarms = this.alarmService.alarms;
        var _loop_3 = function (tenant) {
            if ((tenant.Locations) && (tenant.Locations.length > 0)) {
                var _loop_4 = function (locations) {
                    var lPriorityAlarms = alarms.filter(function (a) { return ((a.TenantId == tenant.Id) && (a.LocationId == locations.Id)); });
                    var lPriority = 0;
                    if (lPriorityAlarms.filter(function (a) { return a.Priority === 1; }).length > 0)
                        lPriority = 1;
                    else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 2; }).length > 0) && (lPriority == 0))
                        lPriority = 2;
                    else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 3; }).length > 0) && (lPriority == 0))
                        lPriority = 3;
                    else if ((lPriorityAlarms.filter(function (a) { return a.Priority === 4; }).length > 0) && (lPriority == 0))
                        lPriority = 4;
                    else if (lPriority == 0)
                        lPriority = 5; //5 means the location is in a normal state with no alarms
                    locations.Priority = lPriority.toString();
                };
                for (var _i = 0, _a = tenant.Locations; _i < _a.length; _i++) {
                    var locations = _a[_i];
                    _loop_4(locations);
                }
            }
        };
        for (var _i = 0, tenants_2 = tenants; _i < tenants_2.length; _i++) {
            var tenant = tenants_2[_i];
            _loop_3(tenant);
        }
    };
    LocationFilterService.prototype.deepCopyTenants = function (masterTenants) {
        if (masterTenants) {
            var newTenants = [];
            for (var _i = 0, masterTenants_1 = masterTenants; _i < masterTenants_1.length; _i++) {
                var tenant = masterTenants_1[_i];
                var newTenant = new Tenant(tenant);
                newTenants.push(newTenant);
            }
            return newTenants;
        }
        return null;
    };
    LocationFilterService.prototype.setSelectedTenantLocations = function (view, selectedTenants) {
        if ((view) && (selectedTenants)) {
            if (this.registeredComponents.has(view)) {
                this.setTenantPriority(selectedTenants);
                //make a local copy so that changes in the compoents will not effect this copy
                //let copy: Tenant[] = this.deepCopyTenants(selectedTenants);
                //this.registeredComponents.set(view, copy);
                this.registeredComponents.set(view, selectedTenants); //TSR
                //make a copy of registered components to use to revert the selected items if a user does a cancel
                var copy2 = this.deepCopyTenants(selectedTenants);
                this.backupRegisteredComponents.set(view, copy2);
                this.locationsChanged.next(view);
            }
        }
    };
    LocationFilterService.prototype.setTenantLocation = function (view, tenantId, locationId) {
        if (view && tenantId && locationId) {
            var tenants = this.getAllTenantLocations(view);
            //clear out all current selections
            for (var _i = 0, tenants_3 = tenants; _i < tenants_3.length; _i++) {
                var tenant = tenants_3[_i];
                tenant.Selected = false;
                tenant.Locations.map(function (x) {
                    x.Selected = false;
                });
            }
            //select the tenant location passed in
            var tentant = tenants.filter(function (t) { return t.Id === tenantId; });
            if (tentant.length > 0 && locationId) {
                if (tentant[0].Locations) {
                    var loc = tentant[0].Locations.filter(function (location) { return location.Id === locationId; });
                    if (loc.length > 0) {
                        loc[0].Selected = true;
                    }
                }
            }
            //set the backup
            var copy = this.deepCopyTenants(tenants);
            this.backupRegisteredComponents.set(view, copy);
            this.locationsChanged.next(view);
        }
    };
    LocationFilterService.prototype.setSelectedLocationIDs = function (view, locationIds) {
        if (view && locationIds) {
            //get all the tenants for the given view
            var tenants = this.getAllTenantLocations(view);
            //clear out all current selections
            for (var _i = 0, tenants_4 = tenants; _i < tenants_4.length; _i++) {
                var tenant = tenants_4[_i];
                tenant.Selected = false;
                tenant.Locations.map(function (x) {
                    x.Selected = false;
                });
            }
            //select the tenant locations passed in
            for (var _a = 0, tenants_5 = tenants; _a < tenants_5.length; _a++) {
                var tenant = tenants_5[_a];
                var locations = tenant.Locations.filter(function (loc) { return locationIds.includes(loc.Id); });
                for (var _b = 0, locations_1 = locations; _b < locations_1.length; _b++) {
                    var loc = locations_1[_b];
                    loc.Selected = true;
                }
                var selLoc = tenant.Locations.filter(function (location) { return !location.Selected; });
                if (selLoc.length === 0)
                    tenant.Selected = true; //all locations are selected to selected the tenant as well
                else
                    tenant.Selected = false;
                //set the backup
                var copy = this.deepCopyTenants(tenants);
                this.backupRegisteredComponents.set(view, copy);
            }
            this.locationsChanged.next(view);
        }
    };
    LocationFilterService.prototype.getSelectedTenantOrLocations = function (view) {
        var selectedTenants = [];
        if (view) {
            if (this.registeredComponents.has(view)) {
                //let tenants: Tenant[] = this.deepCopyTenants(this.registeredComponents.get(view));
                var tenants = this.registeredComponents.get(view); //TSR
                //get the tenants that have selected items in it
                if (tenants) {
                    for (var _i = 0, tenants_6 = tenants; _i < tenants_6.length; _i++) {
                        var tenant = tenants_6[_i];
                        if ((tenant.Selected) || ((tenant.Locations) && ((tenant.Locations.filter(function (l) { return l.Selected; })).length > 0)))
                            selectedTenants.push(tenant);
                    }
                }
            }
        }
        return selectedTenants;
    };
    LocationFilterService.prototype.getSelectedTenantLocations = function (view) {
        var selectedTenants = [];
        if (view) {
            if (this.registeredComponents.has(view)) {
                var tenants = this.deepCopyTenants(this.registeredComponents.get(view));
                //let tenants: Tenant[] = this.registeredComponents.get(view);//TSR
                //get the tenants that have selected items in it
                if (tenants && tenants.length > 0) {
                    for (var _i = 0, tenants_7 = tenants; _i < tenants_7.length; _i++) {
                        var tenant = tenants_7[_i];
                        if ((tenant.Selected) || ((tenant.Locations) && (tenant.Locations.length > 0) && ((tenant.Locations.filter(function (l) { return l.Selected; })).length > 0)))
                            selectedTenants.push(tenant);
                    }
                    var _loop_5 = function (selTenant) {
                        var indexes = [];
                        selTenant.Locations.forEach(function (item, index) {
                            if (!item.Selected)
                                indexes.push(index);
                        });
                        if (indexes.length > 0) {
                            for (var i = indexes.length - 1; i > -1; i--) {
                                selTenant.Locations.splice(indexes[i], 1);
                            }
                        }
                    };
                    for (var _a = 0, selectedTenants_4 = selectedTenants; _a < selectedTenants_4.length; _a++) {
                        var selTenant = selectedTenants_4[_a];
                        _loop_5(selTenant);
                    }
                }
            }
        }
        return selectedTenants;
    };
    LocationFilterService.prototype.getAllTenantLocations = function (view) {
        if (view) {
            if (this.registeredComponents.has(view)) {
                //let copy: Tenant[] = this.deepCopyTenants(this.registeredComponents.get(view));
                //return copy; //TSR
                return this.registeredComponents.get(view);
            }
        }
        return null;
    };
    LocationFilterService.prototype.getBackupTenantLocations = function (view) {
        if (view) {
            if (this.backupRegisteredComponents.has(view)) {
                var copy = this.deepCopyTenants(this.backupRegisteredComponents.get(view));
                this.setTenantPriority(copy);
                if (this.registeredComponents.has(view)) {
                    this.registeredComponents.set(view, copy);
                }
                return copy;
            }
        }
        return null;
    };
    LocationFilterService.prototype.getTenant = function (view, tenantId) {
        if (view && tenantId) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                var tenant = tenants.filter(function (t) { return t.Id === tenantId; });
                if (tenant && tenant.length > 0) {
                    var newTenant = new Tenant(tenant[0]);
                    return newTenant;
                }
            }
        }
        return null;
    };
    LocationFilterService.prototype.getLocation = function (view, tenantId, locationId) {
        if (view && tenantId && locationId) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                var tenant = tenants.filter(function (t) { return t.Id === tenantId; });
                if (tenant.length > 0) {
                    if (tenant[0].Locations && tenant[0].Locations.length > 0) {
                        var loc = tenant[0].Locations.filter(function (location) { return location.Id === locationId; });
                        if (loc.length > 0) {
                            var newLoc = new Location(loc[0]);
                            return newLoc;
                        }
                    }
                }
            }
        }
        return null;
    };
    LocationFilterService.prototype.getAllLocationIDs = function (view) {
        var allLocIDs = [];
        if (view) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (var _i = 0, tenants_8 = tenants; _i < tenants_8.length; _i++) {
                    var tenant = tenants_8[_i];
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        var locIDs = tenant.Locations.map(function (l) {
                            return l.Id;
                        });
                        allLocIDs = allLocIDs.concat(locIDs);
                    }
                }
            }
        }
        return allLocIDs;
    };
    LocationFilterService.prototype.getSelectedLocationIDs = function (view) {
        var selectedLocIDs = [];
        if (view) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (var _i = 0, tenants_9 = tenants; _i < tenants_9.length; _i++) {
                    var tenant = tenants_9[_i];
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        var selectedLocs = (tenant.Locations.filter(function (l) { return l.Selected; }));
                        var locIDs = selectedLocs.map(function (l) {
                            return l.Id;
                        });
                        selectedLocIDs = selectedLocIDs.concat(locIDs);
                    }
                }
            }
        }
        return selectedLocIDs;
    };
    LocationFilterService.prototype.getSelectedLocations = function (view) {
        var selectedLocations = [];
        if (view) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (var _i = 0, tenants_10 = tenants; _i < tenants_10.length; _i++) {
                    var tenant = tenants_10[_i];
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        var selectedLocs = (tenant.Locations.filter(function (l) { return l.Selected; }));
                        for (var _a = 0, selectedLocs_1 = selectedLocs; _a < selectedLocs_1.length; _a++) {
                            var location_1 = selectedLocs_1[_a];
                            selectedLocations.push(location_1);
                        }
                    }
                }
            }
        }
        return selectedLocations;
    };
    LocationFilterService.prototype.getSelectedTenantIDs = function (view) {
        var selectedTenantIDs = [];
        if (view) {
            var tenants = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (var _i = 0, tenants_11 = tenants; _i < tenants_11.length; _i++) {
                    var tenant = tenants_11[_i];
                    if ((tenant.Selected) || ((tenant.Locations) && (tenant.Locations.length > 0) && ((tenant.Locations.filter(function (l) { return l.Selected; })).length > 0)))
                        selectedTenantIDs.push(tenant.Id);
                }
            }
        }
        return selectedTenantIDs;
    };
    LocationFilterService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [AlarmService,
            UserService])
    ], LocationFilterService);
    return LocationFilterService;
}());
export { LocationFilterService };
//# sourceMappingURL=location-filter.service.js.map