var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, ElementRef, Input } from '@angular/core';
var FocusDirective = /** @class */ (function () {
    function FocusDirective(el) {
        this.element = el;
    }
    FocusDirective.prototype.ngOnChanges = function () {
        if (this.focus) {
            this.element.nativeElement.focus();
        }
    };
    __decorate([
        Input('focus'),
        __metadata("design:type", Boolean)
    ], FocusDirective.prototype, "focus", void 0);
    FocusDirective = __decorate([
        Directive({
            selector: '[focus]',
        }),
        __metadata("design:paramtypes", [ElementRef])
    ], FocusDirective);
    return FocusDirective;
}());
export { FocusDirective };
//# sourceMappingURL=focus.directive.js.map