import { Component, ViewChild } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Alarm } from './alarm.class';
import { Modal } from '../shared/modal.component';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';

@Component({
	selector: 'clear-alarms-dialog',
	templateUrl: 'clear-dialog.component.html'
})
export class ClearAlarmsDialog {
	alarms: Alarm[];
	unackAlarms: Alarm[];
    @ViewChild(Modal) clearAlarmsModal: Modal;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private alarmService: AlarmService) {
        this.alarmService.clearingAlarms
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (alarms) => this.show(alarms)
            });
	}

	show (alarms: Alarm[]) {
		this.alarms = alarms;
		this.unackAlarms = [];
		for (let alarm of this.alarms) {
			if (!alarm.Acknowledged) {
				this.unackAlarms.push(alarm);
			}
		}

		this.clearAlarmsModal.show();
	}

	hide () {
		this.clearAlarmsModal.hide();
	}

    clearAlarms() {
        this.alarmService.clearAlarms(this.alarms);
		this.hide();
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}