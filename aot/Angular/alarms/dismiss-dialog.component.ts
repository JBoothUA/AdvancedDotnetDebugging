import { Component, ViewChild } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Alarm } from './alarm.class';
import { Modal } from '../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'dismiss-alarms-dialog',
	templateUrl: 'dismiss-dialog.component.html'
})
export class DismissAlarmsDialog {
	alarms: Alarm[];
	unackAlarms: Alarm[];
	isCustomDismissAlarmReason: boolean = false;
	dismissAlarmReason: string = 'No threat observed.';
	customDismissAlarmReason: string = null;
    @ViewChild(Modal) dismissAlarmsModal: Modal;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private alarmService: AlarmService) {
        this.alarmService.dismissingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarms) => this.show(alarms)
            });
	}

	show(alarms: Alarm[]) {
		this.alarms = alarms;
		this.unackAlarms = [];
		for (let alarm of this.alarms) {
			if (!alarm.Acknowledged) {
				this.unackAlarms.push(alarm);
			}
		}

		// Reset Dialog
		this.isCustomDismissAlarmReason = false;
		this.dismissAlarmReason = 'No threat observed.';
		this.customDismissAlarmReason = null;		

		this.dismissAlarmsModal.show();
	}

    hide() {
		this.dismissAlarmsModal.hide();
	}

	prepareCustomDismissAlarmReason() {
		this.dismissAlarmReason = null;
		this.isCustomDismissAlarmReason = true;
	}

	dismissAlarms() {
		this.alarmService.dismissAlarms(this.alarms, this.isCustomDismissAlarmReason ? this.customDismissAlarmReason : this.dismissAlarmReason);
		this.hide();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}