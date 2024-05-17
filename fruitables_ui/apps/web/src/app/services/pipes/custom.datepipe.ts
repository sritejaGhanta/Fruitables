import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'customdate', standalone: true })
export class customDatePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    if (value != undefined) {
      if (value.toString()?.includes('-')) {
        return value;
      } else {
        console.log(value);
      }
    }

    // throw new Error('Method not implemented.');
  }
}
