import { Injectable } from '@angular/core';
import { AlarmService } from './alarm.service';
import { Alarm } from './alarm.class';
import { Location } from './../shared/location.class';
import { LocationFilterService } from './../shared/location-filter.service';
import { PlatformService } from './../platforms/platform.service';
import { Platform } from './../platforms/platform.class';

@Injectable()
export class AlarmSort {
    constructor(private alarmService: AlarmService,
                private locationFilterService: LocationFilterService,
                private platformService: PlatformService) { }

    getGroupList(alarms: Alarm[], groupSelection: string, sortOrder: string): string[] {
        let groupList: string[] = [];

        for (let alarm in alarms) {
            let groupName = this.getGroupName(alarms[alarm], groupSelection);

            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }

        // Sort based upon group selection
        if (groupSelection === 'Created') {
            this.sortByCreated(groupList, sortOrder);
        } else if (groupSelection === 'Priority') {
            this.sortByPriority(groupList, sortOrder);
        } else {
            this.genericSort(groupList, sortOrder);
        }

        return groupList;
    }

    getGroupName(alarm: Alarm, groupSelection: string): string {
        let groupName: string;

		switch (groupSelection) {
			case 'Created':
				if (alarm[groupSelection]) {
					groupName = this.alarmService.convertDateDisplay(alarm[groupSelection]['Timestamp'].toString(), true);
				} else {
					groupName = 'Unknown';
				}
				break;
			case 'Priority':
				if (alarm[groupSelection]) {
					groupName = this.alarmService.convertPriorityName(alarm[groupSelection]);
				} else {
					groupName = 'None';
				}
				break;
			case 'Type':
				if (alarm[groupSelection]) {
					groupName = alarm[groupSelection]['Category'] + ' ' + alarm[groupSelection]['Condition'];
				} else {
					groupName = 'Unknown';
				}
				break;
			case 'State':
				if (alarm[groupSelection]) {
					groupName = this.alarmService.convertStateName(alarm[groupSelection]);
				} else {
					groupName = 'None';
				}
				break;
			case 'UserId':
				if (alarm[groupSelection]) {
					groupName = alarm[groupSelection];
				} else {
					groupName = 'None';
				}
                break;
            case 'Location':
                let loc: Location = this.locationFilterService.getLocation('mapview', alarm.TenantId, alarm.LocationId);

                if (!loc) {
                    groupName = 'Unknown';
                } else {
                    groupName = loc.Name
                }

                break;
            case 'RobotName':
                let platform: Platform = this.platformService.getPlatform(alarm.PlatformId);

                if (platform) {
                    groupName = platform.DisplayName;
                } else {
                    groupName = 'Unknown';
                }
             
                break;
			default:
				if (alarm[groupSelection]) {
					groupName = alarm[groupSelection];
				} else {
					groupName = 'None';
                }

				break;
		};

        return groupName;
    }

    sortByCreated(list: string[], sortOrder: string) {
        list.sort(function (a, b) {
            let res: number;

            if (a === b) {
                res = 0;
            } else if (a === 'Today') {
                res = 1;
            } else if (a === 'Unknown') {
                res = -1;
            } else if (b === 'Today') {
                res = -1;
            } else if (b === 'Unknown') {
                res = 1;
            } else {
                if (a === 'Yesterday') {
                    res = 1;
                }
                else if (b === 'Yesterday') {
                    res = -1;
                }
                else {
                    if (Date.parse(a) < Date.parse(b)) {
                        res = -1;
                    }
                    else {
                        res = 1;
                    }
                }
            }

            if (sortOrder === 'asc') {
                res = res * -1;
            }

            return res;
        });
    }

    sortByPriority(list: string[], sortOrder: string) {
        let self = this;
        list.sort(function (a, b) {
            let groupA = self.alarmService.convertPriorityNameToNum(a);
            let groupB = self.alarmService.convertPriorityNameToNum(b);
            let res = 0;;

            if (groupA < groupB) {
                res = 1;
            } else if (groupA > groupB) {
                res = -1;
            }

            if (sortOrder === 'asc') {
                res = res * -1;
            }

            // names must be equal
            return res;
        });
    }

    genericSort(list: string[], sortOrder: string) {
        list.sort(function (a, b) {
            let groupA = a.toLowerCase(); // ignore upper and lowercase
            let groupB = b.toLowerCase(); // ignore upper and lowercase
            let res = 0;

            if (groupA < groupB) {
                res = 1;
            }
            if (groupA > groupB) {
                res = -1;
            }

            if (sortOrder === 'asc') {
                res = res * -1;
            }

            // names must be equal
            return res;
        });
    }

    sortAlarms(alarms: Alarm[], sortOrder: string) {
        alarms.sort(function (a, b) {
            let res = 0;

            if (a.ReportedTime && b.ReportedTime) {
                if (a.ReportedTime === b.ReportedTime) {
                    // If the created time is the same, sort by priority
                    if (a.Priority > b.Priority) {
                        res = -1;
                    } else if (a.Priority < b.Priority) {
                        res = 1;
                    }
                } else if (a.ReportedTime < b.ReportedTime) {
                    res = -1;
                } else {
                    res = 1;
                }

            } else if (!a.ReportedTime && !b.ReportedTime) {
                if (a.Priority > b.Priority) {
                    res = -1;
                } else if (a.Priority < b.Priority) {
                    res = 1;
                }
            }
            else if (!a.ReportedTime) {
                res = -1;
            } else if (!b.ReportedTime) {
                res = 1;
            }

            if (sortOrder === 'asc') {
                res = res * -1;
            }

            return res;
        });

        return alarms;
    }
}