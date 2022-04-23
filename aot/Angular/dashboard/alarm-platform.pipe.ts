import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmplatform'
})
export class AlarmPlatformPipe implements PipeTransform {
    transform(alarms: Alarm[], selectedPlatform: string) {
        if (!alarms) return alarms;
        if (!selectedPlatform) return alarms;
        return alarms.filter((alarm) => alarm.PlatformId === selectedPlatform);
    }
}