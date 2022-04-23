import {
    Component, ChangeDetectorRef, Input, ViewChild,
    ApplicationRef, Output, EventEmitter, ElementRef
} from '@angular/core';
import { DialogOptions } from './dialog-options';

@Component({
	selector: 'modal',
	templateUrl: 'modal.component.html'
})
export class Modal {
	dialogOptions: DialogOptions;
    @Input() hideFooter: boolean = false;
    @Input() hideHeader: boolean = false;
    @Input() disableDraggable: boolean = false;
    @Input() width: string;
    @Output() onCancel = new EventEmitter();
    @ViewChild('modalContent') modalContent: ElementRef;

	constructor(private changeDetect: ChangeDetectorRef, private applicationRef: ApplicationRef) {
        this.dialogOptions = new DialogOptions();
        this.dialogOptions.visible = false;
		this.dialogOptions.animatedOpaque = false;
    }
	show(): void {
		this.dialogOptions.visible = true;
        setTimeout(() => {
            this.dialogOptions.animatedOpaque = true;
			this.changeDetect.detectChanges();
        });
	}
	hide(): void {
		this.dialogOptions.animatedOpaque = false;
        setTimeout(() => {
            this.modalContent.nativeElement.style.left = '';
            this.modalContent.nativeElement.style.top = '';

            this.dialogOptions.visible = false;
			this.changeDetect.detectChanges();
        }, 1000);
    }

    public handleCancel(): void {
        this.onCancel.emit();
        this.hide();
    } 
}
