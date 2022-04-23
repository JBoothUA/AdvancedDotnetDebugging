import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { Location } from '../../shared/location.class';
import { LocationMapService } from './locationMap.service';
import { LocationFilterService } from '../../shared/location-filter.service';

@Component({
    selector: 'location-marker-collection',
    templateUrl: 'location-marker-collection.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationMarkerCollection {
    @Input() locations: Location[];
    @Input() locationFilterChanged: boolean = false;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: LocationMapService, private locationService: LocationFilterService,
                private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.mapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (zoom) => {
                    if (zoom >= 10) {
                        this.mapService.hideLocationMarkers();
                    } else {
                        this.mapService.showLocationMarkers();
                    }
                }
            });
    }

    ngAfterViewInit(): void {
        if (this.mapService.getMapZoom() >= 10) {
            this.mapService.hideLocationMarkers();
        }
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes.locations && this.locationFilterChanged) {
            // Allow time for the markers to be added/removed before fitting them
            setTimeout(() => { this.mapService.fitMarkers() }, 200);
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}