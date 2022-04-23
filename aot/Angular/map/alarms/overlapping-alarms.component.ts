import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'overlapping-alarms',
    templateUrl: 'overlapping-alarms.component.html'
})

export class OverlappingAlarms {
    groupName: string;
    alarms: Alarm[];
    visible: boolean;
    groupList: number[];
    @Input() alarmService: AlarmService;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private mapService: AlarmMapService, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.groupName = undefined;
        this.alarms = [];
        this.visible = false;
    }

    ngAfterViewInit(): void {
        this.mapService.openOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: (obj) => this.open(obj.groupName, obj.alarms)
        });
        this.mapService.refreshOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: (groupName) => this.refresh(groupName)
        });
        this.mapService.closeOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: (groupName) => this.close(groupName)
        });
        this.mapService.forceCloseOverlappingAlarmsSub.takeUntil(this.ngUnsubscribe).subscribe({
            next: () => this.closeWindow()
        });
    }

    open(groupName: string, alarms: Alarm[]): void {
        if (this.mapService.visibleMarkers) {
            this.alarms = alarms;
            this.groupName = groupName;
            this.visible = true;
            this.buildGroupList();
            this.changeDetectorRef.markForCheck();
        }
    }

    refresh(groupName: string): void {
        if (groupName === this.groupName) {
            this.buildGroupList();
            this.changeDetectorRef.markForCheck();
        }
    }

    close(groupName: string): void {
        if (groupName === this.groupName) {
            this.closeWindow();
        }
    }

    closeWindow(): void {
        if (this.visible) {
            this.visible = false;
            this.mapService.deSelectGroupMarker(this.groupName);
            this.groupName = undefined;
            for (let alarm of this.alarms) {
                this.alarmService.deSelectAlarm(alarm.Id, false, false);
            }
            this.alarms = [];
            this.changeDetectorRef.detectChanges();
        }
    }

    buildGroupList(): void {
        let groupList: number[] = [];
        let oneSelected = false;
        let overlapSelected = false;

        for (let alarm in this.alarms) {
            if (!groupList.includes(this.alarms[alarm].Priority)) {
                groupList.push(this.alarms[alarm].Priority);
            }
            if (!overlapSelected && this.alarms[alarm].OverlapSelected) {
                overlapSelected = true;
            }
        }

        if (!overlapSelected) {
            let highestPriority = this.mapService.getHighestPriorityAlarm(this.alarms.filter((value) => { return value.Selected; }));
            if (highestPriority) {
                this.alarmService.selectOverlapAlarm(highestPriority.Id);
            } 
        }

        groupList.sort(function (a, b) {
            let res = 0;

            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            }

            return res;
        });

        this.groupList = groupList;
    }

    center(): void {
        this.mapService.panToAlarmMarker(this.groupName);
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}