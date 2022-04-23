import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmstate'
})
export class AlarmStatePipe implements PipeTransform {
    transform(alarms: Alarm[], selectedState: number) {
        if (!alarms) return alarms;
        if (selectedState <= 0) return alarms;
        return alarms.filter((alarm) => alarm.State === selectedState);
    }
}