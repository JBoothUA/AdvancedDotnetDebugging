import { Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { Platform } from '../../platforms/platform.class';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../map.service';
import { PlatformMapService } from './platformMap.service';
import { AlarmService } from '../../alarms/alarm.service';
import { MapViewOptions } from '../../shared/map-view-options.class';

@Component({
    selector: 'platform-marker-collection',
    templateUrl: 'platform-marker-collection.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlatformMarkerCollection {
	@Input() platforms: Platform[];
	@Input() mapViewOptions: MapViewOptions;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: MapService, private platformService: PlatformService, private platformMapService: PlatformMapService,
                private changeDetectorRef: ChangeDetectorRef, private alarmService: AlarmService) {

        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    // When alarm selection changes, update all platform markers so that their z-index is recalculated
                    let selPlatform = this.platformService.getSelectedPlatform();
                    if (selPlatform) {
                        this.platformMapService.refreshMarker(this.getMarkerId(selPlatform.id)); 
                    }
                }
            });
        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platformId) => this.platformSelected(platformId)
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
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (platform) => {
                    this.changeDetectorRef.detectChanges();
                }
            });
    }

    platformSelected(platformId: string): void {
        if (platformId)
            this.platformMapService.panIfOutOfView(this.getMarkerId(platformId));
    }

    getMarkerId(platformId: string): string {
        return platformId + '-marker';
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}