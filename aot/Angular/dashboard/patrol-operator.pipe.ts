import { Pipe, PipeTransform } from '@angular/core';
import { PatrolInstance } from '../patrols/patrol.class';

@Pipe({
    name: 'patroloperator'
})
export class PatrolOperatorPipe implements PipeTransform {
    transform(patrolInstances: PatrolInstance[], operator: string) {
        if (!patrolInstances) return patrolInstances;
        if (!operator) return patrolInstances;
        return patrolInstances.filter(patrolInstance => patrolInstance.UserName === operator);
    }
}