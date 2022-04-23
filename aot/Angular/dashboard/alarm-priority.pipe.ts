import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmpriority'
})
export class AlarmPriorityPipe implements PipeTransform {
    transform(alarms: Alarm[], selectedPriority: number) {
        if (!alarms) return alarms;
        if (selectedPriority <= 0) return alarms;
        return alarms.filter((alarm) => alarm.Priority === selectedPriority);
    }
}