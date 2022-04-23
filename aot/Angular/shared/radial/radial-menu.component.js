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
import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { RadialMenuItem } from './radial-menu-item.component';
var RadialMenu = /** @class */ (function () {
    function RadialMenu(changeDetectorRef, elementRef) {
        var _this = this;
        this.changeDetectorRef = changeDetectorRef;
        this.elementRef = elementRef;
        this.buttons = [];
        // The higher the factor, the larger the diameter of the menu
        this.sizeFactor = 35;
        this.eventName = 'radial';
        this.open = false;
        this.closeOnClick = true;
        this.closeMenu = function (event) {
            if (event) {
                event.preventDefault();
            }
            _this.menu.nativeElement.classList.remove('open');
            _this.open = false;
            $(document).off('click.' + _this.eventName);
            $(document).off('contextmenu.' + _this.eventName);
            _this.onClose();
        };
    }
    RadialMenu.prototype.ngAfterViewInit = function () {
        if (this.buttonList) {
            var list = this.buttonList.toArray();
            for (var i = 0, l = list.length; i < l; i++) {
                list[i].elementRef.nativeElement.style.left = (50 - this.sizeFactor * Math.cos(-0.5 * Math.PI + 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
                list[i].elementRef.nativeElement.style.top = (50 + this.sizeFactor * Math.sin(-0.5 * Math.PI + 2 * (1 / l) * i * Math.PI)).toFixed(4) + "%";
            }
        }
    };
    RadialMenu.prototype.toggleMenu = function (event) {
        event.stopPropagation();
        if (this.open) {
            this.closeMenu();
        }
        else {
            this.openMenu();
        }
        this.changeDetectorRef.detectChanges();
    };
    RadialMenu.prototype.checkClick = function (event) {
        if (this.elementRef.nativeElement !== event.target && !$.contains(this.elementRef.nativeElement, event.target)) {
            this.closeMenu();
        }
    };
    RadialMenu.prototype.openMenu = function () {
        var _this = this;
        this.menu.nativeElement.classList.add('open');
        this.open = true;
        $(document).on('click.' + this.eventName, function (e) {
            _this.checkClick(e);
        });
        $(document).on('contextmenu.' + this.eventName, function (e) {
            _this.checkClick(e);
        });
        this.onOpen();
    };
    RadialMenu.prototype.onOpen = function () {
        // For override
    };
    RadialMenu.prototype.onClose = function () {
        // For override
    };
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], RadialMenu.prototype, "buttons", void 0);
    __decorate([
        ViewChild('menu'),
        __metadata("design:type", ElementRef)
    ], RadialMenu.prototype, "menu", void 0);
    __decorate([
        ViewChildren(RadialMenuItem),
        __metadata("design:type", QueryList)
    ], RadialMenu.prototype, "buttonList", void 0);
    RadialMenu = __decorate([
        Component({
            selector: 'radial-menu',
            templateUrl: 'radial-menu.component.html',
            styleUrls: ['radial-menu.component.css'],
            changeDetection: ChangeDetectionStrategy.OnPush
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef, ElementRef])
    ], RadialMenu);
    return RadialMenu;
}());
export { RadialMenu };
//# sourceMappingURL=radial-menu.component.js.map