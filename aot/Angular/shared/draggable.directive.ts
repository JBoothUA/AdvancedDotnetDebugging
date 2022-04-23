import {
    Directive, Input, ElementRef, NgZone
} from '@angular/core';

@Directive({
    selector: '[draggable]'
})
export class DraggableDirective {
    @Input('draggable') container: string;
    @Input('handle') handle: string;
    @Input('enabled') enabled: boolean = true;

    constructor(private elementRef: ElementRef, private zone: NgZone) { }

    ngOnInit(): void {
        if (this.enabled) {
            this.zone.runOutsideAngular(() => {
                $(this.handle).css('cursor', 'move');
                $(this.elementRef.nativeElement).draggable({
                    containment: this.container,
                    handle: this.handle
                });
            });
        }
    }
}