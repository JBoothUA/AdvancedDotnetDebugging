import { Pipe, PipeTransform } from '@angular/core';
import { PatrolInstance } from '../patrols/patrol.class';
import { RobotAndDrone } from './dashboard';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'patrolalarmpriority'
})
export class PatrolAlarmPriorityPipe implements PipeTransform {
    transform(patrolInstances: PatrolInstance[], patrolAlarms: Alarm[], selectedPriority: number) {
        if (!patrolInstances) return patrolInstances;
        if (!patrolAlarms) return patrolInstances;
        if (!selectedPriority) return patrolInstances;

        //let patrolInstances: PatrolInstance[] = Array.from(patrolInstancesMap.values());
        //let filteredPIMap: Map<string, PatrolInstance> = new Map<string, PatrolInstance>();
        let filteredPI: PatrolInstance[] = [];

        //filter the alarms
        let alarmsWithPriority: Alarm[] = patrolAlarms.filter((a) => a.Priority === selectedPriority);
        if (alarmsWithPriority) {
            let alarmIDs: string[] = alarmsWithPriority.map(function (x) { return x.Id; });
            if (alarmIDs) {
                //get the patrols with alarms
                let pInstancesWithAlarms: PatrolInstance[] = patrolInstances.filter(patrol => (patrol.AlarmIds && patrol.AlarmIds.length > 0));
                if (pInstancesWithAlarms) {
                    for (let pi of pInstancesWithAlarms) {

                        //for (let aid of pi.AlarmIds) {
                        //    if (alarmIDs.indexOf(aid) !== -1)
                        //    {
                        //        filteredPIMap.set(pi.TemplateId, pi);
                        //    }
                        //}

                        for (let aid of pi.AlarmIds) {
                            if (alarmIDs.includes(aid))
                            {
                                if (filteredPI.indexOf(pi) === -1)
                                    filteredPI.push(pi);
                            }
                        }
                    }
                }
            }
        }
        return filteredPI; //filteredPIMap;
    }
}