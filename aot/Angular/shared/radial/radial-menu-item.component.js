var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { Component, Input, Output, ChangeDetectionStrategy, ElementRef, EventEmitter } from '@angular/core';
import { RadialMenuButtonImage } from './radial-menu-button-image.class';
var RadialMenuItem = /** @class */ (function () {
    function RadialMenuItem(elementRef) {
        this.elementRef = elementRef;
        this.loading = false;
        this.onAction = new EventEmitter();
    }
    RadialMenuItem.prototype.onclick = function () {
        this.onAction.emit();
        if (this.action && this.active) {
            this.action(this.id);
        }
    };
    RadialMenuItem.prototype.getImageSrc = function () {
        if (this.loading) {
            return '/Content/Images/Platforms/radial-loading-icon.png';
        }
        else {
            return this.image.ImageSrc;
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], RadialMenuItem.prototype, "id", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], RadialMenuItem.prototype, "name", void 0);
    __decorate([
        Input(),
        __metadata("design:type", RadialMenuButtonImage)
    ], RadialMenuItem.prototype, "image", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], RadialMenuItem.prototype, "hoverImage", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], RadialMenuItem.prototype, "action", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RadialMenuItem.prototype, "active", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RadialMenuItem.prototype, "visible", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RadialMenuItem.prototype, "selected", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RadialMenuItem.prototype, "error", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], RadialMenuItem.prototype, "loading", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], RadialMenuItem.prototype, "onAction", void 0);
    RadialMenuItem = __decorate([
        Component({
            selector: 'radial-menu-item',
            templateUrl: 'radial-menu-item.component.html',
            styleUrls: ['radial-menu.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ElementRef])
    ], RadialMenuItem);
    return RadialMenuItem;
}());
export { RadialMenuItem };
//# sourceMappingURL=radial-menu-item.component.js.map