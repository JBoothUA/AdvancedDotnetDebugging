var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef, Input, ViewChild, ApplicationRef, Output, EventEmitter, ElementRef } from '@angular/core';
import { DialogOptions } from './dialog-options';
var Modal = /** @class */ (function () {
    function Modal(changeDetect, applicationRef) {
        this.changeDetect = changeDetect;
        this.applicationRef = applicationRef;
        this.hideFooter = false;
        this.hideHeader = false;
        this.disableDraggable = false;
        this.onCancel = new EventEmitter();
        this.dialogOptions = new DialogOptions();
        this.dialogOptions.visible = false;
        this.dialogOptions.animatedOpaque = false;
    }
    Modal.prototype.show = function () {
        var _this = this;
        this.dialogOptions.visible = true;
        setTimeout(function () {
            _this.dialogOptions.animatedOpaque = true;
            _this.changeDetect.detectChanges();
        });
    };
    Modal.prototype.hide = function () {
        var _this = this;
        this.dialogOptions.animatedOpaque = false;
        setTimeout(function () {
            _this.modalContent.nativeElement.style.left = '';
            _this.modalContent.nativeElement.style.top = '';
            _this.dialogOptions.visible = false;
            _this.changeDetect.detectChanges();
        }, 1000);
    };
    Modal.prototype.handleCancel = function () {
        this.onCancel.emit();
        this.hide();
    };
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], Modal.prototype, "hideFooter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], Modal.prototype, "hideHeader", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], Modal.prototype, "disableDraggable", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], Modal.prototype, "width", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], Modal.prototype, "onCancel", void 0);
    __decorate([
        ViewChild('modalContent'),
        __metadata("design:type", ElementRef)
    ], Modal.prototype, "modalContent", void 0);
    Modal = __decorate([
        Component({
            selector: 'modal',
            templateUrl: 'modal.component.html'
        }),
        __metadata("design:paramtypes", [ChangeDetectorRef, ApplicationRef])
    ], Modal);
    return Modal;
}());
export { Modal };
//# sourceMappingURL=modal.component.js.map