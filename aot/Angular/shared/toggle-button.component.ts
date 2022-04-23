import { Component, Input, Output, EventEmitter, HostListener, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";

const TOGGLE_BUTTON_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleButton),
    multi: true
};

@Component({
    selector: 'toggle-button',
    templateUrl: 'toggle-button.component.html',
    styleUrls: ['toggle-button.component.css'],
    providers: [TOGGLE_BUTTON_CONTROL_VALUE_ACCESSOR]
})

export class ToggleButton implements ControlValueAccessor {

    private onTouchedCallback = (v: any) => {
    };

    private onChangeCallback = (v: any) => {
    };

    private _checked: boolean;
    private _disabled: boolean;
    private _reverse: boolean;

    @Input() set checked(v: boolean) {
        this._checked = v !== false;
    }

    get checked() {
        return this._checked;
    }

    @Input() set disabled(v: boolean) {
        this._disabled = v !== false;
    };

    get disabled() {
        return this._disabled;
    }

    @Input() set reverse(v: boolean) {
        this._reverse = v !== false;
    };

    get reverse() {
        return this._reverse;
    }

    @Input() size: string = 'medium';
    @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() color: string = '#4272a0'; //'rgb(100, 189, 99)';
    @Input() switchOffColor: string = '#a5a5a5';
    @Input() switchColor: string = '#fff';
    @Input() errorState: boolean = false;
    defaultBgColor: string = '#a5a5a5';
    defaultBoColor: string = '#dfdfdf';

    getColor(flag?: string) {
        if (flag === 'borderColor') return this.defaultBoColor;
        if (flag === 'switchColor') {
            if (this.reverse) return !this.checked ? this.switchColor : this.switchOffColor || this.switchColor;
            return this.checked ? this.switchColor : this.switchOffColor || this.switchColor;
        }
        if (this.reverse) return !this.checked ? this.color : this.defaultBgColor;
        return this.checked ? this.color : this.defaultBgColor;
    }

    @HostListener('click', ['$event'])
    onToggle(event: MouseEvent) {
        event.stopPropagation();
        if (this.disabled) return;
        this.checked = !this.checked;
        this.change.emit(this.checked);
        this.onChangeCallback(this.checked);
        this.onTouchedCallback(this.checked);
    }

    writeValue(obj: any): void {
        if (obj !== this.checked) {
            this.checked = !!obj;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    getChecked(): boolean {
        return this._checked;
    }

    getOnToggle(): string {
        return (this._checked) ? "On" : "";
    }

    getOffToggle(): string {
        return (!this._checked) ? "Off" : "";
    }
}