var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, Input, ElementRef, NgZone } from '@angular/core';
var DraggableDirective = /** @class */ (function () {
    function DraggableDirective(elementRef, zone) {
        this.elementRef = elementRef;
        this.zone = zone;
        this.enabled = true;
    }
    DraggableDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.enabled) {
            this.zone.runOutsideAngular(function () {
                $(_this.handle).css('cursor', 'move');
                $(_this.elementRef.nativeElement).draggable({
                    containment: _this.container,
                    handle: _this.handle
                });
            });
        }
    };
    __decorate([
        Input('draggable'),
        __metadata("design:type", String)
    ], DraggableDirective.prototype, "container", void 0);
    __decorate([
        Input('handle'),
        __metadata("design:type", String)
    ], DraggableDirective.prototype, "handle", void 0);
    __decorate([
        Input('enabled'),
        __metadata("design:type", Boolean)
    ], DraggableDirective.prototype, "enabled", void 0);
    DraggableDirective = __decorate([
        Directive({
            selector: '[draggable]'
        }),
        __metadata("design:paramtypes", [ElementRef, NgZone])
    ], DraggableDirective);
    return DraggableDirective;
}());
export { DraggableDirective };
//# sourceMappingURL=draggable.directive.js.map