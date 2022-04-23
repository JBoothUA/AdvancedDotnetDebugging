var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
import { PlatformService } from './platform.service';
var PlatformContextMenu = /** @class */ (function () {
    function PlatformContextMenu(platformService, elementRef, changeDetectorRef) {
        var _this = this;
        this.platformService = platformService;
        this.elementRef = elementRef;
        this.changeDetectorRef = changeDetectorRef;
        this.visible = false;
        this.ngUnsubscribe = new Subject();
        this.hide = function () {
            if (event) {
                event.preventDefault();
            }
            _this.visible = false;
            _this.platform = undefined;
        };
        this.closeMenu = function (event) {
            if (event) {
                event.preventDefault();
            }
            _this.platform = undefined;
            _this.visible = false;
            $(document).off('click.platformContext');
            $(document).off('contextmenu.platformContext');
            _this.platformService.platformCommandDialogClosed.next();
            _this.changeDetectorRef.detectChanges();
        };
        this.platformService.openPlatformActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) { return _this.show(obj); }
        });
        this.platformService.closePlatformActionMenuSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () { return _this.closeMenu(); }
        });
    }
    PlatformContextMenu.prototype.ngAfterViewInit = function () {
        $('body').append(this.elementRef.nativeElement);
    };
    PlatformContextMenu.prototype.show = function (obj) {
        var _this = this;
        if (this.platform) {
            if (this.platform.id === obj.platform.id) {
                this.closeMenu();
                return;
            }
            this.closeMenu();
        }
        this.platform = obj.platform;
        this.visible = true;
        if (!obj.target) {
            setTimeout(function () {
                $(_this.elementRef.nativeElement).position({
                    my: 'right top',
                    at: 'right bottom',
                    of: obj.event,
                    collision: 'flipfit'
                });
            });
        }
        else {
            if (obj.target.nativeElement) {
                var right_1 = '-10';
                var bottom_1 = '-5';
                if (obj.offsetLeft) {
                    if (obj.offsetLeft >= 0) {
                        right_1 = '+' + obj.offsetLeft;
                    }
                    else {
                        right_1 = '-' + obj.offsetLeft * -1;
                    }
                }
                if (obj.offsetTop) {
                    if (obj.offsetTop >= 0) {
                        bottom_1 = '+' + obj.offsetTop;
                    }
                    else {
                        bottom_1 = '-' + obj.offsetTop * -1;
                    }
                }
                setTimeout(function () {
                    $(_this.elementRef.nativeElement).position({
                        my: 'right top',
                        at: "right" + right_1 + " bottom" + bottom_1,
                        of: obj.target.nativeElement,
                        collision: 'flipfit'
                    });
                });
            }
        }
        $(document).on('click.platformContext', function (e) {
            _this.checkClick(e);
        });
        $(document).on('contextmenu.platformContext', function (e) {
            _this.checkClick(e);
        });
        obj.event.stopPropagation();
        this.changeDetectorRef.detectChanges();
    };
    PlatformContextMenu.prototype.checkClick = function (event) {
        if (event.target.classList.contains('closeOnClick') ||
            (this.elementRef.nativeElement !== event.target && !$.contains(this.elementRef.nativeElement, event.target))) {
            event.stopPropagation();
            this.closeMenu();
        }
    };
    PlatformContextMenu.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    PlatformContextMenu = __decorate([
        Component({
            selector: 'platform-context-menu',
            templateUrl: 'platform-context-menu.component.html',
            styleUrls: ['platform-context-menu.component.css'],
        }),
        __metadata("design:paramtypes", [PlatformService, ElementRef, ChangeDetectorRef])
    ], PlatformContextMenu);
    return PlatformContextMenu;
}());
export { PlatformContextMenu };
//# sourceMappingURL=platform-context-menu.component.js.map