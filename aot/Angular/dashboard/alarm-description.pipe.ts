import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmdescription'
})
export class AlarmDescriptionPipe implements PipeTransform {
    transform(alarms: Alarm[], description: string) {
        if (!alarms) return alarms;
        if (!description) return alarms;
        return alarms.filter((alarm) => alarm.Description === description);
    }
}