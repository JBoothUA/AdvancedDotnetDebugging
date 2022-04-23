import { Pipe, PipeTransform, Injectable } from '@angular/core';

@Injectable()
@Pipe({
    name: 'locationFilter'
})
export class LocationFilterPipe implements PipeTransform {
    transform(value: any[], locationIDs: string[]) {
        if (!value) return value;
        return value.filter(function (v) {
            return locationIDs.indexOf(v.LocationId) > -1;
        });
    }
}