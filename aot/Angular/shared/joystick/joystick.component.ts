import {
    Component, Input, ChangeDetectionStrategy,
    ChangeDetectorRef, OnDestroy, ElementRef,
    AfterViewInit, Output, EventEmitter
} from '@angular/core';

export declare interface JoystickData {
    angle: {
        degree: number;
        radian: number;
    },
    direction: {
        angle: string;
        x: string;
        y: string;
    }
    distance: number;
    force: number;
    identifier: number;
    instance: any;
    position: {
        x: number;
        y: number;
    };
    pressure: number;
}

@Component({
    selector: 'joystick',
    template: '',
    styleUrls: ['joystick.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Joystick implements AfterViewInit {

    @Output() onMove: EventEmitter<JoystickData> = new EventEmitter<JoystickData>();

    private manager: any;

    constructor(private elRef: ElementRef) { }

    public ngAfterViewInit(): void {
        this.manager = require('nipplejs').create({
            zone: this.elRef.nativeElement,
            mode: 'static',
            position: { left: '50%', top: '50%' }
        });

        this.manager.on('move', (evt: any, data: any) => {
            this.onMove.emit(data);
        });

        this.manager.on('start', (evt: any, data: any) => {
            $(this.elRef.nativeElement).find('.back').addClass('moving');
        });

        this.manager.on('end', (evt: any, data: any) => {
            $(this.elRef.nativeElement).find('.back').removeClass('moving');
        });
    }
}