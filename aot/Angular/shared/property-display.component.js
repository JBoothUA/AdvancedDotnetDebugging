var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
var PropertyDisplay = /** @class */ (function () {
    function PropertyDisplay(Sanitizer) {
        this.Sanitizer = Sanitizer;
    }
    PropertyDisplay.prototype.getUom = function () {
        return this.Sanitizer.bypassSecurityTrustHtml(this.uom);
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PropertyDisplay.prototype, "label", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PropertyDisplay.prototype, "image", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PropertyDisplay.prototype, "value", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PropertyDisplay.prototype, "uom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], PropertyDisplay.prototype, "footerLabel", void 0);
    PropertyDisplay = __decorate([
        Component({
            selector: 'property-display',
            templateUrl: 'property-display.component.html',
            styleUrls: ['property-display.component.css']
        }),
        __metadata("design:paramtypes", [DomSanitizer])
    ], PropertyDisplay);
    return PropertyDisplay;
}());
export { PropertyDisplay };
//# sourceMappingURL=property-display.component.js.map