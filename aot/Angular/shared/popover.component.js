var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ElementRef, ChangeDetectorRef, ViewChild, Input, HostBinding, Output, EventEmitter } from '@angular/core';
var Popover = /** @class */ (function () {
    function Popover(elementRef, ref) {
        this.elementRef = elementRef;
        this.ref = ref;
        this.visible = false;
        this.popoverId = this.createGUID();
        this.horizontalAligment = 'left';
        this.showTransition = this.visible;
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
    }
    Popover.prototype.show = function (target, offsetTop, offsetLeft) {
        var _this = this;
        if (this.visible) {
            this.hide();
        }
        else {
            //Close on scrolling
            $('*').bind('scroll.popover_' + this.popoverId, function (e) {
                _this.hide();
                _this.ref.detectChanges();
            });
            //Close on click
            setTimeout(function () {
                $(document).on('click.popover_' + _this.popoverId, function (e) {
                    _this.hide();
                    _this.ref.detectChanges();
                });
                $(document).on('contextmenu.popover_' + _this.popoverId, function (e) {
                    _this.hide();
                    _this.ref.detectChanges();
                });
            });
            this.visible = true;
            this.redraw(target, offsetTop, offsetLeft);
            this.onShow.next();
        }
    };
    Popover.prototype.hide = function () {
        this.visible = false;
        $('*').unbind('scroll.popover_' + this.popoverId);
        $(document).unbind('click.popover_' + this.popoverId);
        $(document).unbind('contextmenu.popover_' + this.popoverId);
        this.onHide.next();
    };
    Popover.prototype.redraw = function (target, offsetTop, offsetLeft) {
        var _this = this;
        if (!target) {
            setTimeout(function () {
                $(_this.elementRef.nativeElement).position({
                    my: 'right top',
                    at: 'right bottom',
                    of: _this.elementRef.nativeElement,
                    collision: 'flipfit'
                });
            });
        }
        else {
            if (target) {
                var right = '-10';
                var bottom_1 = '-5';
                if (offsetLeft) {
                    if (offsetLeft >= 0) {
                        right = '+' + offsetLeft;
                    }
                    else {
                        right = '-' + offsetLeft * -1;
                    }
                }
                if (offsetTop) {
                    if (offsetTop >= 0) {
                        bottom_1 = '+' + offsetTop;
                    }
                    else {
                        bottom_1 = '-' + offsetTop * -1;
                    }
                }
                setTimeout(function () {
                    try {
                        $(_this.elementRef.nativeElement).position({
                            my: _this.horizontalAligment + ' top',
                            at: _this.horizontalAligment + ("{right} bottom" + bottom_1),
                            of: target,
                            collision: 'flipfit'
                        });
                    }
                    catch (ex) {
                        $(_this.elementRef.nativeElement).position({
                            my: _this.horizontalAligment + ' top',
                            at: _this.horizontalAligment + ("{right} bottom" + bottom_1),
                            of: target.nativeElement,
                            collision: 'flipfit'
                        });
                    }
                    _this.ref.markForCheck();
                });
            }
        }
    };
    Popover.prototype.ngAfterViewInit = function () {
        $('body').append(this.elementRef.nativeElement);
    };
    //Eat events to document
    Popover.prototype.onClick = function (event) {
        event.stopPropagation();
    };
    Popover.prototype.createGUID = function () {
        var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var cryptoObj = window.crypto;
            var r = cryptoObj.getRandomValues(new Uint8Array(1))[0] % 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return guid;
    };
    Popover.prototype.ngOnDestroy = function () {
        if (this.visible) {
            this.hide();
        }
        $(this.elementRef.nativeElement).remove();
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], Popover.prototype, "horizontalAligment", void 0);
    __decorate([
        ViewChild('modal'),
        __metadata("design:type", ElementRef)
    ], Popover.prototype, "modal", void 0);
    __decorate([
        HostBinding('class.transition'),
        __metadata("design:type", Boolean)
    ], Popover.prototype, "showTransition", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], Popover.prototype, "onShow", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], Popover.prototype, "onHide", void 0);
    Popover = __decorate([
        Component({
            selector: 'popover',
            templateUrl: 'popover.component.html',
            styleUrls: ['popover.component.css'],
        }),
        __metadata("design:paramtypes", [ElementRef, ChangeDetectorRef])
    ], Popover);
    return Popover;
}());
export { Popover };
//# sourceMappingURL=popover.component.js.map