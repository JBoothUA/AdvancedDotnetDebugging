var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild, Input, EventEmitter, Output, ElementRef } from '@angular/core';
import { Modal } from './modal.component';
var ConfirmationDialog = /** @class */ (function () {
    function ConfirmationDialog(elementRef) {
        this.elementRef = elementRef;
        this.eventOnConfirm = new EventEmitter();
        this.eventOnCancel = new EventEmitter();
        this.title = " ";
        this.confirmIcon = "";
        this.confirmMessage = " ";
        this.confirmBtnText = 'Yes';
        this.cancelBtnText = 'Cancel';
    }
    ;
    ConfirmationDialog.prototype.ngAfterViewInit = function () {
        $('body').append(this.elementRef.nativeElement);
    };
    ConfirmationDialog.prototype.show = function () {
        this.confirmModal.show();
    };
    ConfirmationDialog.prototype.hide = function () {
        this.confirmModal.hide();
    };
    ConfirmationDialog.prototype.cancel = function () {
        this.eventOnCancel.emit();
        this.confirmModal.hide();
    };
    ConfirmationDialog.prototype.confirm = function () {
        this.eventOnConfirm.emit();
        this.confirmModal.hide();
    };
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], ConfirmationDialog.prototype, "eventOnConfirm", void 0);
    __decorate([
        Output(),
        __metadata("design:type", Object)
    ], ConfirmationDialog.prototype, "eventOnCancel", void 0);
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], ConfirmationDialog.prototype, "confirmModal", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ConfirmationDialog.prototype, "title", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ConfirmationDialog.prototype, "confirmIcon", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ConfirmationDialog.prototype, "confirmMessage", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ConfirmationDialog.prototype, "confirmBtnText", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], ConfirmationDialog.prototype, "cancelBtnText", void 0);
    ConfirmationDialog = __decorate([
        Component({
            selector: 'confirmation-dialog',
            templateUrl: 'confirmation-dialog.component.html'
        }),
        __metadata("design:paramtypes", [ElementRef])
    ], ConfirmationDialog);
    return ConfirmationDialog;
}());
export { ConfirmationDialog };
//# sourceMappingURL=confirmation-dialog.component.js.map