import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
	OnInit
} from '@angular/core';

import { PatrolTemplate, PatrolType, AreaType } from '../patrols/patrol.class';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolBuilderService } from './patrol-builder.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { slideDown } from '../shared/animations';
import { LocationFilterService } from '../shared/location-filter.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { MapUtilityService } from '../map/map-utility.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { Tenant } from '../shared/tenant.class';

@Component({
	selector: 'patrol-builder-step1',
	templateUrl: 'patrol-builder-step1.component.html',
	styleUrls: ['patrol-builder-step1.component.css'],
	animations: [
		slideDown
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolBuilderStep1 implements OnInit {

	defaultStepTitle: string = "Patrol Details";
	@Input() step1Completed: boolean;
	@Input() patrol: PatrolTemplate;
	@Input() expandedState: string;
	@Output() onStep1Completed = new EventEmitter();
    @Output() onPatrolBuilderCancelled = new EventEmitter();
    @Output() onToggleExpandedGroup = new EventEmitter<string>();
	PatrolType: typeof PatrolType = PatrolType;
	AreaType: typeof AreaType = AreaType;

	private ngUnsubscribe: Subject<void> = new Subject<void>();
	public showRobotsAlarms: boolean;
	public isReadOnly: boolean;

	constructor(
		private patrolService: PatrolService,
		private patrolBuilderService: PatrolBuilderService,
		private patrolMapService: PatrolMapService,
		private alarmMapService: AlarmMapService,
		private platformMapService: PlatformMapService,
		private locationMapService: LocationMapService,
		private locFilterService: LocationFilterService,
		private mapUtilityService: MapUtilityService,
        private changeRef: ChangeDetectorRef) {
        
    }

    public setToggleState(state: string): void {
        this.expandedState = state;
        this.changeRef.detectChanges();
    }

	toggleExpandedGroup(): void {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';

        this.onToggleExpandedGroup.next(this.expandedState);
	}

	ngOnInit(): void {
		this.expandedState = this.expandedState || 'out';
        this.showRobotsAlarms = false;
        this.alarmMapService.manualZoomMode = true;
        this.platformMapService.manualZoomMode = true;

		if (this.step1Completed === true) {
			this.isReadOnly = false;
		}
		else {
			this.isReadOnly = false;
		}
	}

    ngAfterViewInit() {
        this.platformMapService.hidePlatformMarkers();
        this.alarmMapService.hideAlarmMarkers();
		if (this.patrol.TenantId && this.patrol.LocationId) {
			let mvTenants: Tenant[] = this.locFilterService.getAllTenantLocations('mapview');
			let patrolTenantId = this.patrol.TenantId;
			let patrolLocationId = this.patrol.LocationId;
			let found: boolean = false;
			if (mvTenants && mvTenants.length > 0) {
				for (let mvTenant of mvTenants) {
					if (mvTenant.Id === patrolTenantId) {
						for (let mvLoc of mvTenant.Locations) {
							if (mvLoc.Id === patrolLocationId) {
								found = true;
								break;
							}
						}
					}
				}
			}

			if (found) {
//				if (mvTenants && mvTenants.length === 1 && mvTenants[0].Locations && mvTenants[0].Locations.length === 1) {
					this.locFilterService.setTenantLocation('pbview', this.patrol.TenantId, this.patrol.LocationId);
//				}
			}
		}
		// Subscribe to action definition selection events
		this.locFilterService.locationsChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (view) => {
					this.locationChanged(view);
				}
			});
	}
	ngOnDestroy(): void {
		if (this.showRobotsAlarms === false) {
			this.alarmMapService.showAlarmMarkers();
			this.platformMapService.showPlatformMarkers();
            this.showRobotsAlarms = true;
            this.alarmMapService.manualZoomMode = false;
            this.platformMapService.manualZoomMode = false;
		}

		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	getStepTitle(): string {
		if (!this.patrol || this.expandedState === 'out' || !this.patrolBuilderService.isStep1Completed(this.patrol))
			return (this.defaultStepTitle);
		else {
			let areaTypeStr = "";
			switch (this.patrol.AreaType) {
				case AreaType.Large:
					areaTypeStr = "Large Area";
					break;
				case AreaType.Perimeter:
					areaTypeStr = "Perimeter";
					break;
				case AreaType.Small:
					areaTypeStr = "Small Area";
					break;
				default:
					break;
			}
			return (this.patrol.DisplayName + " - " + areaTypeStr);
		}
	}

	public disableNext(): boolean {
		return (!this.patrolBuilderService.isStep1Completed(this.patrol));
	}

	public gotoStep2() {
		this.toggleExpandedGroup();
		this.onStep1Completed.emit(true);
	}

	public cancelBuilder() {
		this.patrolMapService.clearPatrol();
		this.onPatrolBuilderCancelled.emit(true);
	}

	public showRobotsAlarmsChanged(event: any) {
        if (this.showRobotsAlarms === false) {
            this.alarmMapService.showAlarmMarkers();
            this.platformMapService.showPlatformMarkers();
            this.showRobotsAlarms = true;
		}
		else {
            this.alarmMapService.hideAlarmMarkers();
            this.platformMapService.hidePlatformMarkers();
            this.showRobotsAlarms = false;
		}
	}

	public locationChanged(view: any) {
		if (view === 'pbview') {
			let tenant: Tenant[] = this.locFilterService.getSelectedTenantLocations(view);
			if (tenant && tenant.length > 0) {
				this.patrol.TenantId = tenant[0].Id;
				this.patrol.LocationId = tenant[0].Locations[0].Id;
				if (tenant[0].Locations[0].MapSettings && tenant[0].Locations[0].MapSettings.MapCenter) {
					let loc = this.mapUtilityService.convertPositionToLatLng(tenant[0].Locations[0].MapSettings.MapCenter);
					if (loc) {
						this.patrolMapService.map.setView(loc, tenant[0].Locations[0].MapSettings.ZoomLevel);
					}
				}
			}
		}
	}
}