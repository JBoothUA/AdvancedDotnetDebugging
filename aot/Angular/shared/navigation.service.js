var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Router } from '@angular/router';
var NavigationService = /** @class */ (function () {
    function NavigationService(Router) {
        this.Router = Router;
        this.MainMenuState = 'in';
        this.CurrentRoute = 'Map View';
        this.RouteChanging = false;
        this.onMainMenuToggled = new Subject();
        this.openAboutDialogSub = new Subject();
    }
    NavigationService.prototype.toggleMainMenu = function () {
        this.MainMenuState = this.MainMenuState === 'out' ? 'in' : 'out';
    };
    NavigationService.prototype.openMainMenu = function () {
        this.MainMenuState = 'out';
    };
    NavigationService.prototype.closeMainMenu = function () {
        this.MainMenuState = 'in';
    };
    NavigationService.prototype.setCurrentRoute = function (routeTitle) {
        this.CurrentRoute = routeTitle;
    };
    NavigationService.prototype.navigate = function (routerLink, data) {
        this.Router.navigate((data ? [routerLink, data] : [routerLink]));
    };
    NavigationService.prototype.openAboutDialog = function () {
        this.openAboutDialogSub.next();
    };
    NavigationService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [Router])
    ], NavigationService);
    return NavigationService;
}());
export { NavigationService };
//# sourceMappingURL=navigation.service.js.map