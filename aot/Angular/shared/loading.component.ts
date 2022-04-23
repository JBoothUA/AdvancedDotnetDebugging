import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'loading',
    templateUrl: 'loading.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Loading {
    @Input() visible: boolean;
    @Input() override: boolean;

    constructor() { }
}