import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'patroldisplayname'
})
export class PatrolDisplayNamePipe implements PipeTransform {
    transform(patrolInstances: any[], displayname: string) {
        if (!patrolInstances) return patrolInstances;
        if (patrolInstances.length === 0) return patrolInstances;
        if (!displayname) return patrolInstances;
        return patrolInstances.filter(patrol => patrol.DisplayName.trim() === displayname.trim());
    }
}