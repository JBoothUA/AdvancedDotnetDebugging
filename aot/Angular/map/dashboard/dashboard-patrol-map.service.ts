import { Injectable, NgZone } from '@angular/core';
//import { Subject } from 'rxjs/Subject';
//import 'rxjs/add/operator/takeUntil';
//import { PatrolTemplate, PatrolInstance, PatrolStatus, PatrolStatusValues } from '../patrols/patrol.class';
//import { PointTemplate, PointInstance, PointStatus, PointStatusValues } from '../patrols/point.class';
//import { ActionInstance, ActionStatus, ActionStatusValues } from '../patrols/action.class';
//import { PatrolService } from '../patrols/patrol.service';

import { NavigationService } from '../../shared/navigation.service';
import { PatrolMapService } from '../patrols/patrolMap.service';
import { PatrolBuilderService } from '../../patrolBuilder/patrol-builder.service';
import { DashboardPatrolService } from '../../dashboard/dashboard-patrol.service';

import { PatrolInstance, PatrolTemplate } from '../../patrols/patrol.class';

export enum PatrolMapInteractMode {
    None,
    Append,
    Prepend,
    Edit
}

@Injectable()
export class DashboardPatrolMapService extends PatrolMapService {

    selectedPatrol: PatrolInstance;

    constructor(
        protected patrolService: DashboardPatrolService,
        protected patrolBuilderService: PatrolBuilderService,
        protected ngzone: NgZone,
        protected navigationService: NavigationService) {
        super(patrolService, patrolBuilderService, ngzone, navigationService);
    }

    protected patrolSelected(patrolTemplateId: string) {
        if (!this.patrolService.selectedPatrol) {
            this.clearPatrol();
        }
        else {
            let patrol: PatrolInstance = this.patrolService.selectedPatrol;
            if (patrol) {
                if (patrol.IsTemplate) {
                    //this is a template - get the template
                    let patrolTemplate: PatrolTemplate = this.patrolService.getPatrolTemplate(patrolTemplateId);
                    patrolTemplate.selected = true;
                    if (patrolTemplate)
                        this.setActivePatrol(patrolTemplate);
                }
                else {
                    this.setActivePatrol(patrol);
                }
                setTimeout(() => { this.zoomToPatrolBounds(); }, 100);
            }
        }
    }
}