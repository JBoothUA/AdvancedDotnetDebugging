import { Injectable } from '@angular/core';
import { Location } from '../shared/location.class';
import { Tenant } from '../shared/tenant.class';
import { Subject } from 'rxjs/Subject';

import { AlarmService } from '../alarms/alarm.service';
import { Alarm } from '../alarms/alarm.class';
import { UserService } from './user.service';

@Injectable()
export class LocationFilterService {
	//will hold the default set of tenants 
	//that's associated with the User object
	private tenants: Tenant[] = [];
	private registeredComponents: Map<string, Tenant[]> = new Map<string, Tenant[]>();
	private backupRegisteredComponents: Map<string, Tenant[]> = new Map<string, Tenant[]>();
	private locationHeader: string = '';

    locationsChanged: Subject<any> = new Subject();
    locationsUpdated: Subject<any> = new Subject();
    onZoomToLocation: Subject<Location> = new Subject();
	private ngUnsubscribe: Subject<void> = new Subject<void>();

	constructor(private alarmService: AlarmService,
		        private userService: UserService) {
		//NOTE: The Tenant/Loation model from the User Service must be mapped into the 
		//      location-filter Tenant and Location Classes because Selected and Prioty flags 
		//      are added to the model.
		let t = this.userService.currentUser.tenant;
		let ct = this.userService.currentUser.childTenants;

		if (t != null) {
			let parentTenant = new Tenant(t);
			this.tenants.push(parentTenant);
		}

		if (ct != null) {
			for (let cTenant of ct) {
				let childTenant = new Tenant(cTenant);
				this.tenants.push(childTenant);
			}
		}

		// Subscribe to get alarm notifications
		this.alarmService.alarmsLoaded
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
                next: (status) => {
                    if (status) {
                        this.updateTenantPriority();
                    }
                }
			});
		this.alarmService.newAlarm
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (alarm) => this.updateTenantPriority()
			});
		this.alarmService.removedAlarm
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (alarm) => this.updateTenantPriority()
			});

	}

	public ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	//////////////////////////////////////////////
	//Notification Methods
	//////////////////////////////////////////////
	updateTenantPriority(): void {
		let alarms = this.alarmService.alarms;
		this.registeredComponents.forEach(function (value, key) {
			let view: string = key;
			let tenants: Tenant[] = value;
			for (let tenant of tenants) {
				if ((tenant.Locations) && (tenant.Locations.length > 0)) {
					for (let locations of tenant.Locations) {
						let lPriorityAlarms: Alarm[] = alarms.filter(a => ((a.TenantId == tenant.Id) && (a.LocationId == locations.Id)));
						let lPriority: number = 0;
						if (lPriorityAlarms.filter(a => a.Priority === 1).length > 0)
							lPriority = 1;
						else if ((lPriorityAlarms.filter(a => a.Priority === 2).length > 0) && (lPriority == 0))
							lPriority = 2;
						else if ((lPriorityAlarms.filter(a => a.Priority === 3).length > 0) && (lPriority == 0))
							lPriority = 3;
						else if ((lPriorityAlarms.filter(a => a.Priority === 4).length > 0) && (lPriority == 0))
							lPriority = 4;
						else if (lPriority == 0)
							lPriority = 5; //5 means the location is in a normal state with no alarms

						locations.Priority = lPriority.toString();
					}
				}
			}
            this.locationsUpdated.next(view);         
		}, this);
	}

	//////////////////////////////////////////////
	//Component Methods
	//////////////////////////////////////////////

	//registers a view (UI area - i.e. map view, dashboard, patrol builder) with the location service
    registerComponent(view: string, multiselect: boolean, defaultSelection: boolean = true): boolean {
		//make sure there is a valid view
		if (view) {
			//make sure the view is not already registered
			//if so, just return true
			if (!this.registeredComponents.has(view)) {
				//add the view to the registered component collection
				//with default tenants settings
				let selectedTenants: Tenant[] = this.deepCopyTenants(this.tenants);//this.tenants.slice(0);

                if (defaultSelection) {
                    //make default selections - hard coded for now
                    //this may change in the future if user preferences are stored in the db
                    if (multiselect) {
                        //select all locations in the collection
                        for (let selTenant of selectedTenants) {
                            selTenant.Locations.map(function (x) {
                                x.Selected = true;
                            });
                            selTenant.Selected = true;
                        }
                    }
                    else {
                        //select the first location in the collection
                        //clear all selections
                        for (let selTenant of selectedTenants) {
                            selTenant.Locations.map(function (x) {
                                x.Selected = false;
                            });
                            selTenant.Selected = false;
                        }

                        for (let i = 0; i < selectedTenants.length; i++) {
                            if (selectedTenants[i].Locations.length > 0) {
                                selectedTenants[i].Locations[i].Selected = true;
                                break;
                            }
                        }
                    }
                } else {
                    //make sure none of the tenant locations are selected
                    for (let selTenant of selectedTenants) {
                        selTenant.Locations.map(function (x) {
                            x.Selected = false;
                        });
                        selTenant.Selected = false;
                    }
                }

				this.setTenantPriority(selectedTenants);
				this.registeredComponents.set(view, selectedTenants);

				//make a copy of registered components to revert back to if a user does a cancel
				let backupSelectedTenants: Tenant[] = this.deepCopyTenants(selectedTenants);
				this.backupRegisteredComponents.set(view, backupSelectedTenants);

                this.locationsChanged.next(view);
				return true;
			}
			else
				return true;
		}
		return false;
	}

	unregisterComponent(view: string) {
		//make sure there is a valid view
		if (view) {
			//make sure the view is not already registered
			//if so, just return true
			if (this.registeredComponents.has(view)) {
				this.registeredComponents.delete(view);
				this.backupRegisteredComponents.delete(view);
			}
		}
	}

	setTenantPriority(tenants: Tenant[]): void {
		let alarms = this.alarmService.alarms;
		for (let tenant of tenants) {
			if ((tenant.Locations) && (tenant.Locations.length > 0)) {
				for (let locations of tenant.Locations) {
					let lPriorityAlarms: Alarm[] = alarms.filter(a => ((a.TenantId == tenant.Id) && (a.LocationId == locations.Id)));
					let lPriority: number = 0;
					if (lPriorityAlarms.filter(a => a.Priority === 1).length > 0)
						lPriority = 1;
					else if ((lPriorityAlarms.filter(a => a.Priority === 2).length > 0) && (lPriority == 0))
						lPriority = 2;
					else if ((lPriorityAlarms.filter(a => a.Priority === 3).length > 0) && (lPriority == 0))
						lPriority = 3;
					else if ((lPriorityAlarms.filter(a => a.Priority === 4).length > 0) && (lPriority == 0))
						lPriority = 4;
					else if (lPriority == 0)
						lPriority = 5; //5 means the location is in a normal state with no alarms

					locations.Priority = lPriority.toString();
				}
			}
		}
	}

	deepCopyTenants(masterTenants: Tenant[]): Tenant[] {
		if (masterTenants) {
			let newTenants: Tenant[] = [];
			for (let tenant of masterTenants) {
				let newTenant: Tenant = new Tenant(tenant);
				newTenants.push(newTenant);
			}
			return newTenants;
		}
		return null;
	}

	setSelectedTenantLocations(view: string, selectedTenants: Tenant[]): void {
		if ((view) && (selectedTenants)) {
			if (this.registeredComponents.has(view)) {

                this.setTenantPriority(selectedTenants);

				//make a local copy so that changes in the compoents will not effect this copy
				//let copy: Tenant[] = this.deepCopyTenants(selectedTenants);
				//this.registeredComponents.set(view, copy);
				this.registeredComponents.set(view, selectedTenants); //TSR

				//make a copy of registered components to use to revert the selected items if a user does a cancel
				let copy2: Tenant[] = this.deepCopyTenants(selectedTenants);
				this.backupRegisteredComponents.set(view, copy2);

                this.locationsChanged.next(view);
			}
		}
	}

    setTenantLocation(view: string, tenantId: string, locationId: string): void {
        if (view && tenantId && locationId) {
            let tenants: Tenant[] = this.getAllTenantLocations(view);
            //clear out all current selections
            for (let tenant of tenants) {
                tenant.Selected = false;
                tenant.Locations.map(function (x) {
                    x.Selected = false;
                });
            }

            //select the tenant location passed in
            let tentant = tenants.filter(t => t.Id === tenantId);
            if (tentant.length > 0 && locationId) {
                if (tentant[0].Locations) {
                    let loc = tentant[0].Locations.filter(location => location.Id === locationId);
                    if (loc.length > 0) {
                        loc[0].Selected = true;
                    }
                }
            }

            //set the backup
            let copy: Tenant[] = this.deepCopyTenants(tenants);
            this.backupRegisteredComponents.set(view, copy);

            this.locationsChanged.next(view);
        } 
    }

    setSelectedLocationIDs(view: string, locationIds: string[]): void {
        if (view && locationIds) {
            //get all the tenants for the given view
            let tenants: Tenant[] = this.getAllTenantLocations(view);

            //clear out all current selections
            for (let tenant of tenants) {
                tenant.Selected = false;
                tenant.Locations.map(function (x) {
                    x.Selected = false;
                });
            }

            //select the tenant locations passed in
            for (let tenant of tenants) {

                let locations = tenant.Locations.filter(loc => locationIds.includes(loc.Id));
                for(let loc of locations)
                {
                    loc.Selected = true;
                }

                let selLoc = tenant.Locations.filter(location => !location.Selected);
                if (selLoc.length === 0)
                    tenant.Selected = true; //all locations are selected to selected the tenant as well
                else
                    tenant.Selected = false;

                //set the backup
                let copy: Tenant[] = this.deepCopyTenants(tenants);
                this.backupRegisteredComponents.set(view, copy);
            }

            this.locationsChanged.next(view);
        }
    }

	getSelectedTenantOrLocations(view: string): Tenant[] {
		let selectedTenants: Tenant[] = [];
		if (view) {
			if (this.registeredComponents.has(view)) {
				//let tenants: Tenant[] = this.deepCopyTenants(this.registeredComponents.get(view));
				let tenants: Tenant[] = this.registeredComponents.get(view);//TSR

				//get the tenants that have selected items in it
				if (tenants) {
					for (let tenant of tenants) {
						if ((tenant.Selected) || ((tenant.Locations) && ((tenant.Locations.filter(l => l.Selected)).length > 0)))
							selectedTenants.push(tenant);
					}
				}
			}
		}
		return selectedTenants;
	}

    getSelectedTenantLocations(view: string): Tenant[] {
        let selectedTenants: Tenant[] = [];
        if (view) {
            if (this.registeredComponents.has(view)) {
                let tenants: Tenant[] = this.deepCopyTenants(this.registeredComponents.get(view));
                //let tenants: Tenant[] = this.registeredComponents.get(view);//TSR

                //get the tenants that have selected items in it
                if (tenants && tenants.length > 0) {
                    for (let tenant of tenants) {
                        if ((tenant.Selected) || ((tenant.Locations) && (tenant.Locations.length > 0) && ((tenant.Locations.filter(l => l.Selected)).length > 0)))
                            selectedTenants.push(tenant);
                    }

                    for (let selTenant of selectedTenants)
                    {
                        let indexes: number[] = [];
                        selTenant.Locations.forEach(function (item, index) {
                            if (!item.Selected)
                                indexes.push(index);
                        });

                        if (indexes.length > 0)
                        {
							for (let i = indexes.length-1; i > -1; i--)
                            {
                                selTenant.Locations.splice(indexes[i], 1);
                            }
                        }
                    }
                }
            }
        }
        return selectedTenants;
    }

	getAllTenantLocations(view: string): Tenant[] {
		if (view) {
			if (this.registeredComponents.has(view)) {
				//let copy: Tenant[] = this.deepCopyTenants(this.registeredComponents.get(view));
				//return copy; //TSR
				return this.registeredComponents.get(view);
			}
		}
		return null;
	}

	getBackupTenantLocations(view: string): Tenant[] {
		if (view) {
			if (this.backupRegisteredComponents.has(view)) {
                let copy: Tenant[] = this.deepCopyTenants(this.backupRegisteredComponents.get(view));
                this.setTenantPriority(copy);
				if (this.registeredComponents.has(view)) {
					this.registeredComponents.set(view, copy);
				}
				return copy;
			}
		}
		return null;
	}

	getTenant(view: string, tenantId: string): Tenant {
		if (view && tenantId) {
            let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                let tenant: Tenant[] = tenants.filter(t => t.Id === tenantId);
                if (tenant && tenant.length > 0) {
					let newTenant: Tenant = new Tenant(tenant[0]);
					return newTenant;
				}
			}
		}
		return null;
	}

	getLocation(view: string, tenantId: string, locationId: string): Location {
		if (view && tenantId && locationId) {
			let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                let tenant: Tenant[] = tenants.filter(t => t.Id === tenantId);
				if (tenant.length > 0) {
                    if (tenant[0].Locations && tenant[0].Locations.length > 0) {
                        let loc: Location[] = tenant[0].Locations.filter(location => location.Id === locationId);
						if (loc.length > 0) {
							let newLoc: Location = new Location(loc[0]);
							return newLoc;
						}
					}
				}
			}
		}
		return null;
	}

    getAllLocationIDs(view: string): string[] {
        let allLocIDs: string[] = [];
        if (view) {
            let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (let tenant of tenants) {
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        let locIDs = tenant.Locations.map(function (l) {
                            return l.Id;
                        });
                        allLocIDs = allLocIDs.concat(locIDs);
                    }
                }
            }
        }
        return allLocIDs;
    }

	getSelectedLocationIDs(view: string): string[] {
		let selectedLocIDs: string[] = [];
		if (view) {
			let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (let tenant of tenants) {
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        let selectedLocs = (tenant.Locations.filter(l => l.Selected));
                        let locIDs = selectedLocs.map(function (l) {
                            return l.Id;
                        });
                        selectedLocIDs = selectedLocIDs.concat(locIDs);
                    }
				}
			}
		}
		return selectedLocIDs;
    }

    getSelectedLocations(view: string): Location[] {
        let selectedLocations: Location[] = [];
        if (view) {
            let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
                for (let tenant of tenants) {
                    if (tenant.Locations && tenant.Locations.length > 0) {
                        let selectedLocs = (tenant.Locations.filter(l => l.Selected));
                        for (let location of selectedLocs) {
                            selectedLocations.push(location);
                        }
                    }
                }
            }
        }
        return selectedLocations;
    }

	getSelectedTenantIDs(view: string): string[] {
		let selectedTenantIDs: string[] = [];
		if (view) {
			let tenants: Tenant[] = this.getAllTenantLocations(view);
            if (tenants && tenants.length > 0) {
				for (let tenant of tenants) {
                    if ((tenant.Selected) || ((tenant.Locations) && (tenant.Locations.length > 0) && ((tenant.Locations.filter(l => l.Selected)).length > 0)))
						selectedTenantIDs.push(tenant.Id);
				}
			}
		}
		return selectedTenantIDs;
	}
}