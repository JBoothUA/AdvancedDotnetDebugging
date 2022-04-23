var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { PlatformModule } from './platforms/_platform.module';
import { AlarmModule } from './alarms/_alarm.module';
import { MapModule } from './map/_map.module';
import { PatrolModule } from './patrols/_patrol.module';
import { PatrolBuilderModule } from './patrolBuilder/_patrol-builder.module';
import { HttpModule } from '@angular/http';
import { SharedModule } from './shared/_shared.module';
import { DragulaModule } from 'ng2-dragula';
import { AdministratorModule } from './admin/_admin.module';
import { NotificationModule } from './notifications/_notification.module';
import { SmartCommand } from './app.component';
import { SmartCommandRouting } from './_app-routing.module';
import { ApplicationErrorHandler } from './application-errors';
import { ApplicationInsightsService } from './application-insights.service';
import { Header } from './header/header.component';
import { AboutDialog } from './shared/about/about-dialog.component';
import { PatrolService } from './patrols/patrol.service';
import { PatrolBuilderService } from './patrolBuilder/patrol-builder.service';
import { PageNotFound } from './not-found.component';
import { MainMenu } from './mainmenu/main-menu.component';
import { MainMenuItem } from './mainmenu/main-menu-item.component';
import { HttpService } from './shared/http.service';
import { AlarmService } from './alarms/alarm.service';
import { PlatformService } from './platforms/platform.service';
import { UserService } from './shared/user.service';
import { MapService } from './map/map.service';
import { PatrolMapService } from './map/patrols/patrolMap.service';
import { AlarmMapService } from './map/alarms/alarmMap.service';
import { PlatformMapService } from './map/platforms/platformMap.service';
import { NavigationService } from './shared/navigation.service';
import { StateResolveService } from './shared/state-resolve.service';
import { LocationFilterService } from './shared/location-filter.service';
import { WindowService } from './shared/window.service';
import { LocationFilterPipe } from './shared/location-filter.pipe';
import { LocationMapService } from './map/locations/locationMap.service';
import { TimerService } from './shared/timer.service';
import { MediaService } from './shared/media/media.service';
import { AppSettings } from './shared/app-settings';
import { MapUtilityService } from './map/map-utility.service';
import { HubService } from './shared/hub.service';
var SmartCommandModule = /** @class */ (function () {
    function SmartCommandModule() {
    }
    SmartCommandModule = __decorate([
        NgModule({
            imports: [BrowserModule, FormsModule, HttpModule, DragulaModule,
                PlatformModule, MapModule, AlarmModule, NotificationModule,
                PatrolModule, PatrolBuilderModule, SharedModule,
                SmartCommandRouting, BrowserAnimationsModule, AdministratorModule
            ],
            providers: [{ provide: ErrorHandler, useClass: ApplicationErrorHandler }, ApplicationInsightsService,
                HubService, AlarmService, PlatformService, UserService,
                MapService, PatrolMapService, AlarmMapService,
                PlatformMapService, NavigationService, PatrolService,
                PatrolBuilderService, HttpService, StateResolveService,
                LocationFilterService, WindowService, LocationFilterPipe,
                LocationMapService, TimerService, MediaService, AppSettings,
                MapUtilityService
            ],
            declarations: [
                SmartCommand, Header,
                AboutDialog, MainMenu, MainMenuItem, PageNotFound
            ],
            bootstrap: [SmartCommand]
        })
    ], SmartCommandModule);
    return SmartCommandModule;
}());
export { SmartCommandModule };
//# sourceMappingURL=_app.module.js.map