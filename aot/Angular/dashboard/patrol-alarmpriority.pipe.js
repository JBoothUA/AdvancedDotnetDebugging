var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Pipe } from '@angular/core';
var PatrolAlarmPriorityPipe = /** @class */ (function () {
    function PatrolAlarmPriorityPipe() {
    }
    PatrolAlarmPriorityPipe.prototype.transform = function (patrolInstances, patrolAlarms, selectedPriority) {
        if (!patrolInstances)
            return patrolInstances;
        if (!patrolAlarms)
            return patrolInstances;
        if (!selectedPriority)
            return patrolInstances;
        //let patrolInstances: PatrolInstance[] = Array.from(patrolInstancesMap.values());
        //let filteredPIMap: Map<string, PatrolInstance> = new Map<string, PatrolInstance>();
        var filteredPI = [];
        //filter the alarms
        var alarmsWithPriority = patrolAlarms.filter(function (a) { return a.Priority === selectedPriority; });
        if (alarmsWithPriority) {
            var alarmIDs = alarmsWithPriority.map(function (x) { return x.Id; });
            if (alarmIDs) {
                //get the patrols with alarms
                var pInstancesWithAlarms = patrolInstances.filter(function (patrol) { return (patrol.AlarmIds && patrol.AlarmIds.length > 0); });
                if (pInstancesWithAlarms) {
                    for (var _i = 0, pInstancesWithAlarms_1 = pInstancesWithAlarms; _i < pInstancesWithAlarms_1.length; _i++) {
                        var pi = pInstancesWithAlarms_1[_i];
                        //for (let aid of pi.AlarmIds) {
                        //    if (alarmIDs.indexOf(aid) !== -1)
                        //    {
                        //        filteredPIMap.set(pi.TemplateId, pi);
                        //    }
                        //}
                        for (var _a = 0, _b = pi.AlarmIds; _a < _b.length; _a++) {
                            var aid = _b[_a];
                            if (alarmIDs.includes(aid)) {
                                if (filteredPI.indexOf(pi) === -1)
                                    filteredPI.push(pi);
                            }
                        }
                    }
                }
            }
        }
        return filteredPI; //filteredPIMap;
    };
    PatrolAlarmPriorityPipe = __decorate([
        Pipe({
            name: 'patrolalarmpriority'
        })
    ], PatrolAlarmPriorityPipe);
    return PatrolAlarmPriorityPipe;
}());
export { PatrolAlarmPriorityPipe };
//# sourceMappingURL=patrol-alarmpriority.pipe.js.map