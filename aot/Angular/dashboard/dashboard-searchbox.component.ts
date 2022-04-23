import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'dashboard-searchbox',
    template: `<div class="inputBox" [class.searchFocus]="searchFocus">
        <input #input id="inputSearchBox" type="text" (focus)="(searchFocus = true)" (blur)="(searchFocus = false)" (input)="update.emit(input.value)" placeholder="{{placeholder}}"/>
        <div (click)="input.value = null;update.emit(input.value)" *ngIf="input.value" class="input-clear"></div>
    <div>`,
    styleUrls: ['dashboard-searchbox.component.css', 'dashboard.component.css']
})

export class DashboardSearchBox implements OnInit {
    @Output() update = new EventEmitter();
    @Input() placeholder: any;

    public searchFocus: boolean = false;

    ngOnInit() {
        this.update.emit("");
    }
}