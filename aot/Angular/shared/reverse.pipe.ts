import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'order'
})
export class OrderPipe implements PipeTransform {
    transform(value: any[], order: string) {
        if (order === 'desc')
            return value.slice().reverse();
        else
            return value.slice();
    }
}