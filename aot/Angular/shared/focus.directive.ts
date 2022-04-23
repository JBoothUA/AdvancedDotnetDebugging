import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
	selector: '[focus]',
})

export class FocusDirective {
	element: any;

	constructor(el: ElementRef) {
		this.element = el;
	}
	@Input('focus') focus: boolean;
	ngOnChanges(): void {
		if (this.focus) {
			this.element.nativeElement.focus();
		}
	}	
}
