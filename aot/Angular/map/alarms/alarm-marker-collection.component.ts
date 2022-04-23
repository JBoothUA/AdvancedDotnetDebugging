import { Component, Input, NgZone, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { AlarmService } from '../../alarms/alarm.service';
import { MapService } from '../map.service';
import { AlarmMapService } from '../alarms/alarmMap.service';
import { AlarmMarkerSort } from '../alarms/alarm-marker-sort';
import { Alarm } from '../../alarms/alarm.class';
import { OverlappingAlarms } from '../alarms/overlapping-alarms.component';
import { LocationFilterService } from '../../shared/location-filter.service';
import { PlatformService } from '../../platforms/platform.service';

class markerGroup {
    groupName: string;
    alarms: Alarm[];
}

@Component({
    selector: 'alarm-marker-collection',
    templateUrl: 'alarm-marker-collection.component.html',
    providers: [AlarmMarkerSort],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmMarkerCollection {
    @Input() alarms: Alarm[];
    @Input() alarmService: AlarmService;

    groups: markerGroup[];

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: MapService, private alarmMarkerSort: AlarmMarkerSort,
                private alarmMapService: AlarmMapService, private changeDetectorRef: ChangeDetectorRef,
                private locationFilterService: LocationFilterService, private platformService: PlatformService) {
    }

    ngOnInit(): void {
        this.alarmService.editedAlarm
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarm) => this.editedAlarm(alarm)
            });
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (mapContext) => this.alarmSelectionChanged(mapContext)
            });
        this.alarmMapService.zoomChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (zoom) => {
                    if (!this.alarmMapService.manualZoomMode) {
                        if (zoom >= 10) {
                            this.alarmMapService.showAlarmMarkers();                           
                        } else {
                            this.alarmMapService.hideAlarmMarkers();
                            this.changeDetectorRef.detectChanges();
                        }
                    }
                }
            });
        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    // When platform selection changed, update all selected alarms to recalculate z-index
                    let selAlarms = this.alarmService.getSelectedAlarms();

                    for (let selAlarm of selAlarms) {
                        this.alarmMapService.refreshMarker(this.alarmMapService.getAlarmMarkerId(selAlarm));
                    }
                }
            });
    }

    editedAlarm(alarm: Alarm): void {
        let groupName = this.alarmMapService.getAlarmMarkerId(alarm);

        for (let group in this.groups) {
            if (this.groups[group].groupName === groupName) {
                let index = this.indexOf(alarm.Id, this.groups[group].alarms);

                if (index === -1) {
                    return;
                }

                this.alarmMapService.updateGroupMarker(this.groups[group].groupName, this.groups[group].alarms);
                break;
            }
        }

        this.alarmMarkerSort.sortAlarmMarkers(this.groups);
    }

    indexOf(id: string, array: any[]) {
        for (let i = 0; i < array.length; i += 1) {
            if (array[i].Id === id) {
                return i;
            }
        }
        return -1;
    }

    groupAlarms(): void {
        let alarmGroups: string[] = [];

        for (let index in this.alarms) {
            if (this.alarms[index].Position !== null) {
                let groupName = this.alarmMapService.getAlarmMarkerId(this.alarms[index]);
                if (alarmGroups[groupName] === undefined) {
                    alarmGroups[groupName] = [this.alarms[index]];
                } else {
                    alarmGroups[groupName].push(this.alarms[index]);
                }
            }
        }

        let groupedAlarms = Object.keys(alarmGroups).map(groupName => ({ groupName, alarms: alarmGroups[groupName] }));

        this.alarmMarkerSort.sortAlarmMarkers(groupedAlarms);

        this.groups = groupedAlarms;
        this.changeDetectorRef.detectChanges();
    }

    alarmSelectionChanged(mapContext: boolean): void {
        if (!mapContext) {
            this.alarmMapService.fitMarkers(this.alarmService.getSelectedAlarms());
        }
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes.alarms.previousValue && (changes.alarms.currentValue && changes.alarms.currentValue.length !== changes.alarms.previousValue.length) || changes.alarms.firstChange) {
            this.groupAlarms();
        }
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}