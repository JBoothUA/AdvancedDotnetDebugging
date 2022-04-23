import {
    Component, ElementRef, ChangeDetectorRef,
    ViewChild, HostListener, Input, HostBinding,
    Output, EventEmitter
} from '@angular/core';

@Component({
    selector: 'popover',
    templateUrl: 'popover.component.html',
    styleUrls: ['popover.component.css'],
})
export class Popover {
    public visible: boolean = false;
    private popoverId: string = this.createGUID();
    @Input() horizontalAligment: string = 'left';

    @ViewChild('modal') modal: ElementRef;
    @HostBinding('class.transition') showTransition: boolean = this.visible;
    @Output() onShow: EventEmitter<void> = new EventEmitter<void>();
    @Output() onHide: EventEmitter<void> = new EventEmitter<void>(); 

    constructor(private elementRef: ElementRef, private ref: ChangeDetectorRef) {
    }

    public show(target: ElementRef, offsetTop: number, offsetLeft: number) {
        if (this.visible) {
            this.hide();
        } else {
            //Close on scrolling
            $('*').bind('scroll.popover_' + this.popoverId, (e:any) => {
                this.hide();
                this.ref.detectChanges();
            });

            //Close on click
            setTimeout(() => {
                $(document).on('click.popover_' + this.popoverId, (e) => {
                    this.hide();
                    this.ref.detectChanges();
                });

                $(document).on('contextmenu.popover_' + this.popoverId, (e) => {
                    this.hide();
                    this.ref.detectChanges();
                });
            });

            this.visible = true;

            this.redraw(target, offsetTop, offsetLeft);
            this.onShow.next();
        }
    }

    public hide() {
        this.visible = false;

        $('*').unbind('scroll.popover_' + this.popoverId);
        $(document).unbind('click.popover_' + this.popoverId); 
        $(document).unbind('contextmenu.popover_' + this.popoverId);
        this.onHide.next();
    }

    public redraw(target: ElementRef, offsetTop: number, offsetLeft: number) {
        if (!target) {
            setTimeout(() => {
                $(this.elementRef.nativeElement).position({
                    my: 'right top',
                    at: 'right bottom',
                    of: this.elementRef.nativeElement,
                    collision: 'flipfit'
                });
            });
        } else {
            if (target) {
                let right = '-10';
                let bottom = '-5';

                if (offsetLeft) {
                    if (offsetLeft >= 0) {
                        right = '+' + offsetLeft;
                    } else {
                        right = '-' + offsetLeft * -1;
                    }
                }

                if (offsetTop) {
                    if (offsetTop >= 0) {
                        bottom = '+' + offsetTop;
                    } else {
                        bottom = '-' + offsetTop * -1;
                    }
                }

                setTimeout(() => {
                    try {
                        $(this.elementRef.nativeElement).position({
                            my: this.horizontalAligment + ' top',
                            at: this.horizontalAligment + `{right} bottom${bottom}`,
                            of: target,
                            collision: 'flipfit'
                        });
                    } catch (ex) {
                        $(this.elementRef.nativeElement).position({
                            my: this.horizontalAligment + ' top',
                            at: this.horizontalAligment + `{right} bottom${bottom}`,
                            of: target.nativeElement,
                            collision: 'flipfit'
                        });
                    }

                    this.ref.markForCheck();
                });
            }
        }
    }

    private ngAfterViewInit(): void {
        $('body').append(this.elementRef.nativeElement);
    }

    //Eat events to document
    private onClick(event: MouseEvent) {
        event.stopPropagation();
    }

    private createGUID(): string {
        let guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let cryptoObj = window.crypto;
            let r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    }

    private ngOnDestroy() {
        if (this.visible) {
            this.hide();
        }
        $(this.elementRef.nativeElement).remove();
    }
}