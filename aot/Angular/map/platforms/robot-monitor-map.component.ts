import { LeafletMap } from '../leaflet-map.component';
import {
    Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef,
    ElementRef, SimpleChange, Output, EventEmitter
} from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { PlatformService } from '../../platforms/platform.service';
import { MapService } from '../map.service';
import { AlarmMapService } from '../alarms/alarmMap.service';
import { PlatformMapService } from '../platforms/platformMap.service';
import { Platform } from '../../platforms/platform.class';
import { PatrolPath } from '../patrols/patrol-path.component';
import { PatrolMapService } from '../patrols/patrolMap.service';
import { PatrolService } from '../../patrols/patrol.service';
import { MapUtilityService } from '../map-utility.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'robot-monitor-map',
    templateUrl: 'robot-monitor-map.component.html',
    styleUrls: ['robot-monitor-map.component.css', '../../shared/video-box.component.css'],
    // Provide MapService and PlatformMapService so that we have a new instance of them
    providers: [MapService, PatrolMapService, MapUtilityService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RobotMonitorMap extends LeafletMap {
    @Input() platform: Platform;
    @Input() mapElementId: string = 'map';
    @Input() zoom: number = 21;
    @Input() zoomControl: boolean = false;
    @Input() scrollWheelZoom: boolean = false;
    @Input() dragging: boolean = false;
    @Input() showAttribution: boolean = false;
    @Input() isMapLocked: boolean = false;

    @Output() onMapLockedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    public setIsMapLocked(isLocked: boolean):void {
        this.isMapLocked = isLocked;

        if (!this.robotMap) {
            return;
        }

        if (this.isMapLocked) {
            this.robotMap.dragging.disable();
            this.robotMap.touchZoom.disable();
            this.robotMap.doubleClickZoom.disable();
            this.robotMap.scrollWheelZoom.enable();
            this.robotMap.boxZoom.disable();
            this.robotMap.keyboard.disable();
            if (this.robotMap.tap) this.robotMap.tap.disable();
            document.getElementById('map').style.cursor = 'default';

            this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
        } else {
            this.robotMap.dragging.enable();
            this.robotMap.touchZoom.enable();
            this.robotMap.doubleClickZoom.disable();
            this.robotMap.scrollWheelZoom.enable();
            this.robotMap.boxZoom.enable();
            this.robotMap.keyboard.enable();
            if (this.robotMap.tap) this.robotMap.tap.enable();
            document.getElementById('map').style.cursor = 'grab';
        }

        this.onMapLockedChanged.emit(this.isMapLocked);

    }

    private firstMove: boolean = true;

    private robotMap: L.Map;

    public onInit(map: L.Map): void {
        map.on('zoomend', () => {
            if (this.isMapLocked) {
                this.panToPlatform();
            }
        });

        this.setIsMapLocked(this.isMapLocked);
    }

    public panToPlatform(): void {
        this.platformMapService.panTo(this.platformMapService.getMarker(this.getMarkerId()));
    }

    setMaps(map: L.Map): void {
        this.patrolMapService.scaleFactor = .5;
        this.patrolMapService.refreshOptions();

        this.mapService.setMap(map);
        this.platformMapService.setMap(map);
        this.patrolMapService.setMap(map);

        this.robotMap = map;

        this.setIsMapLocked(this.isMapLocked);
     
        this.platformService.onEditedPlatform
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: (platform) => {
                if (platform.id === this.platform.id) {
                    this.changeDetectorRef.detectChanges();
                }
            }
        });
        
    }

    getCenter(): [number, number] {
        if (this.platform) {
            return [this.platform.Position.coordinates[1], this.platform.Position.coordinates[0]];
        } else {
            return this.center;
        }
    }

    getMarkerId(): string {
        return 'pf-marker-' + this.platform.id;
    }

    handleMove(): void {
        if (this.firstMove) {
            this.platformMapService.zoomToPlatformMarker(this.getMarkerId());
            this.firstMove = false;
        }

        if (this.isMapLocked) {
            this.panToPlatform();
        }
    }

    ngOnDestroy(): void {

		this.mapService.destroyMap();
		//this.mapService.setMap(null);
		//this.platformMapService.setMap(null);
		//this.patrolMapService.setMap(null);

        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }): void {
        
        if (changes.isMapLocked) {
            this.setIsMapLocked(this.isMapLocked);
        }

        if (changes.platform) {
            this.platforms = [this.platform];
            setTimeout(() => {
                if (this.platform && this.platform.PatrolTemplateSubmittedId) {
                    this.patrolService.toggleSelectedPatrol(this.platform.PatrolTemplateSubmittedId, true);
                } else{
                    this.patrolService.toggleSelectedPatrol(null, true);
                }
            });
            
        }
    }
}