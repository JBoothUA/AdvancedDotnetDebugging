var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ViewChild } from '@angular/core';
import { Modal } from '../../shared/modal.component';
import { Subject } from 'rxjs/Subject';
import { NavigationService } from '../navigation.service';
import { Router, NavigationStart } from '@angular/router';
var AboutDialog = /** @class */ (function () {
    function AboutDialog(navigation, router) {
        var _this = this;
        this.navigation = navigation;
        this.router = router;
        this.ngUnsubscribe = new Subject();
        this.navigation.openAboutDialogSub
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (obj) { return _this.show(); }
        });
        router.events
            .takeUntil(this.ngUnsubscribe)
            .subscribe(function (event) {
            if (event instanceof NavigationStart && _this.visible) {
                _this.hide();
            }
        });
    }
    AboutDialog.prototype.ngOnDestroy = function () {
    };
    AboutDialog.prototype.show = function () {
        this.aboutModal.show();
    };
    AboutDialog.prototype.hide = function () {
        this.aboutModal.hide();
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], AboutDialog.prototype, "aboutModal", void 0);
    AboutDialog = __decorate([
        Component({
            selector: 'about-dialog',
            templateUrl: 'about-dialog.component.html',
            styleUrls: ['about-dialog.component.css']
        }),
        __metadata("design:paramtypes", [NavigationService, Router])
    ], AboutDialog);
    return AboutDialog;
}());
export { AboutDialog };
//# sourceMappingURL=about-dialog.component.js.map