import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmsearch'
})
export class AlarmSearchPipe implements PipeTransform {
    transform(alarms: Alarm[], searchterm: string) {
        if (!alarms) return alarms;
        return alarms.filter((alarm) => alarm.Description.toUpperCase().includes(searchterm.toUpperCase()));
    }
}