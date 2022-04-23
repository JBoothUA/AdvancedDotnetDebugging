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
import { PlatformService } from '../../platforms/platform.service';
import { PlatformCommand, CommandName } from '../../patrols/action.class';
var GoToLocationDialog = /** @class */ (function () {
    function GoToLocationDialog(platformService) {
        var _this = this;
        this.platformService = platformService;
        this.ngUnsubscribe = new Subject();
        this.platformService.showGoToLocationDialog
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platform) { return _this.show(platform); }
        });
    }
    GoToLocationDialog.prototype.show = function (platform) {
        this.platform = platform;
        this.goToLocationModal.show();
    };
    GoToLocationDialog.prototype.hide = function () {
        this.goToLocationModal.hide();
    };
    GoToLocationDialog.prototype.cancelGoToLocation = function () {
        this.platformService.executePlatformCommand(new PlatformCommand(this.platform.id, CommandName.CancelGoal));
        this.hide();
    };
    GoToLocationDialog.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    __decorate([
        ViewChild(Modal),
        __metadata("design:type", Modal)
    ], GoToLocationDialog.prototype, "goToLocationModal", void 0);
    GoToLocationDialog = __decorate([
        Component({
            selector: 'go-to-location-dialog',
            templateUrl: 'go-to-location-dialog.component.html'
        }),
        __metadata("design:paramtypes", [PlatformService])
    ], GoToLocationDialog);
    return GoToLocationDialog;
}());
export { GoToLocationDialog };
//# sourceMappingURL=go-to-location-dialog.component.js.map