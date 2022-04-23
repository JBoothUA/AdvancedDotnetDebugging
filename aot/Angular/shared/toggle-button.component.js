var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter, HostListener, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
var TOGGLE_BUTTON_CONTROL_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return ToggleButton; }),
    multi: true
};
var ToggleButton = /** @class */ (function () {
    function ToggleButton() {
        this.onTouchedCallback = function (v) {
        };
        this.onChangeCallback = function (v) {
        };
        this.size = 'medium';
        this.change = new EventEmitter();
        this.color = '#4272a0'; //'rgb(100, 189, 99)';
        this.switchOffColor = '#a5a5a5';
        this.switchColor = '#fff';
        this.errorState = false;
        this.defaultBgColor = '#a5a5a5';
        this.defaultBoColor = '#dfdfdf';
    }
    Object.defineProperty(ToggleButton.prototype, "checked", {
        get: function () {
            return this._checked;
        },
        set: function (v) {
            this._checked = v !== false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToggleButton.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (v) {
            this._disabled = v !== false;
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ToggleButton.prototype, "reverse", {
        get: function () {
            return this._reverse;
        },
        set: function (v) {
            this._reverse = v !== false;
        },
        enumerable: true,
        configurable: true
    });
    ;
    ToggleButton.prototype.getColor = function (flag) {
        if (flag === 'borderColor')
            return this.defaultBoColor;
        if (flag === 'switchColor') {
            if (this.reverse)
                return !this.checked ? this.switchColor : this.switchOffColor || this.switchColor;
            return this.checked ? this.switchColor : this.switchOffColor || this.switchColor;
        }
        if (this.reverse)
            return !this.checked ? this.color : this.defaultBgColor;
        return this.checked ? this.color : this.defaultBgColor;
    };
    ToggleButton.prototype.onToggle = function (event) {
        event.stopPropagation();
        if (this.disabled)
            return;
        this.checked = !this.checked;
        this.change.emit(this.checked);
        this.onChangeCallback(this.checked);
        this.onTouchedCallback(this.checked);
    };
    ToggleButton.prototype.writeValue = function (obj) {
        if (obj !== this.checked) {
            this.checked = !!obj;
        }
    };
    ToggleButton.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    ToggleButton.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    ToggleButton.prototype.getChecked = function () {
        return this._checked;
    };
    ToggleButton.prototype.getOnToggle = function () {
        return (this._checked) ? "On" : "";
    };
    ToggleButton.prototype.getOffToggle = function () {
        return (!this._checked) ? "Off" : "";
    };
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], ToggleButton.prototype, "checked", null);
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], ToggleButton.prototype, "disabled", null);
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], ToggleButton.prototype, "reverse", null);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ToggleButton.prototype, "size", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], ToggleButton.prototype, "change", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ToggleButton.prototype, "color", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ToggleButton.prototype, "switchOffColor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ToggleButton.prototype, "switchColor", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], ToggleButton.prototype, "errorState", void 0);
    __decorate([
        HostListener('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], ToggleButton.prototype, "onToggle", null);
    ToggleButton = __decorate([
        Component({
            selector: 'toggle-button',
            templateUrl: 'toggle-button.component.html',
            styleUrls: ['toggle-button.component.css'],
            providers: [TOGGLE_BUTTON_CONTROL_VALUE_ACCESSOR]
        })
    ], ToggleButton);
    return ToggleButton;
}());
export { ToggleButton };
//# sourceMappingURL=toggle-button.component.js.map