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
import { NavigationService } from '../shared/navigation.service';
var MainMenuItem = /** @class */ (function () {
    function MainMenuItem(NavigationService) {
        this.NavigationService = NavigationService;
    }
    MainMenuItem.prototype.followRoute = function () {
        var _this = this;
        this.NavigationService.closeMainMenu();
        setTimeout(function () { _this.NavigationService.navigate(_this.RouterLink); }, 400);
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MainMenuItem.prototype, "Id", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MainMenuItem.prototype, "Text", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MainMenuItem.prototype, "ImageSrc", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MainMenuItem.prototype, "RouterLink", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], MainMenuItem.prototype, "Selected", void 0);
    MainMenuItem = __decorate([
        Component({
            selector: 'main-menu-item',
            templateUrl: 'main-menu-item.component.html',
            styleUrls: ['main-menu-item.component.css'],
        }),
        __metadata("design:paramtypes", [NavigationService])
    ], MainMenuItem);
    return MainMenuItem;
}());
export { MainMenuItem };
//# sourceMappingURL=main-menu-item.component.js.map