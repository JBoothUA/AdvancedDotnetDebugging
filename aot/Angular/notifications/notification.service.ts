import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

@Injectable()
export class NotificationService {
	notifications: any = [];
	isNotificationPanelVisible: boolean = false;
	isNotificationPopupVisible: boolean = false;

    constructor() {
		this.loadNotifications();
	}

	toggleNotificationPanel() {
		this.isNotificationPanelVisible = !this.isNotificationPanelVisible;
		this.isNotificationPopupVisible = false;
	}

	loadNotifications() {
	}

	handleMessage(message: string): void {
		this.add(message);
	}

	add(notification: any): void {
	}

	convertDateDisplay(date: string, dateOnly?: boolean): string {
		let val1 = '';
		let val2 = '';
		if (moment().isSame(date, 'day')) {
			val1 = 'Today';
		} else if (moment().subtract(1, 'day').isSame(date, 'day')) {
			val1 = 'Yesterday';
		} else {
			val1 = moment(date).format('M/D/YY');
		}

		if (dateOnly) {
			return val1;
		}

		if (val1 !== '') {
			val2 = ' - ';
		}
		val2 += moment(date).format('h:mm:ssa');

		return val1 + val2;
	}
}