import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

import { Alarm } from './alarm.class';
import { Position } from './../shared/shared-interfaces';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { AppSettings } from '../shared/app-settings';
import { GetAlarmMarkerId } from '../map/alarms/alarmMap.service';
import { HubService, Hubs } from '../shared/hub.service';
import { Observable } from 'rxjs/Observable';

interface AlarmState {
	Id: string;
	Selected: boolean;
	OverlapSelected: boolean;
	Expanded: boolean;
}

@Injectable()
export class AlarmService {
    alarms: Alarm[];
    filteredAlarms: Alarm[] = [];
    groupSelection: string = 'Location';
	sortOrder: string = 'asc';
	alarmApiBaseUrl: string = '/alarms/';
    mapViewStates: AlarmState[];
    selectedLocations: string[] = [];

    alarmsLoaded: Subject<any> = new BehaviorSubject<boolean>(false);
	newAlarm: Subject<any> = new Subject();
	editedAlarm: Subject<any> = new Subject();
	removedAlarm: Subject<any> = new Subject();
	clearingAlarms: Subject<any> = new Subject();
	dismissingAlarms: Subject<any> = new Subject();
	selectionChanged: Subject<any> = new Subject();
	alarmSelected: Subject<any> = new Subject();
	openAlarmActionMenuSub: Subject<any> = new Subject();
    refreshTimerSub: Subject<any> = new Subject();

    protected ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(protected httpService: HttpService, protected userService: UserService, protected locationFilterPipe: LocationFilterPipe,
        protected appSettings: AppSettings, protected hubService: HubService) {
        this.alarms = [];
        this.hubService.onAlarmHubConnected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: () => {
                    this.loadAlarms();
                }
            });

        this.hubService.onAlarmMessage
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (msg) => {
                    this.handleMessage(msg);
                }
            });
	}

	public loadAlarms() {
		this.alarms = [];
		let url = this.alarmApiBaseUrl + 'Active';
		return this.httpService.get(url).then((activeAlarms) => {
			for (let alarm of activeAlarms.Result) {
				// Map Location data into the Alarm
				if (alarm.LocationId) {
					for (let location of this.userService.currentUser.tenant.Locations || []) {
						if (alarm.LocationId === location.Id) {
							alarm.Location = location;
							break;
						}
					}
				}

				// Add alarms directly so that we do not get the newAlarm event multiple times
                let index = this.indexOf(alarm.Id, this.alarms);
				if (index === -1) {
					this.alarms.push(new Alarm(alarm));
				}
			}

            console.log('Active Alarms (' + this.alarms.length + ')', this.alarms);
            this.filterAlarms();
            this.alarmsLoaded.next(true);
            this.hubService.setDataLoaded(Hubs.Alarm);
		});
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public loadAlarmsByIds(alarmIds: string[]): Promise<any>{
        let alarms: Alarm[] = [];
        let url = this.alarmApiBaseUrl + '?ids=' + alarmIds[0];

        if (alarmIds.length > 0) {
            for (let i in alarmIds) {
                url += '&ids=' + alarmIds[i];
            }
        }

        return this.httpService.get(url);
    }

    setSelectedLocations(locations: string[]): void {
        this.selectedLocations = locations;
    }

    getAlarms(): Alarm[] {
        return this.filteredAlarms;
    }

    filterAlarms(): void {
        this.filteredAlarms = [];

        if (this.alarms) {
            //apply Location Filter
            this.filteredAlarms = this.locationFilterPipe.transform(this.alarms, this.selectedLocations);
        }
	}

	getAlarmById(id: string) {
		for (let alarm of this.alarms) {
			if (alarm.Id === id) {
				return alarm;
			}
		}
		return null;
	}

	handleMessage(message: string): void {
		this.upsert(message);
	}

	add(alarm: any): void {
		let alarmObj = new Alarm(alarm);
		this.alarms.push(alarmObj);

        if (this.selectedLocations.indexOf(alarmObj.LocationId) > -1) {
            // New alarm is in a selected location, so add it to the filtered alarms list
            this.filteredAlarms.push(alarmObj);
            this.newAlarm.next(alarmObj);
        }
	}

    remove(id: string): void {
        let index = this.indexOf(id, this.alarms);

        if (index > -1) {
            // alarm found, remove it
            this.alarms.splice(index, 1);

            let filterIndex = this.indexOf(id, this.filteredAlarms);
            if (filterIndex > -1) {
                // Alarm is in the filtered list, so remove it from there as well
                let alarm = this.filteredAlarms[filterIndex];
                this.filteredAlarms.splice(filterIndex, 1);
                this.removedAlarm.next(alarm);
            }
        }
	}

	indexOf(id: string, alarms: Alarm[]): number {
		for (let i = 0; i < alarms.length; i++) {
			if (alarms[i].Id === id) {
				return i;
			}
		}
		return -1;
	}

	upsert(alarm: any): void {
		if (alarm instanceof Array) {
			for (let a of alarm) {
                let index = this.indexOf(a.id, this.alarms);
				if (index === -1) {
					this.add(a);
				} else {
					this.edit(a);
				}
			}
		} else {
            let index = this.indexOf(alarm.id, this.alarms);
			if (index === -1) {
				this.add(alarm);
			} else {
				this.edit(alarm);
			}
		}
	}

	edit(alarm: any): void {
        let index = this.indexOf(alarm.id, this.alarms);
		if (index === -1) {
			return;
		}

		let editAlarm = this.alarms[index];
		editAlarm.deserialize(alarm);

		// Remove Cleared and Dismissed alarms.
		if (editAlarm.State > 2) {
			this.remove(editAlarm.Id);
        } else {
            if (this.selectedLocations.indexOf(editAlarm.LocationId) > -1) {
                this.editedAlarm.next(editAlarm);
            }
		}
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

	convertPriorityName(name: number): string {
		switch (name) {
			case 1:
				return 'Critical';
			case 2:
				return 'High';
			case 3:
				return 'Medium';
			default:
				return 'Low';
		}
	}

	convertPriorityNameToNum(priority: string): number {
		switch (priority) {
			case 'Critical':
				return 1;
			case 'High':
				return 2;
			case 'Medium':
				return 3;
			case 'Low':
			default:
				return 4;
		}
	}

	convertStateName(name: number): string {
		switch (name) {
			case 1:
				return 'Reported';
			default:
				return 'Acknowledged';
		}
	}

	convertLocationDisplay(position: Position): string {
		let retVal = 'Unknown';
		if (position) {
			if (position.Coordinates) {
				if (position.Coordinates.length >= 2) {
					retVal = position.Coordinates['1'] + ', ' + position.Coordinates['0'];
				}
			}
		}
		return retVal;
	}

	convertUsernameToInitials(userId: string): string {
		if (!userId) {
			return '';
		}

		let retVal = '';
		let splitStr = userId.split(' ');
		$.each(splitStr, function(i, str) {
			if (i === 0 || i === splitStr.length - 1) {
				let val = str.split('');
				retVal += val[0];
			}
		});
		return retVal.toUpperCase();
	}

	getHighestPriorityAlarm(): Alarm {
		if (this.alarms && this.alarms.length) {
			return this.alarms.sort(function(a, b) {
				return a.Priority - b.Priority;
			})[0];
		}

		return null;
	}

	setExpandedItem(id: string): void {
		for (let alarm in this.alarms) {
			this.alarms[alarm].Expanded = (this.alarms[alarm].Id === id);
		}
    }

    getAlarmMarkerId(alarm: Alarm): string {
        return GetAlarmMarkerId(alarm);
    }

	selectAlarm(id: string, mapContext: boolean = false, notifySelected: boolean = true): void {
        let index = this.indexOf(id, this.alarms);
		if (index === -1) {
			return;
		}
		this.alarms[index].Selected = true;
        this.selectOverlapAlarm(id);
        this.appSettings.lastSelectedMarkerRefId = this.getAlarmMarkerId(this.alarms[index]);

		this.selectionChanged.next(mapContext);

		if (notifySelected) {
			this.alarmSelected.next(id);
		}
	}

	deSelectAlarm(id: string, mapContext: boolean = false, sendEvent: boolean = true): void {
        let index = this.indexOf(id, this.alarms);
		if (index === -1) {
			return;
		}

		let alarm = this.alarms[index];
		alarm.OverlapSelected = false;
		if (!alarm.Selected) {
			return;
		}

		alarm.Selected = false;
		if (sendEvent) {
			this.selectionChanged.next(mapContext);
		}
	}

	deSelectAllAlarms(mapContext: boolean = false): void {
		for (let alarm in this.alarms) {
			this.alarms[alarm].Selected = false;
			this.alarms[alarm].OverlapSelected = false;
		}
		this.selectionChanged.next(mapContext);
	}

	deSelectAllOverlap(): void {
		for (let alarm in this.alarms) {
			this.alarms[alarm].OverlapSelected = false;
		}
	}

    selectOnlyAlarm(id: string, mapContext: boolean = false, notifySelected: boolean = true): void {
		for (let alarm in this.alarms) {
			this.alarms[alarm].Selected = (this.alarms[alarm].Id === id);
			this.alarms[alarm].OverlapSelected = (this.alarms[alarm].Id === id);
        }
        this.appSettings.lastSelectedMarkerRefId = this.getAlarmMarkerId(this.getAlarmById(id));;
		this.selectionChanged.next(mapContext);
		if (notifySelected) {
			this.alarmSelected.next(id);
		}
	}

	selectOverlapAlarm(id: string): void {
		for (let alarm in this.alarms) {
			this.alarms[alarm].OverlapSelected = (this.alarms[alarm].Id === id);
		}
	}

    getSelectedAlarms(): Alarm[] {
		let alarms = this.getAlarms();
		let selectedAlarms: Alarm[] = [];
		for (let alarm in alarms) {
			if (alarms[alarm].Selected) {
				selectedAlarms.push(alarms[alarm]);
			}
		}

		return selectedAlarms;
	}

    getSelectedAlarmsCount(): number {
		let alarms = this.getAlarms();
		let count: number = 0;
		for (let alarm in alarms) {
			if (alarms[alarm].Selected) {
				count++;
			}
		}

		return count;
	}

	acknowledgeAlarms(alarm: Alarm): void {
		let alarmIds: string[] = [];

		if (!alarm.Selected) {
			alarmIds.push(alarm.Id);
		} else {
			let selectedAlarms = this.getSelectedAlarms();
			if (!selectedAlarms || !selectedAlarms.length) {
				selectedAlarms = [alarm];
			}

			for (let index in selectedAlarms) {
				let curAlarm = selectedAlarms[index];
				if (!curAlarm.Acknowledged) {
					alarmIds.push(selectedAlarms[index].Id);
				}
			}
		}

		let url = this.alarmApiBaseUrl + 'Acknowledge?userId=' + this.userService.currentUser.name;
		this.httpService.put(url, alarmIds);
	}

	clearAlarms(alarms: Alarm[]): void {
		let alarmIds: string[] = [];

		for (let index in alarms) {
			let alarm = alarms[index];
			alarmIds.push(alarm.Id);
		}

		let url = this.alarmApiBaseUrl + 'Clear?userId=' + this.userService.currentUser.name;
		this.httpService.put(url, alarmIds);
	}

	clearAlarmsWithConfirmation(alarm: Alarm): void {
		let alarms: Alarm[] = [];

		if (!alarm.Selected) {
			alarms.push(alarm);
		} else {
			let selectedAlarms = this.getSelectedAlarms();
			if (!selectedAlarms || !selectedAlarms.length) {
				selectedAlarms = [alarm];
			}

			for (let index in selectedAlarms) {
				alarms.push(selectedAlarms[index]);
			}
		}

		this.clearingAlarms.next(alarms);
	}

	dismissAlarms(alarms: Alarm[], dismissReason: string): void {
		let alarmIds: string[] = [];

		for (let index in alarms) {
			let alarm = alarms[index];
			alarmIds.push(alarm.Id);
		}

		let msg = { AlarmIds: alarmIds, CommentText: dismissReason, UserId: this.userService.currentUser.name };
		let url = this.alarmApiBaseUrl + 'Dismiss';
		this.httpService.put(url, msg);
	}

	dismissAlarmsWithConfirmation(alarm: Alarm): void {
		let alarms: Alarm[] = [];

		if (!alarm.Selected) {
			alarms.push(alarm);
		} else {
			let selectedAlarms = this.getSelectedAlarms();
			if (!selectedAlarms || !selectedAlarms.length) {
				selectedAlarms = [alarm];
			}

			for (let index in selectedAlarms) {
				alarms.push(selectedAlarms[index]);
			}
		}

		this.dismissingAlarms.next(alarms);
	}

	addComment(alarmId: string, comment: string): void {
		let url = this.alarmApiBaseUrl + alarmId + '/AddComment?userId=' + this.userService.currentUser.name;
		this.httpService.put(url, comment, null);
	}

	openAlarmActionMenu(alarm: Alarm, event: any): void {
		this.openAlarmActionMenuSub.next({alarm, event});
	}

	handleClickAlarm(alarm: Alarm, event: MouseEvent, mapContext: boolean = false): void {
		if (alarm.Selected) {
			if (event.ctrlKey) {
				this.deSelectAlarm(alarm.Id, mapContext);
			} else {
				// if more than one alarm is selected, only select this one
				if (this.getSelectedAlarmsCount() > 1) {
					this.selectOnlyAlarm(alarm.Id, mapContext);
				} else {
					// This is the only alarm selected, so deselect it
					this.deSelectAlarm(alarm.Id, mapContext);
				}
			}
		} else {
			if (!event.ctrlKey) {
				this.selectOnlyAlarm(alarm.Id, mapContext);
			} else {
				this.selectAlarm(alarm.Id, mapContext);
			}
		}
	}

	persistMapViewAlarmStates(): void {
		this.mapViewStates = [];
		for (let alarm of this.alarms) {
			this.mapViewStates.push({
				Id: alarm.Id,
				Selected: alarm.Selected,
				OverlapSelected: alarm.OverlapSelected,
				Expanded: alarm.Expanded
			});

			alarm.Selected = false;
			alarm.OverlapSelected = false;
			alarm.Expanded = false;
		}
	}

	restoreMapViewAlarmStates(): void {
		if (this.mapViewStates) {
			for (let state of this.mapViewStates) {
				// If alarm still exists, restore its previous state
                let index = this.indexOf(state.Id, this.alarms);
				if (index === -1) {
					continue;
				}

				this.alarms[index].Selected = state.Selected;
				this.alarms[index].Expanded = state.Expanded;
				this.alarms[index].OverlapSelected = state.OverlapSelected;

				this.mapViewStates = [];
			}
		} else {
			for (let alarm in this.alarms) {
				this.alarms[alarm].Selected = false;
				this.alarms[alarm].Expanded = false;
				this.alarms[alarm].OverlapSelected = false;
			}
		}
	}
}