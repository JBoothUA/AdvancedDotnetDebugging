import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';

@Component({
    selector: 'alarm-marker-group',
    templateUrl: 'alarm-marker-group.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmMarkerGroup {
    @Input() alarms: Alarm[];
    @Input() groupName: string;
    @Input() alarmService: AlarmService;

    selected: boolean;
    childSelected: boolean;
    prevent: boolean;
    delay: number;
    timer: NodeJS.Timer;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: AlarmMapService, private changeDetectorRef: ChangeDetectorRef) {
        this.selected = false;
        this.childSelected = false;

        // Click -> Dbl Click facilitation
        this.prevent = false;
        this.delay = 200;
        this.timer = null;
    }

    ngOnInit(): void {
        this.alarmService.selectionChanged
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => this.selectionChanged()
            });
        this.mapService.deSelectGroupSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (groupName) => this.deselectGroup(groupName)
            });
    }

    grouped(): boolean {
        return this.alarms.length > 1;
    }

    groupedAlarmSelected(): boolean {
        var res = false;

        for (var alarm in this.alarms) {
            if (this.alarms[alarm].OverlapSelected) {
                // If alarm is selected in overlapping alarms dialog, show it instead of group icon
                res = true;
                break;
            }
        }

        return res;
    }

    ngAfterViewInit(): void {
        if (this.groupName !== 'Unknown') {
            this.mapService.createAlarmGroupMarker(this.groupName, this.alarms);
        }

        this.checkGroupSelection();
    }

    highestPriority(): number {
        return this.mapService.getHighestPriority(this.alarms);
    }

    select(event: MouseEvent): void {
        // Delay click action to allow dblclick to occur
        this.timer = setTimeout(() => {
            if (!this.prevent) {
                if (this.selected) {
                    if (event.ctrlKey) {
                        for (let alarm in this.alarms) {
                            if (this.alarms[alarm].Selected) {
                                this.alarmService.deSelectAlarm(this.alarms[alarm].Id, true);
                            }
                        }
                    } else {
                        this.alarmService.deSelectAllAlarms();
                    }
                } else {
                    if (!this.childSelected) {
                        if (event.ctrlKey) {
                            this.alarmService.selectAlarm(this.mapService.getHighestPriorityAlarm(this.alarms).Id, true);
                        } else {
                            let id = this.mapService.getHighestPriorityAlarm(this.alarms).Id;
                            this.alarmService.selectOnlyAlarm(id, true);
                        }
                    } else {
                        this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
                    }
                }

                this.changeDetectorRef.markForCheck();
            }
            this.prevent = false;
        }, this.delay);
    }

    zoomTo(): void {
        clearTimeout(this.timer);
        this.prevent = true;

        this.mapService.zoomToAlarmMarker(this.groupName);
        this.alarmService.selectOnlyAlarm(this.mapService.getHighestPriorityAlarm(this.alarms).Id);
    }

    changeSelectionState(state: boolean): void {
        if (state !== this.selected) {
            this.selected = state;

            if (this.selected) {
                // Open the overlapping alarms dialog for this group
                if (this.alarms.length > 1) {
                    this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
                }
            } else {
                this.mapService.closeOverlappingAlarms(this.groupName);
            }
            this.changeDetectorRef.markForCheck();
        }
    }

    checkChildSelection(): void {
        let childSelected = false;

        for (let alarm in this.alarms) {
            if (this.alarms[alarm].Selected) {
                childSelected = true;
                break;
            }
        }

        if (this.childSelected !== childSelected) {
            this.childSelected = childSelected;

            // If child selection has changed, update the group marker so that the cluster marker will be highlighted
            this.mapService.updateGroupMarker(this.groupName, this.alarms);
            this.changeDetectorRef.markForCheck();
        }
    }

    checkGroupSelection(): void {
        // Alarm selection has changed. If no alarms in the group are selected, deselect the group
        let found = false;
        let selectedAlarms = this.alarmService.getSelectedAlarms();

        // Determine if an alarm is selected that is in this group
        for (let alarm in selectedAlarms) {
            let groupName = this.mapService.getAlarmMarkerId(selectedAlarms[alarm]);
            if (groupName === this.groupName) {
                found = true;
                break;
            }
		}

		this.changeSelectionState(found);
        this.checkChildSelection();
    }

    selectionChanged(): void {
        this.checkGroupSelection();
    }

    ngOnChanges(changes: any): void {
        if (changes.alarms) {
            if (this.selected) {
                if (this.alarms.length > 1) {
                    this.mapService.openOverlappingAlarms(this.groupName, this.alarms);
                } else {
                    this.mapService.closeOverlappingAlarms(this.groupName);
                }
            } else {
                this.mapService.closeOverlappingAlarms(this.groupName);
            }
        }
    }

    deselectGroup(groupName: string): void{
        if (this.groupName === groupName) {
            this.selected = false;
        }
    }

    ngOnDestroy(): void {
        this.mapService.removeAlarmMarker(this.groupName);
        this.mapService.closeOverlappingAlarms(this.groupName);
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}