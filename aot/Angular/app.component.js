var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, NgZone, HostListener } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { PatrolService } from './patrols/patrol.service';
import { AlarmService } from './alarms/alarm.service';
import { PlatformService } from './platforms/platform.service';
import { UserService } from './shared/user.service';
import { NavigationService } from './shared/navigation.service';
import { WindowService } from './shared/window.service';
import { AppSettings } from './shared/app-settings';
import { HubService } from './shared/hub.service';
import { ApplicationInsightsService } from './application-insights.service';
var SmartCommand = /** @class */ (function () {
    function SmartCommand(router, patrolService, ngZone, navigationService, hubService, alarmService, userService, platformService, windowService, appSettings, appInsights) {
        var _this = this;
        this.router = router;
        this.patrolService = patrolService;
        this.ngZone = ngZone;
        this.navigationService = navigationService;
        this.hubService = hubService;
        this.alarmService = alarmService;
        this.userService = userService;
        this.platformService = platformService;
        this.windowService = windowService;
        this.appSettings = appSettings;
        this.appInsights = appInsights;
        this.loading = true;
        this.appSettings.showNotificationPanel = false;
        this.appSettings.showNotificationPopup = false;
        router.events.subscribe(function (event) {
            _this._navigationInterceptor(event);
        });
        window['Application'] = {
            zone: ngZone,
            appSettings: this.appSettings
        };
    }
    // Shows and hides the loading spinner during RouterEvent changes
    SmartCommand.prototype._navigationInterceptor = function (event) {
        if (event instanceof NavigationStart) {
            this.loading = true;
            this.navigationService.RouteChanging = true;
            this.appInsights.trackPageView(event.url);
        }
        if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            this.hideLoading();
        }
    };
    SmartCommand.prototype.hideLoading = function () {
        this.loading = false;
        this.navigationService.RouteChanging = false;
    };
    //Close any open windows
    SmartCommand.prototype.killAllWindows = function ($event) {
        this.windowService.killAllWindows();
    };
    __decorate([
        HostListener('window:beforeunload', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], SmartCommand.prototype, "killAllWindows", null);
    SmartCommand = __decorate([
        Component({
            selector: 'smart-command',
            templateUrl: 'app.component.html'
        }),
        __metadata("design:paramtypes", [Router, PatrolService, NgZone, NavigationService,
            HubService, AlarmService, UserService, PlatformService,
            WindowService, AppSettings, ApplicationInsightsService])
    ], SmartCommand);
    return SmartCommand;
}());
export { SmartCommand };
//# sourceMappingURL=app.component.js.map