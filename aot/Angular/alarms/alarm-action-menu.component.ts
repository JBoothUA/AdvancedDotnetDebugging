import { Component, Input, ElementRef } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Alarm } from './alarm.class';

@Component({
    selector: 'alarm-action-menu',
    templateUrl: 'alarm-action-menu.component.html'
})
export class AlarmActionMenu {
    visible: boolean = false;
    @Input() alarm: Alarm;
    @Input() callback: any;

    constructor(public alarmService: AlarmService, private elementRef: ElementRef) { }

    ngOnInit(): void {
        L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);
    }

    acknowledgeAlarms(): void {
        this.alarmService.acknowledgeAlarms(this.alarm);
        if (this.callback) {
            this.callback();
        }
    }

    clearAlarms(): void {
        this.alarmService.clearAlarmsWithConfirmation(this.alarm);
        if (this.callback) {
            this.callback();
        }
    }

    dismissAlarms(): void {
        this.alarmService.dismissAlarmsWithConfirmation(this.alarm);
        if (this.callback) {
            this.callback();
        }
	}

	allSelectedAreAcknowledged(): boolean {
		let allAckd = true;
		let selectedAlarms = this.alarmService.getSelectedAlarms();
		for (let alarm of selectedAlarms) {
			if (!alarm.Acknowledged) {
				allAckd = false;
				break;
			}
		}

		return allAckd;
	}
}