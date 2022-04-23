import { Component, Input, trigger, state, style, animate, transition } from '@angular/core';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmMapService } from './alarmMap.service';
import { slideDown } from '../../shared/animations';

@Component({
    selector: 'overlapping-alarms-group',
    templateUrl: 'overlapping-alarms-group.component.html',
    animations: [
        slideDown
    ]
})

export class OverlappingAlarmsGroup {
    @Input() groupName: number;
    @Input() alarms: Alarm[];
    @Input() alarmService: AlarmService;
	alarmList: Alarm[];

	constructor(private mapService: AlarmMapService) { }

	clickedAlarm: (alarm: Alarm, event: any) => void = (alarm: Alarm, event: MouseEvent) => {
		if (!alarm.Selected) {
			this.alarmService.handleClickAlarm(alarm, event, true);
		} else {
			// This overlapping group should never unselect the ONLY selected alarm from the group.
			let lastSelected = true;
			for (let overlappingAlarm of this.alarmList) {
				if (overlappingAlarm.Selected && overlappingAlarm.Id !== alarm.Id) {
					lastSelected = false;
					break;
				}
			}

			if (!lastSelected) {
				this.alarmService.handleClickAlarm(alarm, event, true);
			}
		}		
	}

    contextMenuAlarm: (alarm: Alarm, event: any) => void = (alarm: Alarm, event: any) => {
        event.preventDefault();
        this.alarmService.openAlarmActionMenu(alarm, event);
    }

    buildAlarmList(): void {
        var alarmList: Alarm[] = this.alarms.filter(alarm => alarm.Priority === this.groupName);

        alarmList.sort(function (a, b) {
            var res = 0;

            if (a.ReportedTime !== null && b.ReportedTime !== null) {
                if (a.ReportedTime < b.ReportedTime) {
                    res = 1;
                } else if (a.ReportedTime > b.ReportedTime) {
                    res = -1;
                }
            } else if (a.ReportedTime === null) {
                res = 1;
            } else if (b.ReportedTime === null) {
                res = -1;
            }

            return res;
        });

        this.alarmList = alarmList;
    }

    ngOnChanges(changes: any): void {
        if (changes.alarms) {
            this.buildAlarmList();
        }
    }

    checkSelection(alarm: Alarm): boolean {
        return alarm.Selected;
    }

    getHeaderText() {
        let header: string;

        switch (this.groupName) {
            case 1:
                header = 'Critical Priority';
                break;
            case 2:
                header = 'High Priority';
                break;
            case 3:
                header = 'Medium Priority';
                break;
            case 4:
                header = 'Low Priority';
                break;
            default:
                header = 'Unknown';
        }

        return header + ' (' + this.alarmList.length + ')';
    }
}