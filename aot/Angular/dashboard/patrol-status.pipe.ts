import { Pipe, PipeTransform } from '@angular/core';
import { PatrolStatus } from './dashboard';
import { PatrolInstance, PatrolStatusValues, PatrolTemplate, isPatrolInstance } from '../patrols/patrol.class';
import { PointStatusValues, PointInstance } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';

@Pipe({
    name: 'patrolstatus'
})
export class PatrolStatusPipe implements PipeTransform {
    transform(patrolInstances: PatrolInstance[], status: PatrolStatus, patrolTemplates: PatrolTemplate[]) {
        if (!patrolInstances) return patrolInstances;

        if (status === PatrolStatus.None)
            return patrolInstances;

        //red
        let patrolCriticalIDs: string[] = [];
        let criticalPIs: PatrolInstance[] = patrolInstances.filter(p => (p.CurrentStatus === PatrolStatusValues.Failed) || (p.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints));

        if (status === PatrolStatus.Critical)
            return criticalPIs;

        //orange
        let patrolFailIDs: string[] = [];
        let patrolFailedPIs: PatrolInstance[] = patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.FailedCheckpoints);
        if (status === PatrolStatus.Incomplete) {
            return patrolFailedPIs;
        }

        if ((patrolFailedPIs != null) && (patrolFailedPIs.length > 0)) {
            patrolFailIDs.concat(patrolFailedPIs.map(function (x) { return x.InstanceId; }));
        }

        //amber
        let patrolWarningIDs: string[] = [];
        let patrolWarningPIs: PatrolInstance[] = patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.Aborted);
        if ((patrolWarningPIs != null) && (patrolWarningPIs.length > 0)) {
            patrolWarningIDs = patrolWarningIDs.concat(patrolWarningPIs.map(function (x) { return x.InstanceId; }));
        }

        let pointsNotReached: PatrolInstance[] = patrolInstances.filter(p => p.CurrentStatus === PatrolStatusValues.PointsNotReached);
        if ((pointsNotReached != null) && (pointsNotReached.length > 0)) {
            patrolWarningIDs = patrolWarningIDs.concat(pointsNotReached.map(function (x) { return x.InstanceId; }));
        }


        //if the patrol is currently running:

        for (let pi of patrolInstances) {

            let ptReached = pi.Points.filter(pt => (pt.CurrentStatus === PointStatusValues.Reached) &&
                                                   (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) && 
                                                   (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints));

            if (ptReached.length > 0) {
                for (let pti of ptReached)
                {
                    let actionFailed = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported));
                    if (actionFailed.length > 0) {
                        if (patrolWarningIDs.indexOf(pi.InstanceId) === -1) {
                            patrolWarningIDs.push(pi.InstanceId)
                            if (patrolWarningPIs.indexOf(pi) === -1)
                                patrolWarningPIs.push(pi);
                        }
                    }

                    //if the patrol is a running patrol:
                    //if a point has actions (i.e. its a checkpoint) and its status is 2 (reached) 
                    //but 1 or more of the points actions statuses is 1 (started) or 0 (unknown), then 
                    //get the checkpoints ordinal number and check to see if the next point after this one has a status or 1 (in transit) or 2(reached)
                    //if it does, then it means that this current point with actions (i.e. checkpoint) has failed
                    //return a status of 3 (failed) (Note!!! - this should role up to a patrol status of 6 once the patrol is completed)
                    let actionIncomplete = pti.Actions.filter(a => (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown));
                    if (actionIncomplete.length > 0) {
                        let nextPointOrdinal: PointInstance[] = ptReached.filter(o => o.Ordinal === (pti.Ordinal + 1));
                        if (nextPointOrdinal.length > 0) {
                            if (nextPointOrdinal[0].CurrentStatus > PointStatusValues.Unknown) {
                                if (patrolWarningIDs.indexOf(pi.InstanceId) === -1)
                                    patrolWarningIDs.push(pi.InstanceId);
                                if (patrolWarningPIs.indexOf(pi) === -1)
                                    patrolWarningPIs.push(pi);
                            }
                        }
                    }
                    ///
                }
            }

            let ptNotReached = pi.Points.filter(pt => (pt.CurrentStatus === PointStatusValues.NotReached) &&
                                                      (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                                                      (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints));
            if (ptNotReached.length > 0) {
                if (patrolWarningIDs.indexOf(pi.InstanceId) === -1) {
                    patrolWarningIDs.push(pi.InstanceId);
                    if (patrolWarningPIs.indexOf(pi) === -1)
                        patrolWarningPIs.push(pi);
                }
            }
        }

        if (status === PatrolStatus.Warning) {
            return patrolWarningPIs;
        }

        //green
        let patrolSuccessfulIDs: string[] = [];
        let patrolSubmittedTemplateIDs: string[] = [];
        let patrolSuccessfulPIs: PatrolInstance[] = [];
        let patrolInstanceSuccessful: PatrolInstance[] = patrolInstances.filter(p => (
            (p.CurrentStatus === PatrolStatusValues.Completed) ||
            (p.CurrentStatus === PatrolStatusValues.Paused) ||
            (p.CurrentStatus === PatrolStatusValues.Resumed) ||
            (p.CurrentStatus === PatrolStatusValues.Started) ||
            (p.IsTemplate === true)));

        for (let pis of patrolInstanceSuccessful) {
            if ((!patrolWarningIDs.includes(pis.InstanceId)) &&
                (!patrolFailIDs.includes(pis.InstanceId))) {
                patrolSuccessfulPIs.push(pis);
            }
        }

        if (status === PatrolStatus.Successful) {
            return patrolSuccessfulPIs;
        }
    }
}