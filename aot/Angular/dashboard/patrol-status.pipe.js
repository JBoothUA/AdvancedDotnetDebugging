var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
import { PatrolStatus } from './dashboard';
import { PatrolStatusValues } from '../patrols/patrol.class';
import { PointStatusValues } from '../patrols/point.class';
import { ActionStatusValues } from '../patrols/action.class';
var PatrolStatusPipe = /** @class */ (function () {
    function PatrolStatusPipe() {
    }
    PatrolStatusPipe.prototype.transform = function (patrolInstances, status, patrolTemplates) {
        if (!patrolInstances)
            return patrolInstances;
        if (status === PatrolStatus.None)
            return patrolInstances;
        //red
        var patrolCriticalIDs = [];
        var criticalPIs = patrolInstances.filter(function (p) { return (p.CurrentStatus === PatrolStatusValues.Failed) || (p.CurrentStatus === PatrolStatusValues.FailedMostCheckpoints); });
        if (status === PatrolStatus.Critical)
            return criticalPIs;
        //orange
        var patrolFailIDs = [];
        var patrolFailedPIs = patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.FailedCheckpoints; });
        if (status === PatrolStatus.Incomplete) {
            return patrolFailedPIs;
        }
        if ((patrolFailedPIs != null) && (patrolFailedPIs.length > 0)) {
            patrolFailIDs.concat(patrolFailedPIs.map(function (x) { return x.InstanceId; }));
        }
        //amber
        var patrolWarningIDs = [];
        var patrolWarningPIs = patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.Aborted; });
        if ((patrolWarningPIs != null) && (patrolWarningPIs.length > 0)) {
            patrolWarningIDs = patrolWarningIDs.concat(patrolWarningPIs.map(function (x) { return x.InstanceId; }));
        }
        var pointsNotReached = patrolInstances.filter(function (p) { return p.CurrentStatus === PatrolStatusValues.PointsNotReached; });
        if ((pointsNotReached != null) && (pointsNotReached.length > 0)) {
            patrolWarningIDs = patrolWarningIDs.concat(pointsNotReached.map(function (x) { return x.InstanceId; }));
        }
        var _loop_1 = function (pi) {
            var ptReached = pi.Points.filter(function (pt) { return (pt.CurrentStatus === PointStatusValues.Reached) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints); });
            if (ptReached.length > 0) {
                var _loop_2 = function (pti) {
                    var actionFailed = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Failed) || (a.CurrentStatus === ActionStatusValues.Unsupported); });
                    if (actionFailed.length > 0) {
                        if (patrolWarningIDs.indexOf(pi.InstanceId) === -1) {
                            patrolWarningIDs.push(pi.InstanceId);
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
                    var actionIncomplete = pti.Actions.filter(function (a) { return (a.CurrentStatus === ActionStatusValues.Started) || (a.CurrentStatus === ActionStatusValues.Unknown); });
                    if (actionIncomplete.length > 0) {
                        var nextPointOrdinal = ptReached.filter(function (o) { return o.Ordinal === (pti.Ordinal + 1); });
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
                };
                for (var _i = 0, ptReached_1 = ptReached; _i < ptReached_1.length; _i++) {
                    var pti = ptReached_1[_i];
                    _loop_2(pti);
                }
            }
            var ptNotReached = pi.Points.filter(function (pt) { return (pt.CurrentStatus === PointStatusValues.NotReached) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedMostCheckpoints) &&
                (pi.CurrentStatus !== PatrolStatusValues.FailedCheckpoints); });
            if (ptNotReached.length > 0) {
                if (patrolWarningIDs.indexOf(pi.InstanceId) === -1) {
                    patrolWarningIDs.push(pi.InstanceId);
                    if (patrolWarningPIs.indexOf(pi) === -1)
                        patrolWarningPIs.push(pi);
                }
            }
        };
        //if the patrol is currently running:
        for (var _i = 0, patrolInstances_1 = patrolInstances; _i < patrolInstances_1.length; _i++) {
            var pi = patrolInstances_1[_i];
            _loop_1(pi);
        }
        if (status === PatrolStatus.Warning) {
            return patrolWarningPIs;
        }
        //green
        var patrolSuccessfulIDs = [];
        var patrolSubmittedTemplateIDs = [];
        var patrolSuccessfulPIs = [];
        var patrolInstanceSuccessful = patrolInstances.filter(function (p) { return ((p.CurrentStatus === PatrolStatusValues.Completed) ||
            (p.CurrentStatus === PatrolStatusValues.Paused) ||
            (p.CurrentStatus === PatrolStatusValues.Resumed) ||
            (p.CurrentStatus === PatrolStatusValues.Started) ||
            (p.IsTemplate === true)); });
        for (var _a = 0, patrolInstanceSuccessful_1 = patrolInstanceSuccessful; _a < patrolInstanceSuccessful_1.length; _a++) {
            var pis = patrolInstanceSuccessful_1[_a];
            if ((!patrolWarningIDs.includes(pis.InstanceId)) &&
                (!patrolFailIDs.includes(pis.InstanceId))) {
                patrolSuccessfulPIs.push(pis);
            }
        }
        if (status === PatrolStatus.Successful) {
            return patrolSuccessfulPIs;
        }
    };
    PatrolStatusPipe = __decorate([
        Pipe({
            name: 'patrolstatus'
        })
    ], PatrolStatusPipe);
    return PatrolStatusPipe;
}());
export { PatrolStatusPipe };
//# sourceMappingURL=patrol-status.pipe.js.map