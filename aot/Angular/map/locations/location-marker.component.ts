import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Location } from '../../shared/location.class';
import { LocationMapService } from './locationMap.service';
import { AlarmService } from '../../alarms/alarm.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'location-marker',
    templateUrl: 'location-marker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationMarker {
    @Input() location: Location;
    @Input() markerId: string;
    highestPriority: number = 10;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: LocationMapService, private alarmService: AlarmService, private changeDetectorRef: ChangeDetectorRef) { }

    ngAfterViewInit(): void {
        this.mapService.createLocationMarker(this.markerId, this.location);

        this.alarmService.newAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.changeDetectorRef.detectChanges()
            });
        this.alarmService.removedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.changeDetectorRef.detectChanges()
            });
        this.alarmService.alarmsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (status) => {
                    if (status) {
                        this.changeDetectorRef.detectChanges();
                    }
                }
            });
    }

    getImageSrc(): string {
        let highestPriority: number = 10;

        for (let alarm of this.alarmService.alarms) {
            if (alarm.LocationId === this.location.Id) {
                if (alarm.Priority < highestPriority) {
                    highestPriority = alarm.Priority;
                }
                break;
            }
        }

        if (highestPriority !== 10) {
            return `/Content/Images/Leaflet/location-p${highestPriority}-alarms.png`;
        } else {
            return '/Content/Images/Leaflet/location-no-alarms.png';
        }
    }

    zoomToLocation(): void {
        this.mapService.zoomToLocation(this.markerId);
    }

    ngOnDestroy(): void {
        this.mapService.removeLocationMarker(this.markerId);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}