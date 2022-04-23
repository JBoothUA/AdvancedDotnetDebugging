import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Tenant } from './tenant.class';
import { Location } from './location.class';
import { LocationFilterService } from './location-filter.service';
import { slideDown } from '../shared/animations';
import { Subject } from 'rxjs/Subject';
import { MapViewOptions } from '../shared/map-view-options.class';

@Component({
    selector: 'location-filter',
    templateUrl: 'location-filter.component.html',
    styleUrls: ['location-filter.component.css'],
    animations: [
        slideDown
    ]
})

export class LocationFilter {
    tenants: Tenant[];
    selectedTenant: Tenant = null;
    tenantLocationHeader: string = '';
    tenantLocationHeader_TenantName: string = '';
    tenantLocationHeader_LocationInfo: Location;
    tenantLocationFilters: any[] = [];
    expandedState: string = 'in';

    @Input() multiSelect: boolean;
	@Input() scView: string;
	@Input() mapViewOptions: MapViewOptions;
    @Input() showFilter: boolean;
    @Input() filterOverride: boolean;
    @Input() showButtons: boolean;
    @Input() readOnly: boolean;
    @Input() defaultSelection: boolean = true;
    @Input() allowZoomToLocation: boolean = true;

	private ngUnsubscribe: Subject<void> = new Subject<void>();

    ///////////////////////////////////////////
    //Core Component Methods
    ///////////////////////////////////////////
    constructor(private locationFilterService: LocationFilterService,
        private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        // register this component with the location-filter service so that 
        // the service can maintain state for the selected locations for the component (i.e. so that switching
        // between the dashboard and the map view will keep the users selection)
        if (this.locationFilterService.registerComponent(this.scView, this.multiSelect, this.defaultSelection)) {
            this.tenants = this.locationFilterService.getAllTenantLocations(this.scView);
            this.setLocationHeader();
            if (!this.multiSelect) {
                //make sure we hold on to the selected tenant from the this.tenants arrary so that when its changed,
                //its changing data in that array
                let selTenantId = this.locationFilterService.getSelectedTenantIDs(this.scView)[0];
                this.selectedTenant = this.tenants.filter(t => t.Id === selTenantId)[0];
            }
        }
    }

	ngAfterViewInit() {
		this.locationFilterService.locationsChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
                next: (view) => this.locationChanged(view)
            });

        this.locationFilterService.locationsUpdated
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (view) => this.locationChanged(view)
            });
    }

	ngOnDestroy(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

    locationChanged(view: any): void {

        if (!this.multiSelect) {
            //in single select mode
            //the tenant/location was set directly in the service
            //make sure we set the global selected tenant
            let tenant: Tenant[] = this.locationFilterService.getSelectedTenantOrLocations(view);
            if (tenant.length > 0) {
                this.selectedTenant = tenant[0];
            }
        }
        this.setLocationHeader();
        this.changeDetectorRef.detectChanges();
    }

    expandedViewState(): string {
        return this.expandedState;
    }

	toggleExpandedView(): void {
		if (this.mapViewOptions && !this.mapViewOptions.showLeftPanelContent) {
			this.showLastShownTab();
			this.mapViewOptions.showLeftPanelContent = true;
			return;
		}

		if (!this.readOnly) {
			this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
		}
	}

	showLastShownTab(): void {
		if (this.mapViewOptions.lastShownTab === 'Alarm') {
			this.mapViewOptions.showAlarmsTab = true;
			this.mapViewOptions.showPlatformsTab = false;
			this.mapViewOptions.showPatrolsTab = false;
		} else if (this.mapViewOptions.lastShownTab === 'Platform') {
			this.mapViewOptions.showAlarmsTab = false;
			this.mapViewOptions.showPlatformsTab = true;
			this.mapViewOptions.showPatrolsTab = false;
		} else {
			this.mapViewOptions.showAlarmsTab = false;
			this.mapViewOptions.showPlatformsTab = false;
			this.mapViewOptions.showPatrolsTab = true;
		}
	}

    setLocationHeader(): void {
        let parent: boolean = true;
        let totalTenantCount: number = 0;
        let totalSelTenantCount: number = 0;
        this.tenantLocationFilters = [];
        let tenantIndex: number = 0;

        for (let tenant of this.tenants) {
            totalTenantCount = totalTenantCount + tenant.Locations.length;
            let selectedLoc = (tenant.Locations.filter(c => c.Selected === true).length);

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
            parent = (this.tenants.filter(p => !p.Selected)).length > 0 ? false : true;
            if (parent) {
                // means all high level tenants are selected
                this.tenantLocationHeader = 'All Locations (' + totalTenantCount + ')';
                this.tenantLocationFilters = [];
            } else {
                if (totalSelTenantCount === 0) {
                    this.tenantLocationHeader = 'Choose Location';
                } else if (this.showFilter || totalSelTenantCount > 1 ) {
                    this.tenantLocationHeader = 'Showing (' + totalSelTenantCount + ') Locations';
                } else if (totalSelTenantCount === 1){
                    this.tenantLocationHeader = '';
                    let tenant = this.tenants.filter(t => t.Id === this.tenantLocationFilters[0].TenantId);
                    if (tenant && tenant.length) {
                        this.tenantLocationHeader_TenantName = tenant[0].CustomerName;
                        if (tenant[0].Locations && tenant[0].Locations.length) {
                            let location = tenant[0].Locations.filter(l => l.Selected);
                            if (location) {
                                this.tenantLocationHeader_LocationInfo = location[0];
                            }
                        }
                    }
                }
            }
        } else {
            //single select mode
            if (totalSelTenantCount === 0) {
                this.tenantLocationHeader = 'Choose Location';
            } else if (totalSelTenantCount === 1) {
                this.tenantLocationHeader = '';
                let tenant = this.tenants.filter(t => t.Id === this.tenantLocationFilters[0].TenantId);
                if (tenant && tenant.length ) {
                    this.tenantLocationHeader_TenantName = tenant[0].CustomerName;
                    if (tenant[0].Locations && tenant[0].Locations.length) {
                        let location = tenant[0].Locations.filter(l => l.Selected);
                        if (location) {
                            this.tenantLocationHeader_LocationInfo = location[0];
                        }
                    }
                }
            }
        }
    }

    locationSelected(tenId: Tenant, locId: Location): void {
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
            } else {
                if (tenId) {
                    // they toggled a specific location for a Tenant  
                    locId.Selected = !locId.Selected;
                    let selLoc: Location[] = tenId.Locations.filter(location => !location.Selected);
                    if (selLoc.length === 0)
                        tenId.Selected = true;
                    else
                        tenId.Selected = false;
                } else {
                    //TODO: this is an error
                }
            }
        } else {
            //single select mode
            if (tenId) {
                if (!locId) {
                    // they toggled the high level Tenant checkbox
                    // they can not do that in single select
                    return;
                }
                //unselect the previously selected tenant/location
                if (this.selectedTenant) {
                    let curSelLoc = this.selectedTenant.Locations.filter(location => location.Selected);
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
    }

    applySelectedLocations(): void {
        // set the selected customers on the dashboard service
        this.locationFilterService.setSelectedTenantLocations(this.scView, this.tenants); //notification is done by the service
        this.toggleExpandedView();
        this.setLocationHeader();
    }

    cancelSelectedLocations(): void {
        //the user canceled the selection - revert to previously selected tenants/locations
        this.tenants = this.locationFilterService.getBackupTenantLocations(this.scView);
        if (!this.multiSelect) {
            //make sure we hold on to the selected tenant from the this.tenants arrary so that when its changed,
            //its changing data in that array
            let selTenantId = this.locationFilterService.getSelectedTenantIDs(this.scView)[0];
            this.selectedTenant = this.tenants.filter(t => t.Id === selTenantId)[0];
        }
        this.toggleExpandedView();
        this.setLocationHeader();
    }

    removeSelectedLocationFilter(tenId: string): void {
        let tent: Tenant[];
        tent = this.tenants.filter(tenant => tenant.Id === tenId);
        tent[0].Locations.map(function (x) {
            x.Selected = false;
        });
        tent[0].Selected = false;

        this.locationFilterService.setSelectedTenantLocations(this.scView, this.tenants); //notification is done by the service
        this.setLocationHeader();
    }

    zoomToLocation(location: Location) {
        event.stopPropagation();
        this.locationFilterService.onZoomToLocation.next(location);
    }
}
