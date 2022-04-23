import { Component, ElementRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { AlarmService } from '../../alarms/alarm.service';
import { Alarm } from '../../alarms/alarm.class';
import { NavigationService } from '../../shared/navigation.service';

@Component({
    selector: 'alarm-context-menu',
    templateUrl: 'alarm-context-menu.component.html'
})
export class AlarmContextMenu {
    visible: boolean = false;
    alarm: Alarm;

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    hide: (event?: any) => void = () => {
        if (event) {
            event.preventDefault();
        }
        this.visible = false;
        this.alarm = undefined;
    };

    constructor(private alarmService: AlarmService, private elementRef: ElementRef, private navigationService: NavigationService) {
        this.alarmService.openAlarmActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
                next: (obj) => this.show(obj)
            });
    }

    ngAfterViewInit(): void {
        $('body').append(this.elementRef.nativeElement);
    }

    show(obj: any): void {
        this.alarm = obj.alarm;

        let x = obj.event.clientX;
        let y = obj.event.clientY;

        this.elementRef.nativeElement.style.left = x + 'px';
        this.elementRef.nativeElement.style.top = y + 'px';
        this.visible = true;
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
}