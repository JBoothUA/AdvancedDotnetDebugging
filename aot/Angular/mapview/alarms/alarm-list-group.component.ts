import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AlarmService } from '../../alarms/alarm.service';
import { AlarmSort } from '../../alarms/alarm-sort.class';
import { Alarm } from '../../alarms/alarm.class';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';

@Component({
    selector: 'alarm-list-group',
	templateUrl: 'alarm-list-group.component.html',
    animations: [
        slideDown
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AlarmListGroup {
    @Input() alarms: Alarm[];
    @Input() multiSelect: boolean;
    @Input() groupName: string;
    @Input() groupSelection: string;
	@Input() sortOrder: string;
	@Input() mapViewOptions: MapViewOptions;
    expandedState: string;
	alarmList: Alarm[];
	toggleDisplay: string = 'Select';
	currentlyToggling: boolean = false;
	priorityColor: string = 'hidden';

	constructor(private alarmService: AlarmService, private alarmSort: AlarmSort) {
	}

    ngOnInit(): void {
		this.expandedState = this.expandedState || 'out';
		this.priorityColor = this.getPriorityColorClass();
    }

    getPriorityColorClass(): string {
        if (this.groupSelection === 'Priority') {
            let priority = this.alarmService.convertPriorityNameToNum(this.groupName);
            if (priority) {
                return 'p' + priority;
            }
        }
        return 'hidden';
    }

    toggleExpandedGroup(): void {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
	}

	trackByAlarmFn(index: number, alarm: Alarm) {
		return alarm.Id;
	}

    buildAlarmList(): void {
		let alarmList: Alarm[] = [];

		for (let alarm in this.alarms) {
            // If alarm is part of this group, include it
            if (this.alarmSort.getGroupName(this.alarms[alarm], this.groupSelection) === this.groupName) {
                alarmList.push(this.alarms[alarm]);
            }
		}

		this.alarmList = this.alarmSort.sortAlarms(alarmList, this.sortOrder);
	}

	toggleAllAlarmsInGroup(): void {
		event.stopPropagation();
		this.currentlyToggling = true;

		let toggleOn = (this.toggleDisplay === 'Select');
		this.toggleDisplay = (this.toggleDisplay === 'Select') ? 'Unselect' : 'Select';

		for (let alarm in this.alarmList) {
			if (toggleOn) {
				this.alarmService.selectAlarm(this.alarmList[alarm].Id, true, false);
			} else {
				this.alarmService.deSelectAlarm(this.alarmList[alarm].Id, true);
			}
		}
		
		this.currentlyToggling = false;
	}

	ngOnChanges(changes: any): void {
		if (changes.alarms && !this.currentlyToggling) {
			this.buildAlarmList();

			// Toggle to 'Unselect'
			let allSelected = true;
			for (let alarm of this.alarmList) {
				if (!alarm.Selected) {
					allSelected = false;
					break;
				}
			}

			if (allSelected) {
				this.toggleDisplay = 'Unselect';
			} else {
				this.toggleDisplay = 'Select';
			}
		}
    }
}