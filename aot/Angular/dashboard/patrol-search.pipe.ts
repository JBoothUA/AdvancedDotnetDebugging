import { Pipe, PipeTransform } from '@angular/core';
import { PatrolInstance } from '../patrols/patrol.class';

@Pipe({
    name: 'patrolsearch'
})
export class PatrolSearchPipe implements PipeTransform {
    transform(patrolInstance: PatrolInstance[], searchterm: any) {
        if (!patrolInstance) return patrolInstance;
        return patrolInstance.filter((patrol) => patrol.DisplayName.toUpperCase().startsWith(searchterm.toUpperCase()));
    }
}