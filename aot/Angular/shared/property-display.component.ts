import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
	selector: 'property-display',
    templateUrl: 'property-display.component.html',
    styleUrls: ['property-display.component.css']
})
export class PropertyDisplay {
	@Input() label: string;
	@Input() image: string;
	@Input() value: string;
    @Input() uom: string;
    @Input() footerLabel: string;

    constructor(private Sanitizer: DomSanitizer) { }

    public getUom(): any {
        return this.Sanitizer.bypassSecurityTrustHtml(this.uom);
    }
}