var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, ChangeDetectorRef } from '@angular/core';
import { slideRight } from '../shared/animations';
import { MapService } from '../map/map.service';
import { NavigationService } from '../shared/navigation.service';
import { HttpService } from '../shared/http.service';
import { UserService } from '../shared/user.service';
import { PlatformService } from '../platforms/platform.service';
import 'rxjs/add/operator/takeUntil';
import { Subject } from 'rxjs/Subject';
var MainMenuItemDef = /** @class */ (function () {
    function MainMenuItemDef(id, text, imageSrc, routerLink) {
        this.Id = id;
        this.Text = text;
        this.ImageSrc = imageSrc;
        this.RouterLink = routerLink;
    }
    return MainMenuItemDef;
}());
export { MainMenuItemDef };
var MainMenu = /** @class */ (function () {
    function MainMenu(NavigationService, MapService, HttpService, UserService, platformService, ref) {
        var _this = this;
        this.NavigationService = NavigationService;
        this.MapService = MapService;
        this.HttpService = HttpService;
        this.UserService = UserService;
        this.platformService = platformService;
        this.ref = ref;
        this.ThumbnailSrc = '../../Content/Images/avatar-icon.png';
        this.MenuItems = [];
        this.ngUnsubscribe = new Subject();
        if (UserService.currentUser.roles && UserService.currentUser.roles.indexOf('SCAdmin') > -1) {
            this.ScAdmin = true;
        }
        this.HttpService.post('/account/GetUserThumbnail', null, null, true).then(function (res) {
            if (res.image) {
                _this.ThumbnailSrc = res.image;
            }
        });
        this.MenuItems.push(new MainMenuItemDef('Dashboard', 'Dashboard', '/Content/Images/Menu/dashboard-icon.png', '/Dashboard'));
        this.MenuItems.push(new MainMenuItemDef('Map View', 'Map View', '/Content/Images/Menu/map-view-icon.png', '/MapView'));
    }
    MainMenu.prototype.animationDone = function ($event) {
        if (!this.NavigationService.RouteChanging) {
            this.MapService.refreshMap();
            this.NavigationService.onMainMenuToggled.next();
        }
    };
    MainMenu.prototype.ngOnInit = function () {
        var _this = this;
        this.platformService.onPlatformsLoaded
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function () {
                //Nav to the first platform in the list
                if (_this.platformService.platforms.length > 0) {
                    _this.menuItem_robotMonitor = new MainMenuItemDef('Robot Monitor', 'Robot Monitor', '/Content/Images/Menu/robot-monitor-icon.png', '/RobotMonitor/' + _this.platformService.platforms.sort(_this.platformService.sortbyDisplayNameAscFunc)[0].id);
                    var existingItem = _this.MenuItems.find(function (item) {
                        return item.Id === 'Robot Monitor';
                    });
                    if (existingItem) {
                        existingItem = _this.menuItem_robotMonitor;
                    }
                    else {
                        _this.MenuItems.push(_this.menuItem_robotMonitor);
                    }
                }
            }
        });
        this.platformService.platformSelected
            .takeUntil(this.ngUnsubscribe)
            .subscribe({
            next: function (platformId) {
                if (platformId) {
                    _this.menuItem_robotMonitor.RouterLink = '/RobotMonitor/' + platformId;
                }
                else {
                    _this.menuItem_robotMonitor.RouterLink = '/RobotMonitor/' + _this.platformService.platforms.sort(_this.platformService.sortbyDisplayNameAscFunc)[0].id;
                }
            }
        });
    };
    MainMenu.prototype.ngOnDestroy = function () {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    };
    MainMenu.prototype.openAboutDialog = function () {
        this.NavigationService.openAboutDialog();
    };
    MainMenu.prototype.openHelpWindow = function () {
        this.helpWindow = window.open('/Help', '_blank');
    };
    MainMenu = __decorate([
        Component({
            selector: 'main-menu',
            templateUrl: 'main-menu.component.html',
            styleUrls: ['main-menu.component.css'],
            animations: [
                slideRight
            ]
        }),
        __metadata("design:paramtypes", [NavigationService, MapService,
            HttpService, UserService, PlatformService, ChangeDetectorRef])
    ], MainMenu);
    return MainMenu;
}());
export { MainMenu };
//# sourceMappingURL=main-menu.component.js.map