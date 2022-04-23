import { Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { MapService } from './map.service';
import { AlarmMapService } from './alarms/alarmMap.service';
import { PlatformMapService } from './platforms/platformMap.service';
import { AlarmMarkerSort } from './alarms/alarm-marker-sort';
import { Alarm } from '../alarms/alarm.class';
import { Platform } from '../platforms/platform.class';
import { PatrolService } from '../patrols/patrol.service';
import { Location } from '../shared/location.class';
import { OverlappingAlarms } from './alarms/overlapping-alarms.component';
import { PatrolPath } from '../map/patrols/patrol-path.component';
import { PatrolTemplate, PatrolInstance } from '../patrols/patrol.class';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { LocationMapService } from '../map/locations/locationMap.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { MapViewOptions } from '../shared/map-view-options.class';
import { MapUtilityService } from '../map/map-utility.service';
import { MapCreateOptions, MapControlPositions } from '../shared/map-settings.class';

import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

//declare let robotMaps: any;

class markerGroup {
    groupName: string;
    alarms: Alarm[];
    platforms: Platform[];
}

@Component({
    selector: 'leaflet-map',
    templateUrl: 'leaflet-map.component.html',
    providers: [AlarmMarkerSort, MapUtilityService],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class LeafletMap {
    @Input() alarms: Alarm[] = [];
    @Input() platforms: Platform[] = [];
    @Input() locations: Location[] = [];
    @Input() mapElementId: string;
    @Input() heightElementId: string;
    @Input() alarmService: AlarmService;
    @Input() showPatrols: boolean = true;
    @Input() showOverlappingAlarms: boolean = false;
    @Input() zoom: number;
    @Input() center: [number, number];
    @Input() zoomControl: boolean = true;
    @Input() scrollWheelZoom: boolean = true;
    @Input() dragging: boolean = true;
    @Input() showAttribution: boolean = true;
	@Input() locationView: string;
	@Input() mapViewOptions: MapViewOptions;
    @ViewChild('mapElement') mapElement: ElementRef;
    patrol: PatrolTemplate = new PatrolTemplate(null);
    groups: markerGroup[];
    locationFilterChanged: boolean = false;
    firstLocationFilterChange: boolean = true;

    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(protected mapService: MapService, protected zone: NgZone, public patrolMapService: PatrolMapService,
                protected platformService: PlatformService, protected alarmMapService: AlarmMapService, protected platformMapService: PlatformMapService,
                protected changeDetectorRef: ChangeDetectorRef, protected elementRef: ElementRef, protected locationMapService: LocationMapService,
				protected locationFilterService: LocationFilterService,
                protected mapUtilityService: MapUtilityService,
                protected patrolService: PatrolService) {
    }

    //A easy hook
    public onInit(map: L.Map):void {}

    ngOnInit(): void {
        if (this.locationView) {
            this.locationFilterService.locationsChanged
                .takeUntil(this.ngUnsubscribe)
                .subscribe({
                    next: (view) => this.filterChanged(view)
                });

            this.locations = this.locationFilterService.getSelectedLocations(this.locationView);
			for (let ii = this.locations.length - 1; ii >= 0; ii--) {
				if (!this.locations[ii].MapSettings || (this.locations[ii].MapSettings && !this.locations[ii].MapSettings.MapCenter)) {
					this.locations.splice(ii, 1);
				}
			}
		}

        $(() => {
            // Leaflet map requires a set height. Calculate height based upon a specified element if a heightElementId is provided
            if (this.heightElementId) {
                this.refreshMap();

                $(window).on('resize', (e) => {
                    this.refreshMap();
                });
            } 
		});

		let mapOptions = new MapCreateOptions();
		mapOptions.AttributionControl = this.showAttribution;
		mapOptions.ZoomControl = this.zoomControl;
		mapOptions.ZoomControlPosition = MapControlPositions.TopLeft;
		mapOptions.ScrollWheelZoom = this.scrollWheelZoom;
		mapOptions.Dragging = this.dragging;
		mapOptions.Keyboard = this.dragging;
		mapOptions.DoubleClickZoom = false;
		mapOptions.MinZoom = 4;
        mapOptions.MaxZoom = 28;

        if (this.zoom) {
            mapOptions.Zoom = this.zoom;
        }

        let center = this.getCenter();
        if (center) {
            mapOptions.Center = new L.LatLng(center[0], center[1]);
        }

		let map = this.mapUtilityService.createMap(this.mapElementId, mapOptions, (() => { this.showLocationMarkers(map); }));

		this.setMaps(map);
        this.onInit(map);
	}

	showLocationMarkers(map: L.Map) {
		if (map.getZoom() >= 10) {
			this.locationMapService.hideLocationMarkers();
			this.alarmMapService.showAlarmMarkers();
			if (map.getZoom() >= 19) {
				this.platformMapService.showPlatformMarkers();
			}
		}
		else {
			this.locationMapService.showLocationMarkers();
			this.alarmMapService.hideAlarmMarkers();
			this.platformMapService.hidePlatformMarkers();
		}
	}
	refreshMap(): void {
        $('#' + this.mapElementId).height($('#' + this.heightElementId).height());
        this.mapService.refreshMap();
    }

    getCenter(): [number, number] {
        return this.center;
    }

    setMaps(map: L.Map): void {
        this.mapService.setMap(map);
        this.patrolMapService.setMap(map);
        this.alarmMapService.setMap(map);
        this.platformMapService.setMap(map);
        this.locationMapService.setMap(map);
    }

    filterChanged(view: string): void {
        if (this.locationView && this.locationView === view) {
            // Location filter was updated, so create location markers and fit in map view
            this.locations = this.locationFilterService.getSelectedLocations(this.locationView);
			// Remove locations with no map center data
			for (let ii = this.locations.length - 1; ii >= 0; ii--) {
				if (!this.locations[ii].MapSettings || (this.locations[ii].MapSettings && !this.locations[ii].MapSettings.MapCenter)) {
					this.locations.splice(ii, 1);
				}
			}
            if (this.firstLocationFilterChange) {
                this.firstLocationFilterChange = false;
            } else {
                this.locationFilterChanged = true;
            }
            this.changeDetectorRef.detectChanges();
        }
    }

    ngOnDestroy(): void {
		this.mapService.destroyMap();
		this.mapService.setMap(null);
		this.patrolMapService.setMap(null);
		this.alarmMapService.setMap(null);
		this.platformMapService.setMap(null);
		this.locationMapService.setMap(null);

        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    indexOf(id: string, array: any[]) {
        for (var i = 0; i < array.length; i += 1) {
            if (array[i].Id === id) {
                return i;
            }
        }
        return -1;
    }

    zoomToMapLocation(location: Location) {
        if (location && location.MapSettings && location.MapSettings.MapCenter) {
            this.mapService.zoomToMapLocation(location.MapSettings.MapCenter, location.MapSettings.ZoomLevel);
        }

    }
}