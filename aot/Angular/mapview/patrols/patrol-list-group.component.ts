import {
    Component, ChangeDetectionStrategy, Input,
    OnInit
} from '@angular/core';

import { PatrolService } from '../../patrols/patrol.service';
import { PatrolSortService } from '../../patrols/patrol-sort.service';
import { PatrolTemplate, PatrolInstance } from '../../patrols/patrol.class';
import { slideDown } from '../../shared/animations';
import { MapViewOptions } from '../../shared/map-view-options.class';

@Component({
    selector: 'patrol-list-group',
    templateUrl: 'patrol-list-group.component.html',
    animations: [slideDown],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatrolListGroup implements OnInit {
    @Input() patrolTemplates: PatrolTemplate[];
    @Input() patrolInstances: PatrolInstance[];
    @Input() groupName: string;
    @Input() groupSelection: string;
    @Input() sortOrder: string;
    @Input() mapViewOptions: MapViewOptions;

    private expandedState: string;

    constructor(private patrolService: PatrolService, private patrolSort: PatrolSortService) {
    }

    public toggleExpandedGroup(): void {
        this.expandedState = this.expandedState === 'out' ? 'in' : 'out';
    }

    public getPatrols(): PatrolTemplate[] {
        let patrolTemplateList: PatrolTemplate[] = [];

        for (let patrol in this.patrolTemplates) {
            if (this.patrolSort.getGroupName(this.patrolTemplates[patrol],
                                             this.getPatrolInstance(this.patrolTemplates[patrol]),
                                             this.groupSelection) === this.groupName) {
                patrolTemplateList.push(this.patrolTemplates[patrol]);
            }
        }

        this.patrolTemplates = patrolTemplateList;

        if (this.sortOrder === 'asc') {
            return patrolTemplateList.sort(this.patrolService.sortbyDisplayNameAscFunc);
        } else {
            return patrolTemplateList.sort(this.patrolService.sortbyDisplayNameDescFunc);
        }
        
    }

    public getPatrolInstance(patrolTemplate: PatrolTemplate): PatrolInstance {
        for (let patrol in this.patrolInstances) {
            if (this.patrolInstances[patrol].TemplateId === patrolTemplate.TemplateId) {
                return this.patrolInstances[patrol];
            }
        }
        return null;
    }

    public trackByPatrolFn(index: number, patrolTemplate: PatrolTemplate) {
        return patrolTemplate.id;
    }

    public ngOnInit(): void {
        this.expandedState = this.expandedState || 'out';
    }
}