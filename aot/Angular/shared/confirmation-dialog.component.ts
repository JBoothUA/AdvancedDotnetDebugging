import {
    Component, ViewChild, Input,
    EventEmitter, Output, ElementRef
} from '@angular/core';
import { DialogOptions } from './dialog-options';
import { Modal } from './modal.component';

@Component({
    selector: 'confirmation-dialog',
    templateUrl: 'confirmation-dialog.component.html'
})
export class ConfirmationDialog {
    @Output() eventOnConfirm = new EventEmitter();
    @Output() eventOnCancel = new EventEmitter();
    @ViewChild(Modal) confirmModal: Modal;
	@Input() title: string = " ";
	@Input() confirmIcon: string = "";
    @Input() confirmMessage: string = " ";
    @Input() confirmBtnText: string = 'Yes';
	@Input() cancelBtnText: string = 'Cancel';

    constructor(private elementRef: ElementRef) { };

    private ngAfterViewInit(): void {
        $('body').append(this.elementRef.nativeElement);
    }

    public show():void {
		this.confirmModal.show();
    }

    public hide(): void {
        this.confirmModal.hide();
    }

    public cancel(): void {
        this.eventOnCancel.emit();
        this.confirmModal.hide();
    }

    public confirm(): void {
        this.eventOnConfirm.emit();
        this.confirmModal.hide();
    }
}