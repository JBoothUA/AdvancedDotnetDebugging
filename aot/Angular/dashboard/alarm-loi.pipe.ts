import { Pipe, PipeTransform } from '@angular/core';
import { Alarm } from '../alarms/alarm.class';
import { TenantLocation } from './dashboard';

@Pipe({
    name: 'alarmloi'
})
export class AlarmLOIPipe implements PipeTransform {
    transform(alarms: Alarm[], selectedLOI: TenantLocation) {
        if (!alarms) return alarms;
        if (!selectedLOI) return alarms;
        return alarms.filter((alarm) => (alarm.LocationId === selectedLOI.LocationID) &&
            alarm.Priority === parseInt(selectedLOI.Priority));
    }
}