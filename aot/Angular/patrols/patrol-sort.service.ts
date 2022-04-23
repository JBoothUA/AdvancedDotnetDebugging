import { Injectable } from '@angular/core';
import { PatrolService } from './patrol.service';
import {
    PatrolTemplate, PatrolInstance, PatrolType,
    AreaType
} from './patrol.class';
import { LocationFilterService } from './../shared/location-filter.service';
import { Location } from './../shared/location.class';

@Injectable()
export class PatrolSortService {

    constructor(private patrolService: PatrolService,
                private locationFilterService: LocationFilterService) { }

    public getGroupList(patrolTemplates: PatrolTemplate[], groupSelection: string, sortOrder: string): string[] {
        let groupList: string[] = [];

        for (let patrol in patrolTemplates) {

            let groupName = this.getGroupName(patrolTemplates[patrol], this.patrolService.getPatrolInstance(patrolTemplates[patrol].TemplateId), groupSelection)

            if (!groupList.includes(groupName)) {
                groupList.push(groupName);
            }
        }

        if (groupSelection === 'Status') {
            this.genericSort(groupList, (sortOrder === 'asc') ? 'desc' : 'asc');
        } else {
            this.genericSort(groupList, sortOrder);
        }
        
        return groupList;
    }

    public getGroupName(patrolTemplate: PatrolTemplate, patrolInstance: PatrolInstance, groupSelection: string): string {
        let groupName: string;
        switch (groupSelection) {
            case 'Status':
                if (patrolInstance || patrolTemplate.IsPatrolSubmitted) {
                    groupName = 'On Patrol';
                } else {
                    groupName = 'Available';
                }

                break;
            case 'PatrolArea':
                switch (patrolTemplate.AreaType) {
                    case AreaType.Large:
                        groupName = 'Large Area';
                        break;
                    case AreaType.Small:
                        groupName = 'Small Area';
                        break;
                    case AreaType.Perimeter:
                        groupName = 'Perimeter';
                        break;
                }

                break;
            case 'PatrolType':
                switch (patrolTemplate.Type) {
                    case PatrolType.Air:
                        groupName = 'Air';
                        break;
                    case PatrolType.Ground:
                        groupName = 'Ground';
                        break;
                }
                break;
            case 'PatrolName':
                groupName = 'Patrol Name';
                break;
            case 'Location':
                let loc: Location = this.locationFilterService.getLocation('mapview', patrolTemplate.TenantId, patrolTemplate.LocationId);
               
                if (!loc) {
                    groupName = 'Unknown';
                } else {
                    groupName = loc.Name
                }

                break;
            default:  
                groupName = 'None';
        }
        return groupName;
    }

    public genericSort(list: string[], sortOrder: string): void {
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
}