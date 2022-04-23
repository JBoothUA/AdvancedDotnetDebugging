import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'values' })
export class MapValuePipe implements PipeTransform {
    transform(value: any, args?: any[]): Object[] {
        let keyArr: any[] = Object.keys(value),
            dataArr:any[] = [],
            keyName = args[0];

        keyArr.forEach((key: any) => {
            value[key][keyName] = key;
            dataArr.push(value[key])
        });

        if (args[1]) {
            dataArr.sort((a: Object, b: Object): number => {
                return a[keyName] > b[keyName] ? 1 : -1;
            });
        }

        return dataArr;
    }
}