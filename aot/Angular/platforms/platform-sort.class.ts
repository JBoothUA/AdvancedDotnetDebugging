import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';
import { Platform } from '../platforms/platform.class';
import { LocationFilterService } from './../shared/location-filter.service';
import { Location } from './../shared/location.class';

@Injectable()
export class PlatformSort {
    constructor(private platformService: PlatformService,
                private locationFilterService: LocationFilterService) { }

    getGroupList(platforms: Platform[], groupSelection: string, sortOrder: string): string[] {
        var groupList: string[] = [];

        for (var platform in platforms) {
            var groupName = this.getGroupName(platforms[platform], groupSelection);

            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }

        // Sort based upon group selection
        this.genericSort(groupList, sortOrder);

        return groupList;
    }

    getGroupName(platform: Platform, groupSelection: string): string {
        let groupName: string;

        switch (groupSelection) {
            case 'State':
                let stateText = this.platformService.getAvailableText(platform);
                stateText = (stateText !== '') ? stateText : 'Heathly';
                if (platform[groupSelection]) {
                    groupName = stateText;
                } else {
                    groupName = 'Unknown';
                }
				break;
			case 'Manufacturer':
				if (platform[groupSelection]) {
					groupName = this.platformService.getPlatformManufacturerName(platform);
					if (groupName === 'gamma2') {
						groupName = 'Gamma 2';
					}
				} else {
					groupName = 'Unknown';
				}
                break;
            case 'RobotName':
                groupName = 'Robot Name';
                break;
            case 'Location':
                let loc: Location = this.locationFilterService.getLocation('mapview', platform.TenantId, platform.LocationId);

                if (!loc) {
                    groupName = 'Unknown';
                } else {
                    groupName = loc.Name
                }

                break;
            default:
                if (platform[groupSelection]) {
                    groupName = platform[groupSelection];
                } else {
                    groupName = 'None';
                }
        }

        return groupName;
    }

    genericSort(list: string[], sortOrder: string): void {
        list.sort(function (a, b) {
            var groupA = a.toLowerCase(); // ignore upper and lowercase
            var groupB = b.toLowerCase(); // ignore upper and lowercase
            var res = 0;

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
	
	sortPlatforms(platforms: Platform[], sortOrder: string) {
		platforms.sort(function (a, b) {
			var res = 0;

			if (a.DisplayName < b.DisplayName) {
				res = 1;
			} else if (a.DisplayName > b.DisplayName) {
				res = -1;
			} else {
				res = 1;
			}

			if (sortOrder === 'asc') {
				res = res * -1;
			}

			return res;
		});

		return platforms;
	}

}