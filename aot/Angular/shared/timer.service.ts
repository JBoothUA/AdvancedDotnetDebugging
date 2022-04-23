import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class TimerService {
    public onMinuteTick: Subject<string> = new Subject<string>();

    private minuteTick: NodeJS.Timer;

    constructor() {
        this.minuteTick = setInterval(() => {
            this.onMinuteTick.next();
        }, 60000);
    }
}