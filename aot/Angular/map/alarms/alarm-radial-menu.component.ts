/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, SimpleChange } from '@angular/core';
import { RadialMenu } from '../../shared/radial/radial-menu.component';
import { RadialMenuButton } from '../../shared/radial/radial-menu-button.class';
import { RadialMenuButtonImage } from '../../shared/radial/radial-menu-button-image.class';
import { Alarm, AlarmStatus } from '../../alarms/alarm.class';
import { AlarmService } from '../../alarms/alarm.service';

@Component({
    selector: 'alarm-radial-menu',
    templateUrl: '../../shared/radial/radial-menu.component.html',
    styleUrls: ['../../shared/radial/radial-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlarmRadialMenu extends RadialMenu {
    @Input() alarm: Alarm;
    @Input() acknowledged: AlarmStatus;

    acknowledgeButton: RadialMenuButton;
    clearButton: RadialMenuButton;
    dismissButton: RadialMenuButton;

    constructor(protected changeDetectorRef: ChangeDetectorRef, protected elementRef: ElementRef, protected alarmService: AlarmService) {
        super(changeDetectorRef, elementRef);

        L.DomEvent.disableClickPropagation(this.elementRef.nativeElement);
    }

    ngOnInit(): void {
        this.acknowledgeButton = new RadialMenuButton(this.alarm.Id, 'Acknowledge',
                                                      new RadialMenuButtonImage('/Content/Images/Alarms/radial-acknowledge-icon.png', -3, -2),
                                                      this.acknowledgeAlarm, false, (this.alarm.Acknowledged ? false : true));
        this.clearButton = new RadialMenuButton(this.alarm.Id, 'Clear',
                                                new RadialMenuButtonImage('/Content/Images/Alarms/radial-clear-alarm.png'),
                                                this.clearAlarms, false, (this.alarm.Acknowledged ? true : false));
        this.dismissButton = new RadialMenuButton(this.alarm.Id, 'Dismiss',
                                                  new RadialMenuButtonImage('/Content/Images/Alarms/radial-dismiss-alarm.png', 0, 2),
                                                  this.dismissAlarms);

        this.buttons.push(this.clearButton);
        this.buttons.push(this.acknowledgeButton);

        // Create empty/invisible buttons to control placement of buttons
        for (let i = 0; i < 6; i++) {
            this.buttons.push(new RadialMenuButton('', '', new RadialMenuButtonImage(''), null, false, false, false));
        }

        this.buttons.push(this.dismissButton);
    }

    acknowledgeAlarm: () => void = () => {
        this.alarmService.acknowledgeAlarms(this.alarm);
    };

    clearAlarms: () => void = () => {
        this.alarmService.clearAlarmsWithConfirmation(this.alarm);
    };

	dismissAlarms: () => void = () => {
        this.alarmService.dismissAlarmsWithConfirmation(this.alarm);
    };

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes.acknowledged && this.acknowledgeButton) {
            if (this.acknowledged) {
                this.acknowledgeButton.Active = false;
                this.clearButton.Active = true;
            }
        }
    }
}