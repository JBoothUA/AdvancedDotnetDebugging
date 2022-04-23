var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectionStrategy, ElementRef, Output, EventEmitter } from '@angular/core';
var Joystick = /** @class */ (function () {
    function Joystick(elRef) {
        this.elRef = elRef;
        this.onMove = new EventEmitter();
    }
    Joystick.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.manager = require('nipplejs').create({
            zone: this.elRef.nativeElement,
            mode: 'static',
            position: { left: '50%', top: '50%' }
        });
        this.manager.on('move', function (evt, data) {
            _this.onMove.emit(data);
        });
        this.manager.on('start', function (evt, data) {
            $(_this.elRef.nativeElement).find('.back').addClass('moving');
        });
        this.manager.on('end', function (evt, data) {
            $(_this.elRef.nativeElement).find('.back').removeClass('moving');
        });
    };
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], Joystick.prototype, "onMove", void 0);
    Joystick = __decorate([
        Component({
            selector: 'joystick',
            template: '',
            styleUrls: ['joystick.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ElementRef])
    ], Joystick);
    return Joystick;
}());
export { Joystick };
//# sourceMappingURL=joystick.component.js.map