import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'dropdown',
    template: `<div>
                <label id="dropdownLabel" for="dropdownSelect">{{displayLabel}}
                <select #dropdownSelect class="dropdownSelect" id="dropdownSelect-{{selectID}}" [style.width.px]="selectWidth" (change)="select.emit(dropdownSelect.value)">
                    <option *ngFor="let listValue of listValues | keys" label="{{listValue.key}}" [selected]="listValue.value == selectDefault">
                        {{listValue.value}}
                    </option>
                </select>
                </label>
              </div>`,
    styles: [`
            #dropdownLabel {
                /*float: left;
                position: relative;*/
                display: inline-block;
                font-size: 16px;
            }

            .dropdownSelect {
                /*float: left;
                margin-left: 7px;
                margin-top: 4px;*/
                padding-left: 10px;
                padding-right: 10px;
                font-family: "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif !important;
                color: #6b6b6b;
                font-size: 16px;
                display: block;
            }
    `]
})

export class DropDown {
    @Output() select = new EventEmitter();
    @Input() listValues: any[] = [];
    @Input() displayLabel: string = '';
    @Input() selectWidth: number;
    @Input() selectDefault: string;
    @Input() selectID: string;

    @ViewChild('dropdownSelect') dropDown: ElementRef;

    constructor() {
    }

    ngOnInit(): void {
        //this.select.emit(this.listValues[0]);
        //this.listValues = this.listData;
        
    }

    public ngAfterViewInit(): void {
        if (this.selectDefault)
            this.select.emit(this.dropDown.nativeElement.value);
    }
}