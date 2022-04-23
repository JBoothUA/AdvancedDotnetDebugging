var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavigationService } from '../shared/navigation.service';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppSettings } from '../shared/app-settings';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
var Header = /** @class */ (function () {
    function Header(navigationService, router, activatedRoute, appSettings) {
        this.navigationService = navigationService;
        this.router = router;
        this.activatedRoute = activatedRoute;
        this.appSettings = appSettings;
        this.displayHeader = true;
    }
    Header.prototype.ngOnInit = function () {
        var _this = this;
        this.router.events
            .filter(function (event) { return event instanceof NavigationEnd; })
            .map(function () { return _this.activatedRoute; })
            .map(function (route) {
            while (route.firstChild)
                route = route.firstChild;
            return route;
        })
            .filter(function (route) { return route.outlet === 'primary'; })
            .mergeMap(function (route) { return route.data; })
            .subscribe(function (event) {
            _this.pageHeader = (event['title']);
            _this.displayHeader = (event['displayHeader']);
            _this.appSettings.fullScreenMode = (event['fullScreen']);
        });
    };
    Header.prototype.openMainMenu = function () {
        this.navigationService.openMainMenu();
    };
    Header.prototype.closeMainMenu = function () {
        this.navigationService.closeMainMenu();
    };
    Header.prototype.openAboutDialog = function () {
        this.navigationService.openAboutDialog();
    };
    Header.prototype.openHelpWindow = function () {
        this.helpWindow = window.open('/Help/index.htm#Overview.htm', '_blank');
    };
    Header = __decorate([
        Component({
            selector: 'app-header',
            templateUrl: 'header.component.html'
        }),
        __metadata("design:paramtypes", [NavigationService,
            Router,
            ActivatedRoute,
            AppSettings])
    ], Header);
    return Header;
}());
export { Header };
//# sourceMappingURL=header.component.js.map