import { Pipe, PipeTransform } from '@angular/core';
import { Alarm, Comment } from '../alarms/alarm.class';

@Pipe({
    name: 'alarmoperator'
})
export class AlarmOperatorPipe implements PipeTransform {
    transform(alarms: Alarm[], selectedOperator: string) {
        if (!alarms) return alarms;
        if (!selectedOperator) return alarms;
        return alarms.filter(alarm => (
            (alarm.UserId === selectedOperator) ||
            (alarm.Created.UserId === selectedOperator) ||
            ((alarm.Acknowledged != null) && (alarm.Acknowledged.UserId === selectedOperator)) ||
            ((alarm.Cleared != null) && (alarm.Cleared.UserId === selectedOperator)) ||
            ((alarm.Dismissed != null) && (alarm.Dismissed.UserId === selectedOperator)) ||
            ((alarm.Comments != null) && (alarm.Comments.length > 0) && (alarm.Comments.filter(c => c.UserId === selectedOperator).length > 0)) ));
    }
}