import { Component, Input } from '@angular/core';
import { Alarm } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';
import { slideDown } from '../../shared/animations';
import { NavigationService } from '../../shared/navigation.service';

@Component({
	selector: 'alarm-table',
	templateUrl: 'alarm-table.component.html',
	animations: [
		slideDown
    ]
})
export class AlarmTable {
    @Input() alarms: Alarm[];
    @Input() showBadge: boolean = true;
    @Input() showPriorityLine: boolean = false;
    @Input() itemClass: string = '';
    @Input() headerClass: string = '';
    @Input() subheaderClass: string = '';
    @Input() checkSelectionFunc: (alarm: Alarm) => boolean;
    @Input('onClick') onClickFunc: (alarm: Alarm, event: any) => void;
    @Input('onContextMenu') onContextMenuFunc: (alarm: Alarm, event: any) => void;
    @Input() headerText: string = 'Selected Alarms';
	@Input() scrollingGroups: boolean = true;
	expandedState: string;

    constructor(private alarmService: AlarmService, private navigationService: NavigationService) {
	}

	ngOnInit(): void {
		this.expandedState = this.expandedState || 'out';
	}

	trackByAlarmFn(index: number, alarm: Alarm) {
		return alarm.Id;
	}

	toggleExpandedGroup(): void {
		this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
	}

	getHighestPriority(): string {
		if (this.alarms && this.alarms.length) {
			let highestPriority = this.alarms.sort(function (a, b) {
				return a.Priority - b.Priority;
			})[0].Priority;
			return 'p' + (highestPriority === 0 ? 1 : highestPriority);
		}

		return '';
    }

    checkSelection(alarm: Alarm): boolean {
        if (this.checkSelectionFunc) {
            return this.checkSelectionFunc(alarm);
        } else {
            return false;
        }
    }

	onclick(alarm: Alarm, event: any): void {
        if (this.onClickFunc) {
            this.onClickFunc(alarm, event);
        }
	}

	goToAlarm(alarm: Alarm): void {
        event.stopPropagation();

        this.navigationService.navigate('/MapView/Alarms', alarm.Id);
	}

    onContextMenu(alarm: Alarm, event: any): void {
        if (this.onContextMenuFunc) {
            this.onContextMenuFunc(alarm, event);
        }
    }
}