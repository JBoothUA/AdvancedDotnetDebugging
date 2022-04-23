import { LeafletMap } from '../../map/leaflet-map.component';
import {
    Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef,
    ElementRef, SimpleChange
} from '@angular/core';

import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../../map/map.service';
import { AlarmMapService } from '../../map/alarms/alarmMap.service';
import { PlatformMapService } from '../../map/platforms/platformMap.service';
import { DashboardPatrolService } from '../../dashboard/dashboard-patrol.service';

import { Platform } from '../../platforms/platform.class';
import { PatrolInstance } from '../../patrols/patrol.class';
import { Alarm } from '../../alarms/alarm.class';
import { PatrolPath } from '../../map/patrols/patrol-path.component';
import { PatrolMapService } from '../../map/patrols/patrolMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { LocationMapService } from '../../map/locations/locationMap.service';
import { LocationFilterService } from '../../shared/location-filter.service';
import { DashboardPatrolMapService } from './dashboard-patrol-map.service';
import { DashboardAlarmService } from '../../dashboard/dashboard-alarm.service';
import { MapUtilityService } from '../../map/map-utility.service';

@Component({
    selector: 'dashboard-patrol-map',
    templateUrl: 'dashboard-patrol-map.component.html',
    styleUrls: ['dashboard-patrol-map.component.css'],
    // Provide MapService and PlatformMapService so that we have a new instance of them
    providers: [MapService, PlatformMapService, AlarmMapService, MapUtilityService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPatrolMap extends LeafletMap {
    @Input() selectedPatrol: PatrolInstance;
    @Input() selectedPlatform: Platform;
    @Input() selectedPatrolAlarms: Alarm[];
    @Input() mapElementId: string = 'map';
    //@Input() zoom: number = 21;
    //@Input() zoomControl: boolean = false;
    //@Input() scrollWheelZoom: boolean = false;
    //@Input() dragging: boolean = false;
    //@Input() showAttribution: boolean = false;

    @Input() historical: boolean = false;

    constructor(protected mapService: MapService,
                protected zone: NgZone,
                public patrolMapService: DashboardPatrolMapService,
                protected platformService: PlatformService,
                protected alarmMapService: AlarmMapService,
                protected platformMapService: PlatformMapService,
                protected changeDetectorRef: ChangeDetectorRef,
                protected elementRef: ElementRef,
                protected locationMapService: LocationMapService,
                protected locationFilterService: LocationFilterService,
                public alarmService: DashboardAlarmService,
				public patrolService: DashboardPatrolService,
				protected mapUtilityService: MapUtilityService) {
        super(mapService, zone, patrolMapService, platformService, alarmMapService, platformMapService, changeDetectorRef, elementRef,
            locationMapService, locationFilterService, mapUtilityService, patrolService);
    }

    setMaps(map: L.Map): void {
        this.mapService.setMap(map);
        this.patrolMapService.setMap(map);
        this.alarmMapService.setMap(map);
        this.platformMapService.setMap(map);

        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    if (this.selectedPlatform) {
                        if (platform.id === this.selectedPlatform.id) {
                            this.changeDetectorRef.detectChanges();
                        }
                    }
                }
			});

		this.platformMapService.zoomChanged
			.takeUntil(this.ngUnsubscribe)
			.subscribe({
				next: (zoom) => {
					if (!this.platformMapService.manualZoomMode) {
						if (zoom >= 19) {
							this.platformMapService.showPlatformMarkers();
						} else {
							this.platformMapService.hidePlatformMarkers();
						}
					}
				}
			});

    }

    getCenter(): [number, number] {
        if (this.selectedPlatform) {
            return [this.selectedPlatform.Position.coordinates[1], this.selectedPlatform.Position.coordinates[0]];
        } else {
            return this.center;
        }
    }

    getMarkerId(): string {
        return 'pf-marker-' + this.selectedPlatform.id;
    }

    handleMove(): void {
        this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
    }

    ngOnDestroy(): void {
        this.mapService.destroyMap();
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    //ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
    //    if (changes.platform) {
    //        this.platforms = [this.selectedPlatform];
    //    }
    //}
}