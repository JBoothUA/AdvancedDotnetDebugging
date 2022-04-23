import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { APP_BASE_HREF } from '@angular/common';
import { PlatformModule } from '../platforms/_platform.module';
import { AlarmModule } from '../alarms/_alarm.module';
import { MapModule } from '../map/_map.module';
import { PatrolModule } from '../patrols/_patrol.module';
import { PatrolBuilderModule } from '../patrolBuilder/_patrol-builder.module';
import { HttpModule } from '@angular/http';
import { MapViewModule } from '../mapview/_mapview.module';
import { SharedModule } from '../shared/_shared.module';
import { DashboardModule } from '../dashboard/_dashboard.module';

import { SmartCommandRouting } from '../_app-routing.module';
import { Header } from '../header/header.component';
import { NotificationButton } from '../notifications/notification-button.component';
import { PatrolService } from '../patrols/patrol.service';
import { PatrolBuilderService } from '../patrolBuilder/patrol-builder.service';
import { PageNotFound } from '../not-found.component';
import { MainMenu } from '../mainmenu/main-menu.component';
import { MainMenuItem } from '../mainmenu/main-menu-item.component';
import { HttpService } from '../shared/http.service';
import { AlarmService } from '../alarms/alarm.service';
import { PlatformService } from '../platforms/platform.service';
import { UserService } from '../shared/user.service';
import { MockUserService } from '../test/mockUser.service';
import { MapService } from '../map/map.service';
import { PatrolMapService } from '../map/patrols/patrolMap.service';
import { AlarmMapService } from '../map/alarms/alarmMap.service';
import { PlatformMapService } from '../map/platforms/platformMap.service';
import { NavigationService } from '../shared/navigation.service';
import { StateResolveService } from '../shared/state-resolve.service';
import { LocationFilterService } from '../shared/location-filter.service';
import { WindowService } from '../shared/window.service';
import { LocationFilterPipe } from '../shared/location-filter.pipe';
import { MockHttpService } from '../test/mockHttp.service';

@NgModule({
    imports: [BrowserModule, FormsModule, HttpModule,
        PlatformModule, MapModule, AlarmModule,
        PatrolModule, PatrolBuilderModule, SharedModule, MapViewModule,
        SmartCommandRouting, DashboardModule, BrowserAnimationsModule],
    providers: [AlarmService, PlatformService, { provide: UserService, useClass: MockUserService },
        MapService, PatrolMapService, AlarmMapService,
        PlatformMapService, NavigationService, PatrolService,
        PatrolBuilderService, { provide: HttpService, useClass: MockHttpService }, StateResolveService,
        LocationFilterService, WindowService, LocationFilterPipe, { provide: APP_BASE_HREF, useValue: '/' }],
    declarations: [
        Header, NotificationButton,
        MainMenu, MainMenuItem, PageNotFound
    ],
})
export class TestModule { }