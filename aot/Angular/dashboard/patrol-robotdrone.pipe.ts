import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'patrolrobot'
})
export class PatrolRobotDronePipe implements PipeTransform {
    transform(patrolInstances: any[], platformID: string) {
        if (!patrolInstances) return patrolInstances;
        if (!platformID) return patrolInstances;
        return patrolInstances.filter(patrol => patrol.PlatformId === platformID);
    }
}